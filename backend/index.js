import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cadastroRoutes from './src/routes/cadastroRoutes.js';
import login from './src/routes/loginRoutes.js'
import loginRoutes from './src/routes/loginRoutes.js';
import './src/config/dbPool.js';
import './src/config/supabaseClient.js';
import dbRoutes from './src/routes/dbRoutes.js';
import testeBDRoute from './src/routes/testeBDRoute.js';
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import sgMail from '@sendgrid/mail';
import doacoesConcluidasRoutes from './src/routes/doacoesConcluidasRoutes.js';
import rateLimit from 'express-rate-limit';
import reservaRoutes from './src/routes/reservaRoutes.js';
import doacaoRoutes from './src/routes/doacoesRoutes.js';
import historicoRoutes from './src/routes/historicoRoutes.js';
import { supabase } from './src/config/supabaseClient.js'
import crypto from 'crypto';

import empresaRoutes from './src/routes/empresaRoutes.js';
import ongRoutes from './src/routes/ongRoutes.js';
import minhaContaOngRoutes from "./src/routes/minhaContaOngRoutes.js";

// IMPORTE OS CONTROLLERS CORRETAMENTE
import * as excedentesController from './src/controllers/excedentesController.js';
import * as doacaoOngController from './src/controllers/doacaoOngController.js';
import { cadastrarDoacaoEmpresa } from './src/controllers/doacaoEmpresaController.js';

// configuração de variáveis
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
import { verificarEmpresa, verificarOng } from './src/routes/tipoAuthMiddleware.js'
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
app.use('/api', reservaRoutes);
app.use('/api', doacaoRoutes);
app.use('/api', historicoRoutes);
app.use('/', testeBDRoute);
app.use('/', dbRoutes);
app.use('/api/cadastro', cadastroRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/ongs', ongRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/doacoes-concluidas', doacoesConcluidasRoutes);
app.use('/api/minha-conta-ong', minhaContaOngRoutes);
app.use("/api", usuarioRoutes);
app.use('/api', reservaRoutes);
app.use('/api', doacaoRoutes); 
app.use('/api', historicoRoutes); 
app.use('/api/auth', loginRoutes);

// rota padrão para servir a homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "pages", "homepage.html"));
});

// Rota padrão para servir a tela de login
app.get('/loginpage', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages', 'homepage', 'loginpage.html'))
})

// Rota auxiliar para obter dados do usuário autenticado
app.get('/api/usuarioToken', verificarToken, (req, res) => {
  res.json(req.usuario);
});




// ROTAS PROTEGIDAS PARA EMPRESA
app.get('/visualizacaoOngs.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'visualizacaoOngs.html'));

})

app.get('/cadastrarExcedentes.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'cadastrarExcedentes.html'));

})
app.get('/HistoricoDoacoesEmpresa.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'HistoricoDoacoesEmpresa.html'));

})
app.get('/minhaContaEmpresa.html', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'minhaContaEmpresa.html'));

})
app.get('/suporteEmpresa.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'suporteEmpresa.html'));

})
app.get('/minhasDoacoesAtivasEmpresa.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'minhasDoacoesAtivasEmpresa.html'));

})


//ROTAS PROTEGIDAS PARA ONG
app.get('/visualizacaoDoacoes.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'visualizacaoDoacoes.html'));

})
app.get('/minhasSolicitacoes.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'minhasSolicitacoes.html'));
})
app.get('/HistoricoDoacoesONG.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'HistoricoDoacoesONG.html'));

})
app.get('/cadastrarDoacoesONG.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'cadastrarDoacoesONG.html'));

})
app.get('/relatorioOng.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'relatorioOng.html'));

})
app.get('/suporteONG.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'suporteONG.html'));
})
app.get('/minhaContaOng.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'minhaContaOng.html'));
})

app.get('/resetarSenha.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages', 'homepage', 'resetarSenha.html'));
});


app.use('/doacoesConcluidasEmpresa', doacoesConcluidasRoutes);
app.use('/doacoesConcluidasONG', doacoesConcluidasRoutes);
app.use('/api', minhaContaOngRoutes); 

app.post('/api/excedentes', verificarToken, verificarEmpresa, excedentesController.cadastrarExcedente);
app.get('/api/categorias', excedentesController.listarCategorias);
app.get('/api/unidades-medida', excedentesController.listarUnidadesMedida);
app.post('/api/solicitacoes-ong', verificarToken, verificarOng, doacaoOngController.cadastrarDoacaoOng);

app.post('/api/cadastro/doacaoEmpresa', verificarToken, verificarEmpresa, cadastrarDoacaoEmpresa);



// rota de contato/suporte
app.post('/enviar-contato', contactLimiter, async (req, res) => {
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




// Rota para enviar e-mail de recuperação
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email required');

  // 1) localizar usuário (ex: tabela users ou via auth)
  try {
    // consulta paralela em ongs e empresas
    const [ongsRes, empresasRes] = await Promise.all([
      supabase.from('ongs').select('id, email').eq('email', email).limit(1),
      supabase.from('empresa').select('id, email').eq('email', email).limit(1)
    ]);

    if (ongsRes.error || empresasRes.error) {
      console.error('DB error', ongsRes.error || empresasRes.error);
      return res.status(500).send('DB error');
    }

    // prioriza ongs, depois empresas (ajuste conforme necessidade)
    const ong = ongsRes.data && ongsRes.data[0];
    const empresa = empresasRes.data && empresasRes.data[0];

    const found = ong || empresa;
    console.log(found)

    if (!found) {
      // não vaza informação sobre existência do email
      // mas retorna sucesso mesmo assim por segurança
      return res.status(200).json({ message: 'Se o email existir, você receberá um link de recuperação.' });
    }

    // 2) gerar token e salvar hash
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    // Salvar token no banco com o user_id
    await supabase.from('password_resets').insert({
      user_id: found.id,
      token_hash: tokenHash,
      expires_at: expiresAt
    });
    console.log(token)
    console.log('token gerado')

    // 3) enviar email com SendGrid - incluir email na URL
    const resetUrl = `http://localhost:5501/pages/homepage/resetarSenha.html?token=${token}&email=${encodeURIComponent(email)}`;
    const msg = {
      to: email,
      from: process.env.EMAIL_REMETENTE,
      subject: 'Redefina sua senha',
      text: `Clique aqui para redefinir: ${resetUrl}`,
      html: `<p>Clique <a href="${resetUrl}">aqui</a> para redefinir sua senha. Link válido por 1 hora.</p>`
    };

    await sgMail.send(msg);
    console.log('Email enviado com sucesso');

    return res.status(200).json({ message: 'Email de recuperação enviado com sucesso!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar solicitação de recuperação de senha.' });
  }
});


// Rota para atualizar senha
app.post('/reset-password', async (req, res) => {
  const { token, newPassword, email } = req.body;

  // Remover espaços em branco do token
  const cleanToken = token ? token.trim() : '';

  if (!cleanToken || !newPassword || !email) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    console.log('Token recebido:', cleanToken);
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');
    console.log('Token hash gerado:', tokenHash);

    // Buscar token no banco
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at, token_hash')
      .eq('token_hash', tokenHash)
      .limit(1)
      .single();

    console.log('Resultado da busca:', { resetData, resetError });

    if (resetError || !resetData) {
      console.log('Token não encontrado no banco');
      return res.status(400).json({ error: 'Token inválido' });
    }

    if (new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Verificar se o usuário é ONG ou Empresa
    const [ongRes, empresaRes] = await Promise.all([
      supabase.from('ongs').select('id').eq('email', email).limit(1),
      supabase.from('empresa').select('id').eq('email', email).limit(1)
    ]);

    const isOng = ongRes.data && ongRes.data.length > 0;
    const isEmpresa = empresaRes.data && empresaRes.data.length > 0;

    if (!isOng && !isEmpresa) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Importar bcrypt para hash da senha
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha na tabela correta
    const tableName = isOng ? 'ongs' : 'empresa';
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ senha_hash: hashedPassword })
      .eq('email', email);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }

    // Invalidar token
    await supabase.from('password_resets').delete().eq('token_hash', tokenHash);

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });

  } catch (err) {
    console.error('Erro no reset de senha:', err);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});


// inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});