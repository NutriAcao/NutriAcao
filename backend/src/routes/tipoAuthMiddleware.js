//refatorado
export function verificarEmpresa(req, res, next) {
    console.log('Verificando se é empresa...', req.usuario);
    
    if (!req.usuario) {
        console.log('Usuário não autenticado - REDIRECIONANDO PARA LOGIN');
        return res.redirect('/loginpage');
    }
    
    if (req.usuario.tipo !== 'empresa') {
        console.log('Não é empresa:', req.usuario.tipo, '- REDIRECIONANDO PARA LOGIN');
        return res.redirect('/loginpage');
    }
    
    console.log('É empresa, acesso permitido');
    next();
}

export function verificarOng(req, res, next) {
    console.log('Verificando se é ONG...', req.usuario);
    
    if (!req.usuario) {
        console.log('Usuário não autenticado - REDIRECIONANDO PARA LOGIN');
        return res.redirect('/loginpage');
    }
    
    if (req.usuario.tipo !== 'ong') {
        console.log('Não é ONG:', req.usuario.tipo, '- REDIRECIONANDO PARA LOGIN');
        return res.redirect('/loginpage');
    }
    
    console.log('É ONG, acesso permitido');
    next();
}