// backend/src/controllers/empresaController.js

// Os controllers tem o objetivo de estabelecer funções especificas, 
// nesse caso essa função é responsável por receber os dados de uma nova empresa a ser registrada, processá-los com segurança e
// salvar essas informações no banco de dados, utilizando o Supabase como serviço de backend.

import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt'; // essa biblioteca é necessária para a segurança da senha.

const saltRounds = 10;

export async function cadastrarEmpresa(req, res) {
    console.log('Dados recebidos no req.body:', req.body); 
    // receber e preparar os dados da Empresa do formulário
    const { 
        nome, 
        cnpj, 
        area_atuacao,
        cep, 
        endereco, 
        telefone, 
        email,
        
        senha,
        nome_responsavel_empresa,
        cpf_responsavel_empresa,
        cargo_responsavel_empresa,
        email_responsavel_empresa,
        telefone_responsavel_empresa,
    } = req.body; 

    // verificação de Segurança e Validação Simples
    if (!senha || !nome || !cnpj || !email || !area_atuacao) {
        return res.status(400).send("Campos essenciais (Nome, CNPJ, Tipo de Negócio, E-mail e Senha) não podem estar vazios.");
    }
    
    try {
        // usando o bcrypt para hashficar a senha
        const senhaHash = await bcrypt.hash(senha, saltRounds); 

        // insere dados na tabela 'Empresa'
        const { data, error } = await supabase
            .from('empresa')
            .insert([
                { 
                    nome: nome, 
                    cnpj: cnpj, 
                    area_atuacao: area_atuacao, 
                    cep: cep, 
                    endereco: endereco, 
                    telefone: telefone, 
                    email: email,
                    
                    senha_hash: senhaHash, // Armazena a senha criptografada

                    nome_responsavel_empresa: nome_responsavel_empresa,
                    cpf_responsavel_empresa: cpf_responsavel_empresa,
                    cargo_responsavel_empresa: cargo_responsavel_empresa,
                    email_responsavel_empresa: email_responsavel_empresa,
                    telefone_responsavel_empresa: telefone_responsavel_empresa,
                } 
            ])
            .select(); // Retorna o registro para confirmação

        if (error) {
            
            console.error('Erro ao cadastrar Empresa:', error.message);
            
            // logica para lidar com violação de unicidade (CNPJ ou Email duplicado)
            if (error.code === '23505') {
                 return res.status(409).send("CNPJ ou E-mail institucional já cadastrado.");
            }
            return res.status(500).send("Falha no cadastro da Empresa. Erro: " + error.message);
        }

        // Cria uma cópia dos dados e remove o hash antes de enviar ao cliente
        const dadosResposta = { ...data[0] };
        delete dadosResposta.senha_hash; 

        return res.status(201).json({ 
            status: 'OK', 
            message: 'Empresa cadastrada com sucesso! Agora é necessário cadastrar o Representante Legal.', 
            dados: dadosResposta
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro da Empresa:', e);
        return res.status(500).send("Erro fatal ao processar a requisição.");
    }
}