// index.js
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cadastroRoutes from './src/routes/cadastroRoutes.js'; 
import login from './src/routes/loginRoutes.js'
import './src/config/dbPool.js'; 
import './src/config/supabaseClient.js';
import dbRoutes from './src/routes/dbRoutes.js';
import testeBDRoute from './src/routes/testeBDRoute.js';
import nodemailer from 'nodemailer'
import doacoesConcluidasRoutes from './src/routes/doacoesConcluidasRoutes.js';




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
import { verificarToken } from './src/routes/authMiddleware.js';
//Middleware para ler cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser());


app.use(express.static(publicPath));

// usar Rotas
app.use('/', testeBDRoute)
app.use('/', dbRoutes); 
app.use('/api/cadastro', cadastroRoutes)
app.use('/api/login', login)

// rota padrão para servir a homepage
app.get("/", (req, res) => {
   res.sendFile(path.join(publicPath, "pages", "homepage.html"));
});

// Rota padrão para servir a tela de login
app.get('/loginpage', (req,res) => {
  res.sendFile(path.join(publicPath,'pages','homepage', 'loginpage.html'))
})

// Rota auxiliar para obter dados do usuário autenticado
app.get('/api/usuario', verificarToken, (req, res) => {
  res.json(req.usuario);
});

// ==============ROTAS PROTEGIDAS PARA EMPRESA====================
app.get('/visualizacaoOngs.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'visualizacaoOngs.html'));
  
})

app.get('/cadastrarExcedentes.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'cadastrarExcedentes.html'));
  
})
app.get('/HistoricoDoacoesEmpresa.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'HistoricoDoacoesEmpresa.html'));
  
})
app.get('/suporteEmpresa.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'suporteEmpresa.html'));
  
})


// ==============ROTAS PROTEGIDAS PARA ONG====================
app.get('/visualizacaoDoacoes.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'visualizacaoDoacoes.html'));
  
})
app.get('/minhasSolicitacoes.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'minhasSolicitacoes.html'));
  
})
app.get('/HistoricoDoacoesONG.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'HistoricoDoacoesONG.html'));
  
})

app.use('/doacoesConcluidasEmpresa', doacoesConcluidasRoutes); // Prefixo opcional
app.use('/doacoesConcluidasONG', doacoesConcluidasRoutes); // Prefixo opcional




// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Rota de Contato
app.post('/enviar-contato', async (req, res) => {
  try {
    const { email, assunto, descricao } = req.body;

    if (!email || !assunto || !descricao) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    console.log('Recebendo solicitação de contato de:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_RECIPIENT, 
      replyTo: email,
      subject: `[Contato NutriAção] - ${assunto}`,
      
      html: `
        <h2>Nova Mensagem de Contato Recebida</h2>
        <p><strong>De:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${descricao}</p>
      `,
      
      text: `Nova Mensagem de Contato Recebida\n\nDe: ${email}\nAssunto: ${assunto}\n\nMensagem:\n${descricao}`
    };

    // Envio do E-mail
    await transporter.sendMail(mailOptions);

    console.log('E-mail enviado com sucesso!');
    res.status(200).json({ message: 'Mensagem enviada com sucesso!' });

  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
    res.status(500).json({ message: 'Erro ao enviar a mensagem. Tente novamente.', error: error.message });
  }
});

// inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});