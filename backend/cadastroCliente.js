require('dotenv').config();
const express = require("express")

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY); 

const app = express()
const PORT = 4000;
var path = require('path')
app.use(express.urlencoded({ extended: true })); // para ler dados do form
app.use(express.static("ŃutriAcao-LandingPage"));

app.get('/', (req, res)=>{
    res.sendFile(path.join('/home/gabriel/github/NutriAcao/public/pages/cadastropage.html'))
})
app.post('/cadastrarConta', async (req, res) => {
    // 1. Desestruturar os dados do formulário
    const { email, senha, nome_completo } = req.body; 
    // Adapte estes nomes (`email`, `senha`, etc.) para os nomes dos inputs no seu formulário HTML.

    try {
        // 2. Tentar inserir os dados na tabela do Supabase (ex: 'usuarios')
        const { data, error } = await supabase
            .from('usuarios') // <-- MUITO IMPORTANTE: Mude para o nome da sua tabela de cadastro
            .insert([
                { email: email, senha: senha, nome: nome_completo } // Adapte as chaves (email, senha, nome) para as colunas da sua tabela no Supabase
            ])
            .select();

        if (error) {
            console.error('Erro ao cadastrar conta:', error);
            // Retorna um erro amigável para o usuário
            return res.status(500).send("Falha ao cadastrar. Tente novamente ou contate o suporte.");
        }

        // 3. Resposta de sucesso (se tudo deu certo)
        console.log('Conta cadastrada com sucesso:', data);
        res.status(201).send("Cadastro realizado com sucesso!");

    } catch (e) {
        console.error('Erro inesperado no cadastro:', e);
        res.status(500).send("Erro interno do servidor durante o cadastro.");
    }
});

app.listen(PORT, () =>{
    console.log("deu bom")
    console.log(PORT)
})
