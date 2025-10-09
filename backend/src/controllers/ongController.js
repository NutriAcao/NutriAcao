// backend/src/controllers/ongController.js


// mesma logica do controller em empresa.

import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt'; 

const saltRounds = 10;

export async function cadastrarONG(req, res) {
    const { 
        nome, 
        cnpj, 
        area_atuacao, 
        cep, 
        endereco, 
        telefone, 
        email,
        
        senha // Senha (a ser hashificada)
    } = req.body; 

    if (!senha || !nome || !cnpj || !email) {
        return res.status(400).send("Campos essenciais (Nome, CNPJ, E-mail e Senha) não podem estar vazios.");
    }
    
    try {

        const senhaHash = await bcrypt.hash(senha, saltRounds); 

        const { data, error } = await supabase
            .from('ONG')
            .insert([
                {
                    nome: nome, 
                    cnpj: cnpj, 
                    area_atuacao: area_atuacao, 
                    cep: cep, 
                    endereco: endereco, 
                    telefone: telefone, 
                    email: email,
                    
                    senha_hash: senhaHash
                } 
            ])
            .select();

        if (error) {
            console.error('Erro ao cadastrar ONG:', error.message);
            
            // Lidar com violação de unicidade (CNPJ ou Email duplicado)
            if (error.code === '23505') {
                 return res.status(409).send("CNPJ ou E-mail institucional já cadastrado.");
            }
            return res.status(500).send("Falha no cadastro da ONG. Erro: " + error.message);
        }

        // Cria uma cópia dos dados e remove o hash antes de enviar ao cliente
        const dadosResposta = { ...data[0] };
        delete dadosResposta.senha_hash; 

        return res.status(201).json({ 
            status: 'OK', 
            message: 'ONG cadastrada com sucesso! Agora é necessário cadastrar o Responsável Legal.', 
            dados: dadosResposta
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro da ONG:', e);
        return res.status(500).send("Erro fatal ao processar a requisição.");
    }
}