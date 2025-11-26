// authMiddleware.js
import jwt from 'jsonwebtoken';
import { pool } from '../config/dbPool.js';

export async function verificarToken(req, res, next) {
    try {
        console.log('=== VERIFICANDO TOKEN ===');
        
        // Verifica token no cookie
        let token = req.cookies.token;
        console.log('Token no cookie:', token ? 'PRESENTE' : 'AUSENTE');

        // Se não tem no cookie, verifica no header Authorization
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.replace('Bearer ', '');
            console.log('Token no header:', token ? 'PRESENTE' : 'AUSENTE');
        }

        if (!token) {
            console.log('❌ Token não encontrado');
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        console.log('Token encontrado, verificando...');

        // Verifica o token - ESTA É A LINHA IMPORTANTE
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);

        // Busca dados completos do usuário
        const usuarioId = decoded.id; // AGORA decoded ESTÁ DEFINIDO
        console.log('Buscando dados do usuário ID:', usuarioId);
        
        const userQuery = `
            SELECT 
                u.*,
                o.id as ong_id,
                o.nome_ong,
                e.id as empresa_id,
                e.nome_fantasia
            FROM usuarios u
            LEFT JOIN ongs o ON u.id = o.usuario_id
            LEFT JOIN empresas e ON u.id = e.usuario_id
            WHERE u.id = $1
        `;
        
        const userResult = await pool.query(userQuery, [usuarioId]);
        
        if (userResult.rows.length === 0) {
            console.log('❌ Usuário não encontrado no banco');
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        const userData = userResult.rows[0];
        console.log('Dados do usuário encontrados:', userData);
        
        // Adiciona os dados completos ao request
        req.usuario = {
            id: userData.id,
            email: userData.email,
            tipo: userData.tipo,
            nome: userData.nome,
            ong_id: userData.ong_id,
            empresa_id: userData.empresa_id,
            nomeInstituicao: userData.tipo === 'ong' ? userData.nome_ong : userData.nome_fantasia
        };

        console.log('✅ Token válido. Usuário:', req.usuario);
        next();
    } catch (error) {
        console.error('❌ Erro na verificação do token:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        
        return res.status(401).json({ message: 'Erro na autenticação' });
    }
}