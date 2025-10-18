import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

//Middleware para verificar o token JWT
export function verificarToken(req, res, next) {
    const token = req.cookies.token;

  if (!token) {
    //redireciona o usuário para a página de login caso não tenha token
    return res.redirect('/loginpage');
    
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    //Se o token for inválido ou expirado, redireciona para a página de login
    return res.redirect('/loginpage');
  }
}