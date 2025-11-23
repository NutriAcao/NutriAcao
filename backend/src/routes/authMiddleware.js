//refatora
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export function verificarToken(req, res, next) {
    console.log('Verificando token (cookie ou header Authorization)...');

    // Aceita token via cookie ou header Authorization: Bearer <token>
    let token = req.cookies && req.cookies.token;
    if (!token && req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
    }

    console.log('Token presente:', token ? 'SIM' : 'NÃO');

    if (!token) {
        console.log('Token não encontrado nos cookies - REDIRECIONANDO PARA LOGIN');
        
        if (req.accepts('html')) {
            return res.redirect('/loginpage');
        } else {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso necessário'
            });
        }
    }

    jwt.verify(token, JWT_SECRET, (err, usuarioDecodificado) => {
        if (err) {
            console.log('Token inválido:', err.message, '- REDIRECIONANDO PARA LOGIN');
            
            res.clearCookie('token');
            
            if (req.accepts('html')) {
                return res.redirect('/loginpage');
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Token inválido ou expirado'
                });
            }
        }

        console.log('Token válido. Usuário:', usuarioDecodificado);
        
        req.usuario = usuarioDecodificado;
        next();
    });
}