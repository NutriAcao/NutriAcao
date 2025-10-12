// index.js
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cadastroRoutes from './src/routes/cadastroRoutes.js'; 
import './src/config/dbPool.js'; 
import './src/config/supabaseClient.js';
import dbRoutes from './src/routes/dbRoutes.js';
import testeBDRoute from './src/routes/testeBDRoute.js';

// configuração de Variáveis
dotenv.config(); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5501; 
const DATABASE_URL = process.env.DATABASE_URL;

// checagem de Erro Essencial
if (!DATABASE_URL) {
    console.error('ERRO FATAL: DATABASE_URL não está configurada...');
    process.exit(1); 
}

// inicializa o Express
const app = express();
const publicPath = path.join(__dirname, '..', 'public');  
app.use(express.urlencoded({ extended: true })); // Middleware para ler forms
app.use(express.json()); // Middleware para ler JSON


app.use(express.static(publicPath));

// usar Rotas
app.use('/', testeBDRoute)
app.use('/', dbRoutes); 
app.use('/api/cadastro', cadastroRoutes)

// rota padrão para servir a homepage
app.get("/", (req, res) => {
   res.sendFile(path.join(publicPath, "pages", "homepage.html"));
});

// inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});