/* arquivo: backend/index.js - arquivo do backend: nutriacao/backend/index.js - usa express (backend); inicia servidor; funções/constantes: PORT, __dirname, contactLimiter, msg, DATABASE_URL */

/*
  descrição geral:
  este arquivo inicializa e configura o servidor express do projeto.
  contém: carregamento de variáveis de ambiente, configuração de serviços
  (banco, sendgrid), middlewares globais, rotas públicas e privadas,
  endpoints de páginas estáticas e um endpoint para envio de contato.
  comentários de seção abaixo explicam cada bloco funcional de forma sucinta.
*/

/*
  imports principais:
  - bibliotecas externas usadas pelo servidor (dotenv, express, path, sendgrid)
  - rotas e configurações internas (routes, dbPool, supabaseClient)
  estes imports trazem a lógica modularizada para serem usados abaixo.
*/
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cadastroRoutes from "./src/routes/cadastroRoutes.js";
import login from "./src/routes/loginRoutes.js";
import "./src/config/dbPool.js";
import "./src/config/supabaseClient.js";
import dbRoutes from "./src/routes/dbRoutes.js";
import testeBDRoute from "./src/routes/testeBDRoute.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import sgMail from "@sendgrid/mail";
import doacoesConcluidasRoutes from "./src/routes/doacoesConcluidasRoutes.js";
import rateLimit from "express-rate-limit";

/*
  configuração inicial e validação de ambiente:
  - carrega variáveis do .env
  - resolve caminhos de arquivo para uso com import.meta.url
  - define porta e url do banco a partir das variáveis de ambiente
  - configura a api key do sendgrid para envio de e-mails
*/
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5501;
const DATABASE_URL = process.env.DATABASE_URL;
sgMail.setApiKey(process.env.EMAIL_RENDER_SENDGRID_KEY);

/*
  validação crítica:
  encerra o processo se a url do banco de dados não estiver configurada,
  porque o aplicativo depende do banco para operar.
*/
if (!DATABASE_URL) {
  console.error("ERRO FATAL: DATABASE_URL não está configurada...");
  process.exit(1);
}

/*
  proteção contra abuso no endpoint de contato:
  limita requisições por ip para evitar spam/abuso (max 5 por 30 minutos)
  o objeto contactLimiter é usado como middleware no endpoint /enviar-contato
*/
const contactLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Muitas requisições desta origem. Tente novamente após 30 minutos.",
    status: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/*
  configuração do app express e middlewares globais:
  - cria instância do express
  - configura pasta pública para servir arquivos estáticos
  - configura parsers para body (urlencoded e json) e cookie parser
  - importa middlewares de autenticação (verificarToken, verificarEmpresa/verificarOng)
*/
const app = express();
const publicPath = path.join(__dirname, "..", "public");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import { verificarToken } from "./src/routes/authMiddleware.js";
import {
  verificarEmpresa,
  verificarOng,
} from "./src/routes/tipoAuthMiddleware.js";

import cookieParser from "cookie-parser";
app.use(cookieParser());

app.use(express.static(publicPath));

/*
  montagem das rotas principais:
  - rota raiz '/' para teste de banco e outras rotas de diagnóstico
  - rotas da api agrupadas em /api/* (cadastro, login, usuário etc.)
  as rotas importadas encapsulam lógica específica e controladores.
*/
app.use("/", testeBDRoute);
app.use("/", dbRoutes);
app.use("/api/cadastro", cadastroRoutes);
app.use("/api/login", login);
app.use("/api", usuarioRoutes);

/*
  rotas para páginas estáticas do front-end:
  servem arquivos html dentro da pasta public/pages ou private/* conforme o
  tipo de usuário (empresa/ong). muitas dessas rotas aplicam middleware de
  autenticação e autorização (verificarToken, verificarEmpresa/verificarOng)
*/
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "pages", "homepage.html"));
});

app.get("/loginpage", (req, res) => {
  res.sendFile(path.join(publicPath, "pages", "homepage", "loginpage.html"));
});

app.get("/api/usuarioToken", verificarToken, (req, res) => {
  res.json(req.usuario);
});

app.get(
  "/visualizacaoOngs.html",
  verificarToken,
  verificarEmpresa,
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../",
        "private",
        "empresa",
        "visualizacaoOngs.html",
      ),
    );
  },
);

app.get(
  "/cadastrarExcedentes.html",
  verificarToken,
  verificarEmpresa,
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../",
        "private",
        "empresa",
        "cadastrarExcedentes.html",
      ),
    );
  },
);
app.get(
  "/HistoricoDoacoesEmpresa.html",
  verificarToken,
  verificarEmpresa,
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../",
        "private",
        "empresa",
        "HistoricoDoacoesEmpresa.html",
      ),
    );
  },
);
app.get("/minhaContaEmpresa.html", verificarToken, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../", "private", "empresa", "minhaContaEmpresa.html"),
  );
});
app.get(
  "/suporteEmpresa.html",
  verificarToken,
  verificarEmpresa,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, "../", "private", "empresa", "suporteEmpresa.html"),
    );
  },
);
app.get(
  "/minhasDoacoesAtivasEmpresa.html",
  verificarToken,
  verificarEmpresa,
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../",
        "private",
        "empresa",
        "minhasDoacoesAtivasEmpresa.html",
      ),
    );
  },
);

app.get(
  "/visualizacaoDoacoes.html",
  verificarToken,
  verificarOng,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, "../", "private", "ong", "visualizacaoDoacoes.html"),
    );
  },
);
app.get(
  "/minhasSolicitacoes.html",
  verificarToken,
  verificarOng,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, "../", "private", "ong", "minhasSolicitacoes.html"),
    );
  },
);
app.get(
  "/HistoricoDoacoesONG.html",
  verificarToken,
  verificarOng,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, "../", "private", "ong", "HistoricoDoacoesONG.html"),
    );
  },
);
app.get(
  "/cadastrarDoacoesONG.html",
  verificarToken,
  verificarOng,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, "../", "private", "ong", "cadastrarDoacoesONG.html"),
    );
  },
);
app.get("/relatorioOng.html", verificarToken, verificarOng, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../", "private", "ong", "relatorioOng.html"),
  );
});
app.get("/suporteONG.html", verificarToken, verificarOng, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../", "private", "ong", "suporteONG.html"),
  );
});
app.get("/minhaContaOng.html", verificarToken, verificarOng, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../", "private", "ong", "minhaContaOng.html"),
  );
});

app.use("/doacoesConcluidasEmpresa", doacoesConcluidasRoutes);
app.use("/doacoesConcluidasONG", doacoesConcluidasRoutes);

app.post("/enviar-contato", contactLimiter, async (req, res) => {
  try {
    const { nome, email, assunto, descricao } = req.body;

    const msg = {
      to: process.env.EMAIL_RECIPIENT,
      from: process.env.EMAIL_REMETENTE,
      subject: `[Contato NutriAção] - ${assunto || "Mensagem de Suporte"}`,
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

    res
      .status(200)
      .json({
        message:
          "Mensagem enviada com sucesso! Responderemos em até 3 dias úteis, lembre-se de verificar a caixa de Spam",
      });
  } catch (error) {
    console.error("Erro ao enviar e-mail via SendGrid:", error);
    res
      .status(500)
      .json({ message: "Erro ao enviar a mensagem. Tente novamente." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});

/*
  rotas de funcionalidades específicas:
  - endpoints relacionados a doações concluídas são montados acima e delegam
  a lógica para o módulo doacoesConcluidasRoutes (ex.: listar, confirmar, etc.)
*/

/*
  endpoint de contato/serviço de e-mail:
  - recebe nome, email, assunto e descricao do corpo da requisição
  - constrói mensagem html e envia via sendgrid para o destinatário configurado
  - usa o middleware contactLimiter para limitar abusos
  - responde com status apropriado dependendo do sucesso/erro
*/

/*
  inicialização do servidor:
  - inicia o listen na porta configurada e imprime informações úteis no console
*/
