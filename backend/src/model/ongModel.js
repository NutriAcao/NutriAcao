// backend/src/models/ongModel.js
//refatorado
import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';


const saltRounds = 10;

export async function criarOngCompleta(dados) {
    const { 
        nome_ong, 
        cnpj,
        email_institucional,
        email,
        senha,
        nome,
        telefone,
        nome_responsavel_ong,
        cpf_responsavel_ong,
        cargo_responsavel_ong,
        email_responsavel_ong,
        telefone_responsavel_ong,
        data_nascimento_responsavel_ong,
        cep, 
        logradouro, 
        numero, 
        complemento, 
        bairro, 
        cidade, 
        estado
    } = dados;

    // Validação
    if (!senha || !nome_ong || !cnpj || !email || !nome_responsavel_ong) {
        throw new Error("Campos essenciais (Nome da ONG, CNPJ, E-mail, Senha e Nome do Responsável) não podem estar vazios.");
    }

    try {
        // 1. Hash da senha
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // 2. Criar usuário
        const usuarioId = await criarUsuario({
            tipo: 'ong',
            email: email,
            senha_hash: senhaHash,
            nome: nome || nome_ong,
            telefone: telefone
        });


        // 3. Criar responsável legal
        const responsavelId = await criarResponsavel({
            usuario_id: usuarioId,
            nome_completo: nome_responsavel_ong,
            cpf: cpf_responsavel_ong,
            cargo: cargo_responsavel_ong,
            email: email_responsavel_ong,
            telefone: telefone_responsavel_ong,
            data_nascimento: data_nascimento_responsavel_ong
        });


        // 4. Criar ONG
        const ongId = await criarOng({
            usuario_id: usuarioId,
            responsavel_legal_id: responsavelId,
            email_institucional: email_institucional || email,
            cnpj: cnpj,
            nome_ong: nome_ong
        });

        // 5. Criar endereço
        let enderecoId = null;
        
        const camposEnderecoObrigatorios = [cep, logradouro, numero, bairro, cidade, estado];
        const enderecoValido = camposEnderecoObrigatorios.every(campo => campo && campo.trim() !== '');
        
        if (enderecoValido) {
            console.log('📍 Criando endereço da ONG...');
            
            const dadosEndereco = {
                usuario_id: usuarioId,
                cep: cep ? cep.trim().replace(/\D/g, '') : null,
                logradouro: logradouro ? logradouro.trim() : null,
                numero: numero ? numero.trim() : null,
                complemento: complemento ? complemento.trim() : null,
                bairro: bairro ? bairro.trim() : null,
                cidade: cidade ? cidade.trim() : null,
                estado: estado ? estado.trim().substring(0, 2).toUpperCase() : null
            };
            
            enderecoId = await criarEndereco(dadosEndereco);
            
        }

        return {
            ong: {
                id: ongId,
                nome_ong: nome_ong,
                cnpj: cnpj
            },
            usuario: {
                id: usuarioId,
                email: email,
                nome: nome || nome_ong
            },
            responsavel: {
                id: responsavelId,
                nome: nome_responsavel_ong
            },
            endereco: enderecoId ? { id: enderecoId } : null
        };

    } catch (error) {
        console.error('Erro no model ao criar ONG completa:', error);
        throw error;
    }
}

// Funções auxiliares (podem ser compartilhadas com empresaModel)
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

async function criarOng(dadosOng) {
    const { data, error } = await supabase
        .from('ongs')
        .insert([dadosOng])
        .select('id');

    if (error) {
        if (error.code === '23505') {
            throw new Error("CNPJ já cadastrado.");
        }
        throw new Error("Falha ao criar ONG: " + error.message);
    }

    return data[0].id;
}

async function criarEndereco(dadosEndereco) {
    
    // Validação do campo estado
    if (dadosEndereco.estado && dadosEndereco.estado.length > 2) {
        dadosEndereco.estado = dadosEndereco.estado.substring(0, 2).toUpperCase();
    }

    const { data, error } = await supabase
        .from('enderecos')
        .insert([dadosEndereco])
        .select('id');

    if (error) {
        return null;
    }

    return data[0].id;
}