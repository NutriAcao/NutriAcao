import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export function verificarEmpresa(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/loginpage');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.tipo !== 'empresa') {
      // return res.status(403).send('Acesso restrito a empresas.');
      return res.redirect('/loginpage');
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.redirect('/loginpage');
  }
}

export function verificarOng(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/loginpage');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.tipo !== 'ong') {
      // return res.status(403).send('Acesso restrito a ONGs.');
      return res.redirect('/loginpage');
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.redirect('/loginpage');
  }
}
