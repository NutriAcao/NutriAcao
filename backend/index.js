import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

import { createClient } from '@supabase/supabase-js';


// --- Configuração Essencial para ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
// ----------------------------------------------


//cnfigura o Dotenv para ler o arquivo .env
dotenv.config(); 

//porta 8081
const PORT = process.env.PORT || 5501; 
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('ERRO FATAL: DATABASE_URL não está configurada no arquivo .env');
    process.exit(1); // Encerra o processo se a chave essencial faltar
}

console.log('Tentando conectar ao banco de dados...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// --- INICIA O SERVIDOR EXPRESS ---

const app = express();

// Configura o Express para servir arquivos estáticos da pasta 'pages'
// (Isso é importante para sua rota /homepage.html funcionar)
// NOTA: Se 'pages' está na raiz do projeto, use path.join(__dirname, '..', 'pages')
// Mas vamos assumir que 'pages' está no mesmo nível que 'backend'
app.use(express.static(path.join(__dirname, '..', 'pages'))); 


// Rota padrão para servir a homepage
app.get("/", (req, res) => {
  // NOTA: Assumindo que a homepage.html está dentro de pages/
  res.sendFile(path.join(__dirname, '..', "pages", "homepage.html"));
});


// ROTA DE TESTE: Verifica a conexão com o banco de dados
app.get("/db-test", async (req, res) => {
    try {
        // Envia um comando simples que retorna o número 1, testando a conexão
        const result = await pool.query('SELECT 1 as is_connected');
        
        // Verifica se a query retornou o que era esperado
        if (result.rows[0].is_connected === 1) {
             return res.status(200).json({ 
                 status: 'OK', 
                 message: 'Conexão com o banco de dados estabelecida com sucesso!' 
             });
        }
    } catch (error) {
        // O erro mais comum aqui é falha de autenticação (senha/user) ou SSL
        console.error("Erro ao testar a conexão com o banco:", error.message);
        return res.status(500).json({ 
            status: 'ERROR', 
            message: 'Falha na conexão ou na query SQL. Verifique o DATABASE_URL.',
            details: error.message 
        });
    }
});


app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
});


export { pool };


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Cliente Supabase inicializado com sucesso.');