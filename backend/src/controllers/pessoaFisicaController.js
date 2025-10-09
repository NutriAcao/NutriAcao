import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt'; // Lembre-se de instalar: npm install bcrypt

const saltRounds = 10;

export async function cadastrarPessoaFisica(req, res) {
    // 1. Receber e preparar os dados do formulário
    // ATENÇÃO: Os nomes das chaves (nome, cpf, email, etc.) DEVEM ser os 'name' dos seus inputs HTML.
    const { nome, cpf, rg, data_nascimento, genero, cep, endereco, telefone, email, senha } = req.body; 

    // O cadastro de Pessoa Física deve ter uma senha associada, que vamos hashificar
    if (!senha) {
        return res.status(400).send("A senha é obrigatória para o cadastro.");
    }
    
    try {
        // 2. Hash da Senha para Segurança (MUITO IMPORTANTE)
        const senhaHash = await bcrypt.hash(senha, saltRounds); 

        // 3. Inserir dados na tabela 'PessoaFisica'
        const { data, error } = await supabase
            .from('PessoaFisica') 
            .insert([
                { 
                    nome, cpf, rg, data_nascimento, genero, cep, endereco, telefone, email,
                    // Adicione uma coluna de senha hash na sua tabela se não for usar o Auth do Supabase!
                    // se sua tabela tiver uma coluna 'senha_hash' você faria:
                    // senha_hash: senhaHash
                } 
            ])
            .select();

        if (error) {
            console.error('Erro ao cadastrar Pessoa Física:', error.message);
            // Erro 23505 (Unique Violation) é comum para CPF duplicado
            if (error.code === '23505') {
                 return res.status(409).send("CPF ou Email já cadastrado.");
            }
            return res.status(500).send("Falha no cadastro. Erro: " + error.message);
        }

        // 4. Resposta de sucesso
        return res.status(201).json({ 
            status: 'OK', 
            message: 'Pessoa Física cadastrada com sucesso!', 
            dados: data[0] 
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro:', e);
        return res.status(500).send("Erro interno ao processar a requisição.");
    }
}