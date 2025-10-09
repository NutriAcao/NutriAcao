// index.js
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './src/routes/userRoutes.js'; 

// 1. Configuração de Variáveis
dotenv.config(); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5501; 
const DATABASE_URL = process.env.DATABASE_URL;

// 2. Checagem de Erro Essencial
if (!DATABASE_URL) {
    console.error('ERRO FATAL: DATABASE_URL não está configurada...');
    process.exit(1); 
}

import './src/config/dbPool.js'; 
import './src/config/supabaseClient.js'; 
import cadastroRoutes from './src/routes/cadastroRoutes.js'; 

//inicializa o Express
const app = express();
app.use(express.static(path.join(__dirname, '..', 'pages')));
app.use(express.urlencoded({ extended: true })); // Middleware para ler forms
app.use(express.json()); // Middleware para ler JSON

//importa Rotas (Controladores)
import dbRoutes from './src/routes/dbRoutes.js';
// ... import user/auth routes aqui

//usar Rotas
app.use('/', dbRoutes); 
app.use('/api/cadastro', cadastroRoutes)

// Rota padrão para servir a homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', "pages", "homepage.html"));
});

// 6. Inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
});