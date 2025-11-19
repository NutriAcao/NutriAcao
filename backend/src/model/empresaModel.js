// backend/src/models/empresaModel.js
import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function criarEmpresaCompleta(dados) {
    const { 
        razao_social, 
        nome_fantasia,
        cnpj, 
        ramo_atuacao,
        email_institucional,
        site_url,
        descricao,
        email,
        senha,
        telefone,
        nome,
        nome_responsavel_empresa,
        cpf_responsavel_empresa,
        cargo_responsavel_empresa,
        email_responsavel_empresa,
        telefone_responsavel_empresa,
        data_nascimento_responsavel,
        cep, 
        logradouro, 
        numero, 
        complemento, 
        bairro, 
        cidade, 
        estado
    } = dados;

    // Validação no model também para segurança
    if (!senha || !razao_social || !cnpj || !email || !ramo_atuacao || !nome_responsavel_empresa) {
        throw new Error("Campos essenciais (Razão Social, CNPJ, Ramo de Atuação, E-mail, Senha e Nome do Responsável) não podem estar vazios.");
    }

    try {
        // 1. Hash da senha
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // 2. Criar usuário
        const usuarioId = await criarUsuario({
            tipo: 'empresa',
            email: email,
            senha_hash: senhaHash,
            nome: nome || nome_fantasia || razao_social,
            telefone: telefone
        });

        // 3. Criar responsável legal
        const responsavelId = await criarResponsavel({
            usuario_id: usuarioId,
            nome_completo: nome_responsavel_empresa,
            cpf: cpf_responsavel_empresa,
            cargo: cargo_responsavel_empresa,
            email: email_responsavel_empresa,
            telefone: telefone_responsavel_empresa,
            data_nascimento: data_nascimento_responsavel
        });

        // 4. Criar empresa
        const empresaId = await criarEmpresa({
            usuario_id: usuarioId,
            responsavel_legal_id: responsavelId,
            email_institucional: email_institucional || email,
            cnpj: cnpj,
            razao_social: razao_social,
            nome_fantasia: nome_fantasia,
            ramo_atuacao: ramo_atuacao,
            descricao: descricao,
            site_url: site_url
        });

        // 5. Criar endereço se os dados foram fornecidos
        let enderecoId = null;
        if (cep && logradouro && numero && cidade && estado) {
            enderecoId = await criarEndereco({
                usuario_id: usuarioId,
                cep: cep,
                logradouro: logradouro,
                numero: numero,
                complemento: complemento,
                bairro: bairro,
                cidade: cidade,
                estado: estado
            });
        }

        // 6. Retornar dados consolidados
        return {
            empresa: {
                id: empresaId,
                razao_social: razao_social,
                nome_fantasia: nome_fantasia,
                cnpj: cnpj
            },
            usuario: {
                id: usuarioId,
                email: email,
                nome: nome || nome_fantasia || razao_social
            },
            responsavel: {
                id: responsavelId,
                nome: nome_responsavel_empresa
            },
            endereco: enderecoId ? { id: enderecoId } : null
        };

    } catch (error) {
        console.error('Erro no model ao criar empresa completa:', error);
        throw error;
    }
}

// Funções auxiliares específicas para cada tabela
async function criarUsuario(dadosUsuario) {
    const { data, error } = await supabase
        .from('usuarios')
        .insert([
            {
                ...dadosUsuario,
                data_cadastro: new Date(),
                ativo: true
            }
        ])
        .select('id');

    if (error) {
        if (error.code === '23505') {
            throw new Error("E-mail já cadastrado.");
        }
        throw new Error("Falha ao criar usuário: " + error.message);
    }

    return data[0].id;
}

async function criarResponsavel(dadosResponsavel) {
    const { data, error } = await supabase
        .from('responsaveis')
        .insert([dadosResponsavel])
        .select('id');

    if (error) {
        throw new Error("Falha ao criar responsável legal: " + error.message);
    }

    return data[0].id;
}

async function criarEmpresa(dadosEmpresa) {
    const { data, error } = await supabase
        .from('empresas')
        .insert([dadosEmpresa])
        .select('id');

    if (error) {
        if (error.code === '23505') {
            throw new Error("CNPJ já cadastrado.");
        }
        throw new Error("Falha ao criar empresa: " + error.message);
    }

    return data[0].id;
}

async function criarEndereco(dadosEndereco) {
    const { data, error } = await supabase
        .from('enderecos')
        .insert([dadosEndereco])
        .select('id');

    if (error) {
        console.warn('Endereço não foi salvo:', error.message);
        return null;
    }

    return data[0].id;
}

// Função para buscar empresa por ID
export async function buscarEmpresaPorId(id) {
    const { data, error } = await supabase
        .from('empresas')
        .select(`
            *,
            usuarios (*),
            responsaveis (*),
            enderecos (*)
        `)
        .eq('id', id)
        .single();

    if (error) {
        throw new Error("Empresa não encontrada: " + error.message);
    }

    return data;
}

// Função para verificar se CNPJ já existe
export async function verificarCnpjExistente(cnpj) {
    const { data, error } = await supabase
        .from('empresas')
        .select('id')
        .eq('cnpj', cnpj)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error("Erro ao verificar CNPJ: " + error.message);
    }

    return !!data;
}

// Função para verificar se email já existe
export async function verificarEmailExistente(email) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error("Erro ao verificar e-mail: " + error.message);
    }

    return !!data;
}