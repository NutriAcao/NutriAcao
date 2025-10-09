//ESSE AQUI FOI FEITO PARA TESTES E PARA APRENDERMOS A LOGICA CASO PRECISEMOS DE UM EXEMPLO, ESSE SERÁ EXCLUIDO!















// Importa o cliente Supabase inicializado (que está no seu config/supabaseClient.js)
import { supabase } from '../config/supabaseClient.js'; 
import bcrypt from 'bcrypt';

const saltRounds = 10; // Custo do hash

export async function cadastrarUsuario(req, res) {
    const { email, senha, nome_completo } = req.body; 

    try {
        // >>> PASSO DE SEGURANÇA: FAZER O HASH DA SENHA <<<
        const senhaHash = await bcrypt.hash(senha, saltRounds); 

        // 2. Inserir no Supabase
        const { error } = await supabase
            .from('usuarios')
            .insert([
                { 
                    email: email, 
                    senha_hash: senhaHash, // <-- MUDE AQUI para salvar o HASH
                    nome_completo: nome_completo 
                } 
            ]);

        // ... o resto da sua lógica de erro e sucesso ...
    } catch (e) {
        // ...
    }
}

// Esta função será o seu controlador (handler) para a rota POST
export async function cadastrarUsuario(req, res) {
    // 1. Desestruturar os dados do formulário
    // ATENÇÃO: Confirme que os nomes 'email', 'senha', etc., são os nomes DOS INPUTS do seu HTML.
    const { email, senha, nome_completo } = req.body; 

    try {
        // 2. Tentar inserir os dados na tabela do Supabase (ex: 'usuarios')
        const { data, error } = await supabase
            .from('usuarios') // <-- MUITO IMPORTANTE: Mude para o nome exato da sua tabela
            .insert([
                { 
                    email_coluna: email, 
                    senha_coluna: senha, 
                    nome_coluna: nome_completo 
                } // Adapte as chaves para os nomes das COLUNAS do seu banco
            ])
            .select();

        if (error) {
            console.error('Erro ao cadastrar conta no banco:', error);
            return res.status(500).send("Falha no cadastro. Por favor, tente novamente.");
        }

        // 3. Resposta de sucesso
        return res.status(201).send("Cadastro realizado com sucesso!");

    } catch (e) {
        console.error('Erro interno do servidor durante o cadastro:', e);
        return res.status(500).send("Erro interno do servidor.");
    }
}