// backend/src/controllers/pessoaFisicaController.js

import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt'; 

const saltRounds = 10;

export async function cadastrarPessoaFisica(req, res) {
    const { 
        nome, 
        cpf, 
        rg, 
        data_nascimento, 
        genero, 
        cep, 
        endereco, 
        telefone, 
        email, 
        senha // Este campo vem do formulário, mas NÃO vai para o banco (o hash vai)
    } = req.body; 

    if (!senha || !nome || !cpf || !email || !cep || !endereco || !telefone) {
        return res.status(400).send("Campos essenciais (Nome, CPF, E-mail, Senha e Contato/Endereço) não podem estar vazios.");
    }
    
    try {
        const senhaHash = await bcrypt.hash(senha, saltRounds); 

        const { data, error } = await supabase
            .from('PessoaFisica')
            .insert([
                {
                    nome: nome, 
                    cpf: cpf, 
                    rg: rg, 
                    data_nascimento: data_nascimento, 
                    genero: genero, 
                    cep: cep, 
                    endereco: endereco, 
                    telefone: telefone, 
                    email: email,
                    
                    senha_hash: senhaHash
                } 
            ])
            .select();

        if (error) {
            console.error('Erro ao cadastrar Pessoa Física:', error.message);
            
            // Erro 23505 (Unique Violation) é comum para CPF ou Email duplicado
            if (error.code === '23505') {
                 return res.status(409).send("CPF ou Email já cadastrado. Por favor, verifique seus dados.");
            }
            return res.status(500).send("Falha no cadastro. Erro: " + error.message);
        }
        
        const dadosResposta = { ...data[0] };
        delete dadosResposta.senha_hash; 

        return res.status(201).json({ 
            status: 'OK', 
            message: 'Pessoa Física cadastrada com sucesso!', 
            dados: dadosResposta
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro:', e);
        return res.status(500).send("Erro fatal ao processar a requisição. Verifique o console do servidor.");
    }
}