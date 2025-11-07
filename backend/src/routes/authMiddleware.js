/* arquivo: backend/src/routes/authMiddleware.js - arquivo de rotas do backend: define endpoints relacionados a authmiddleware - funções/constantes: decoded, token, JWT_SECRET */

/*
  middleware de autenticação:
  - verifica se existe cookie 'token' na requisição
  - valida o jwt usando a chave configurada
  - em caso de sucesso anexa o objeto usuário em req.usuario e chama next()
  - em caso de falha redireciona para a página de login
*/
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta";

export function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/loginpage");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.redirect("/loginpage");
  }
}
