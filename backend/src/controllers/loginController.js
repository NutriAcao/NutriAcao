// refatorado
import * as LoginModel from '../model/loginModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js'; // ← ADICIONE ESTA IMPORT

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export async function loginUsuario(req, res) {
    const { email, senha } = req.body;

    console.log('Tentativa de login:', { email });

    // Validação básica
    if (!email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'Email e senha são obrigatórios'
        });
    }

    try {
        // 1. Buscar usuário pelo email
        const usuario = await LoginModel.buscarUsuarioPorEmail(email);
        
        if (!usuario) {
            console.log('Usuário não encontrado:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // 2. Verificar se o usuário está ativo
        if (!usuario.ativo) {
            console.log('Usuário inativo:', email);
            return res.status(401).json({
                success: false,
                message: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // 3. VERIFICAÇÃO CRÍTICA: garantir que senha_hash existe
        if (!usuario.senha_hash) {
            console.error('ERRO: usuário sem senha_hash:', usuario.id);
            return res.status(500).json({
                success: false,
                message: 'Erro no cadastro do usuário. Entre em contato com o suporte.'
            });
        }

        console.log('Comparando senhas...');

        // 4. Verificar senha COM TRY-CATCH ESPECÍFICO
        let senhaValida = false;
        try {
            senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
            console.log('Comparação de senha concluída:', senhaValida);
        } catch (bcryptError) {
            console.error('Erro no bcrypt.compare:', bcryptError);
            return res.status(500).json({
                success: false,
                message: 'Erro interno ao verificar senha'
            });
        }
        
        if (!senhaValida) {
            console.log('Senha inválida para:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // 5. 🔥 NOVO: Buscar a ONG correspondente ao usuário
        let ong_id = null;
        if (usuario.tipo === 'ong') {
            console.log('🔍 Buscando ONG para o usuário...');
            const { data: ong, error: ongError } = await supabase
                .from('ong')
                .select('id')
                .or(`email.eq.${email},email_responsavel_ong.eq.${email}`)
                .single();

            if (!ongError && ong) {
                ong_id = ong.id;
                console.log('✅ ONG encontrada:', ong_id);
            } else {
                console.log('⚠️ Nenhuma ONG encontrada para o email:', email);
            }
        }

        // 6. Atualizar último login
        await LoginModel.atualizarUltimoLogin(usuario.id);

        // 7. 🔥 ATUALIZADO: Gerar JWT Token com ong_id
        const tokenPayload = {
            id: usuario.id, 
            email: usuario.email, 
            tipo: usuario.tipo,
            ong_id: ong_id // ← NOVO CAMPO ADICIONADO
        };

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 8. SETAR COOKIE COM O TOKEN
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        // 9. Preparar resposta (remover dados sensíveis)
        const { senha_hash, ...usuarioSemSenha } = usuario;

        // 10. DEFINIR URL DE REDIRECIONAMENTO CORRETA
        let redirectUrl = '';
        if (usuario.tipo === 'empresa') {
            redirectUrl = '/visualizacaoOngs.html';
        } else if (usuario.tipo === 'ong') {
            redirectUrl = '/visualizacaoDoacoes.html';
        }

        console.log('Login bem-sucedido:', { 
            id: usuario.id, 
            email: usuario.email, 
            tipo: usuario.tipo,
            ong_id: ong_id, // ← NOVO LOG
            redirectUrl: redirectUrl
        });

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            usuario: usuarioSemSenha,
            ong_id: ong_id, // ← NOVO CAMPO NA RESPOSTA
            redirectUrl: redirectUrl
        });

    } catch (error) {
        console.error('Erro no processo de login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getPerfilUsuario(req, res) {
    try {
        console.log('Buscando perfil para usuário:', req.usuario.id);
        
        const usuario = await LoginModel.buscarUsuarioCompletoPorId(req.usuario.id);
        
        console.log('Perfil encontrado:', { 
            id: usuario.id, 
            tipo: usuario.tipo,
            nome: usuario.nome 
        });

        return res.status(200).json({
            success: true,
            usuario
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(404).json({
            success: false,
            message: 'Usuário não encontrado: ' + error.message
        });
    }
}