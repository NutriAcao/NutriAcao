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
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import sgMail from '@sendgrid/mail';
import doacoesConcluidasRoutes from './src/routes/doacoesConcluidasRoutes.js';
import rateLimit from 'express-rate-limit';


// configuração de Variáveis
dotenv.config(); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5501; 
const DATABASE_URL = process.env.DATABASE_URL;
sgMail.setApiKey(process.env.EMAIL_RENDER_SENDGRID_KEY);

// checagem de Erro
if (!DATABASE_URL) {
    console.error('ERRO FATAL: DATABASE_URL não está configurada...');
    process.exit(1); 
}

const contactLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: {
    message: "Muitas requisições desta origem. Tente novamente após 30 minutos.",
    status: 429
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// inicializa o Express
const app = express();
const publicPath = path.join(__dirname, '..', 'public');  
app.use(express.urlencoded({ extended: true })); // Middleware para ler forms
app.use(express.json()); // Middleware para ler JSON
import { verificarToken } from './src/routes/authMiddleware.js';
import { verificarEmpresa, verificarOng} from './src/routes/tipoAuthMiddleware.js'
//Middleware para ler cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser());


app.use(express.static(publicPath));

// usar Rotas
app.use('/', testeBDRoute)
app.use('/', dbRoutes); 
app.use('/api/cadastro', cadastroRoutes)
app.use('/api/login', login)
app.use("/api", usuarioRoutes);

// rota padrão para servir a homepage
app.get("/", (req, res) => {
   res.sendFile(path.join(publicPath, "pages", "homepage.html"));
});

// Rota padrão para servir a tela de login
app.get('/loginpage', (req,res) => {
  res.sendFile(path.join(publicPath,'pages','homepage', 'loginpage.html'))
})

// Rota auxiliar para obter dados do usuário autenticado
app.get('/api/usuarioToken', verificarToken, (req, res) => {
  res.json(req.usuario);
});




// ==============ROTAS PROTEGIDAS PARA EMPRESA====================
app.get('/visualizacaoOngs.html', verificarToken, verificarEmpresa, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'visualizacaoOngs.html'));
  
})

app.get('/cadastrarExcedentes.html', verificarToken, verificarEmpresa, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'cadastrarExcedentes.html'));
  
})
app.get('/HistoricoDoacoesEmpresa.html', verificarToken, verificarEmpresa, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'HistoricoDoacoesEmpresa.html'));
  
})
app.get('/minhaContaEmpresa.html', verificarToken, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'minhaContaEmpresa.html'));
  
})
app.get('/suporteEmpresa.html', verificarToken, verificarEmpresa, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'empresa', 'suporteEmpresa.html'));
  
})


// ==============ROTAS PROTEGIDAS PARA ONG====================
app.get('/visualizacaoDoacoes.html', verificarToken, verificarOng, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'visualizacaoDoacoes.html'));
  
})
app.get('/minhasSolicitacoes.html', verificarToken, verificarOng, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'minhasSolicitacoes.html'));
})
app.get('/HistoricoDoacoesONG.html', verificarToken, verificarOng, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'HistoricoDoacoesONG.html'));
  
})
app.get('/cadastrarDoacoesONG.html', verificarToken, verificarOng, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'cadastrarDoacoesONG.html'));
  
})
app.get('/relatorioOng.html', verificarToken, verificarOng, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'relatorioOng.html'));
  
})
app.get('/suporteONG.html', verificarToken, verificarOng, (req,res) => {
  res.sendFile(path.join(__dirname, '../','private', 'ong', 'suporteONG.html'));
  
})

app.use('/doacoesConcluidasEmpresa', doacoesConcluidasRoutes);
app.use('/doacoesConcluidasONG', doacoesConcluidasRoutes);


// Rota de Contato
app.post('/enviar-contato',contactLimiter, async (req, res) => {
  try {
    const { nome, email, assunto, descricao } = req.body; 

    const msg = {
      to: process.env.EMAIL_RECIPIENT,
      from: process.env.EMAIL_REMETENTE,
      subject: `[Contato NutriAção] - ${assunto || 'Mensagem de Suporte'}`,
      html: `
        <h2>Nova Mensagem de Contato Recebida</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>De:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${descricao}</p>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'Mensagem enviada com sucesso! Responderemos em até 3 dias úteis, lembre-se de verificar a caixa de Spam' });

  } catch (error) {
    console.error('Erro ao enviar e-mail via SendGrid:', error);
    res.status(500).json({ message: 'Erro ao enviar a mensagem. Tente novamente.' }); 
  }
});

// inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});