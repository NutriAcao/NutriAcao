/* arquivo: backend/src/routes/tipoAuthMiddleware.js - arquivo de rotas do backend: define endpoints relacionados a tipoauthmiddleware - funções/constantes: decoded, token, JWT_SECRET */

/*
  middleware de autorização por tipo de usuário:
  - verificarEmpresa: exige token válido e tipo 'empresa'
  - verificarOng: exige token válido e tipo 'ong'
  - em falha redireciona para a página de login
*/
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta";

export function verificarEmpresa(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/loginpage");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.tipo !== "empresa") {
      return res.redirect("/loginpage");
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.redirect("/loginpage");
  }
}

export function verificarOng(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/loginpage");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.tipo !== "ong") {
      return res.redirect("/loginpage");
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.redirect("/loginpage");
  }
}
