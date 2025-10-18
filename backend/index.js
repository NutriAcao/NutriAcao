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
app.get('/empresa/visualizacaoOngs.html', verificarToken, (req,res) => {
  res.sendFile(path.join(publicPath,'pages', 'empresa', 'visualizacaoOngs.html'))
  
})

app.get('/empresa/cadastrarExcedentes.html', verificarToken, (req,res) => {
  res.sendFile(path.join(publicPath,'pages', 'empresa', 'cadastrarExcedentes.html'))
  
})
app.get('/empresa/HistoricoDoacoesEmpresa.html', verificarToken, (req,res) => {
  res.sendFile(path.join(publicPath,'pages', 'empresa', 'HistoricoDoacoesEmpresa.html'))
  
})


// ==============ROTAS PROTEGIDAS PARA ONG====================
app.get('/ong/visualizacaoDoacoes.html', verificarToken, (req,res) => {
  res.sendFile(path.join(publicPath,'pages', 'ong', 'visualizacaoDoacoes.html'))
  
})
app.get('/ong/minhasSolicitacoes.html', verificarToken, (req,res) => {
  res.sendFile(path.join(publicPath,'pages', 'ong', 'minhasSolicitacoes.html'))
  
})




// configurações do nodemailer, modulo usado para ler forms da landing page e mandar email.
// configuração das variaveis de ambiente
const transporter = nodemailer.createTransport({
  host:process.env.EMAIL_HOST || 'smtp.exemplo.com',
  port:process.env.EMAIL_PORT || 587,
  secure:process.env.EMAIL_SECURE === 'true',
  auth: {
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
  },
})

app.post('/enviar_contato', async(req,res) => {
  console.log("--- ROTA /ENVIAR_CONTATO FOI ATINGIDA ---");
  console.log("Dados recebidos:", req.body);

  const {nome,email,assunto} = req.body;
  if(!nome || !email || !assunto )
    return res.status(400).json({ success:false, mensage: 'Todos os campos são obrigatórios'
  })

    const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_RECIPIENT || 'email.de.contato@nutriacao.com.br', 
    subject: `[CONTATO SITE] - ${assunto.substring(0, 50)}...`, 
    text: `Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${assunto}`,
    replyTo: email, 
    html: `
        <h2>Nova Mensagem do Site NutriAção</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <p><strong>Mensagem:</strong> ${assunto.replace(/\n/g, '<br>')}</p>
        `
    };
       try{
          const info = await transporter.sendMail(mailOptions);
          console.log('Mensagem Enviada: %s', info.messageId);
          app.get("/", (req, res) => {
            res.sendFile(path.join(publicPath, "pages", "homepage.html"));
          });
          return;
        } catch (error) {
            console.error("Erro ao enviar email:", error);
            res.status(500).json({ success: false, message: 'Ops! Ocorreu um erro ao enviar sua mensagem.' });
    }

  });


// inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});