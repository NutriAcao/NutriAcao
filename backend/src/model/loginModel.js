//refatorado
import { supabase } from "../config/supabaseClient.js";

export async function buscarUsuarioPorEmail(email) {
    try {
        console.log('Buscando usuário por email:', email);
        
        // Busca direto na tabela usuarios (única fonte de verdade para login)
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                empresas (*),
                ongs (*)
            `)
            .eq('email', email)
            .eq('ativo', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log('Usuário não encontrado:', email);
                return null;
            }
            throw new Error('Erro ao buscar usuário: ' + error.message);
        }

        if (!data) {
            console.log('Nenhum usuário encontrado com este email');
            return null;
        }

        console.log('Usuário encontrado:', { 
            id: data.id, 
            email: data.email, 
            tipo: data.tipo,
            nome: data.nome,
            tem_senha_hash: !!data.senha_hash
        });

        // VERIFICAÇÃO CRÍTICA: garantir que senha_hash existe
        if (!data.senha_hash) {
            console.error('ERRO CRÍTICO: usuário sem senha_hash:', data.id);
            throw new Error('Usuário sem senha cadastrada');
        }

        // Retorna os dados consolidados (INCLUINDO senha_hash)
        return {
            id: data.id,
            email: data.email,
            tipo: data.tipo,
            nome: data.nome,
            telefone: data.telefone,
            data_cadastro: data.data_cadastro,
            ativo: data.ativo,
            senha_hash: data.senha_hash,
            // Dados específicos do tipo
            empresa: data.empresas?.[0] || null,
            ong: data.ongs?.[0] || null
        };

    } catch (error) {
        console.error('Erro fatal ao buscar usuário:', error);
        throw error;
    }
}

export async function verificarSenha(senhaPlain, senhaHash) {
    try {
        console.log('Iniciando verificação de senha...');
        
        // Validações de segurança
        if (!senhaPlain || typeof senhaPlain !== 'string') {
            throw new Error('Senha plain inválida');
        }
        
        if (!senhaHash || typeof senhaHash !== 'string') {
            throw new Error('Hash de senha inválido');
        }

        const bcrypt = await import('bcrypt');
        const resultado = await bcrypt.compare(senhaPlain, senhaHash);
        
        console.log('Verificação de senha concluída:', resultado);
        return resultado;
        
    } catch (error) {
        console.error('Erro na verificação de senha:', error);
        throw error;
    }
}

export async function atualizarUltimoLogin(usuarioId) {
    try {
        const { error } = await supabase
            .from('usuarios')
            .update({ 
                ultimo_login: new Date().toISOString()
            })
            .eq('id', usuarioId);

        if (error) {
            console.error('Erro ao atualizar último login:', error);
            return false;
        }

        console.log('Último login atualizado para usuário:', usuarioId);
        return true;

    } catch (error) {
        console.error('Erro ao atualizar último login:', error);
        return false;
    }
}

export async function buscarUsuarioCompletoPorId(usuarioId) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                empresas (
                    *,
                    responsaveis (*),
                    enderecos (*)
                ),
                ongs (
                    *,
                    responsaveis (*),
                    enderecos (*)
                )
            `)
            .eq('id', usuarioId)
            .single();

        if (error) {
            console.error('Erro ao buscar usuário completo:', error);
            throw new Error('Usuário não encontrado');
        }

        // Estrutura os dados de forma organizada
        const usuario = {
            id: data.id,
            email: data.email,
            tipo: data.tipo,
            nome: data.nome,
            telefone: data.telefone,
            data_cadastro: data.data_cadastro,
            ativo: data.ativo,
            ultimo_login: data.ultimo_login,
            senha_hash: data.senha_hash
        };

        // Adiciona dados específicos baseados no tipo
        if (data.tipo === 'empresa' && data.empresas?.[0]) {
            usuario.dados_empresa = {
                ...data.empresas[0],
                responsavel: data.empresas[0].responsaveis?.[0] || null,
                endereco: data.empresas[0].enderecos?.[0] || null
            };
        } else if (data.tipo === 'ong' && data.ongs?.[0]) {
            usuario.dados_ong = {
                ...data.ongs[0],
                responsavel: data.ongs[0].responsaveis?.[0] || null,
                endereco: data.ongs[0].enderecos?.[0] || null
            };
        }

        return usuario;

    } catch (error) {
        console.error('Erro ao buscar usuário completo:', error);
        throw error;
    }
}

export async function verificarEmailExistente(email) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error('Erro ao verificar email: ' + error.message);
        }

        return !!data;

    } catch (error) {
        console.error('Erro ao verificar email:', error);
        throw error;
    }
}

export function gerarTokenJWT(usuario) {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';
    
    return jwt.sign(
        { 
            id: usuario.id, 
            email: usuario.email, 
            tipo: usuario.tipo 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}