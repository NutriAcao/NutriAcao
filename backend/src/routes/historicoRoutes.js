import express from 'express';
import { getHistoricoONG } from '../controllers/historicoController.js';
import { verificarToken } from '../routes/authMiddleware.js';
import { verificarOng } from '../routes/tipoAuthMiddleware.js';

const router = express.Router();

// Rota específica para histórico da ONG
router.get('/historico-ong', verificarToken, verificarOng, getHistoricoONG);
router.get('/solicitacoes-concluidas/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        console.log('📋 Buscando solicitações concluídas para empresa:', empresaId);
        
        const query = `
            SELECT 
                soc.id,
                soc.titulo,
                soc.descricao,
                soc.quantidade_desejada as quantidade,
                soc.status,
                soc.data_criacao,
                o.nome_ong,
                o.email_institucional as email_ong,
                c.nome as categoria
            FROM solicitacoes_ong_concluido soc
            LEFT JOIN ongs o ON soc.ong_id = o.id
            LEFT JOIN categorias c ON soc.categoria_id = c.id
            WHERE soc.empresa_id = $1 
                AND soc.status = 'concluído'
            ORDER BY soc.data_criacao DESC
        `;
        
        const result = await pool.query(query, [empresaId]);
        console.log('✅ Solicitações concluídas encontradas:', result.rows.length);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Erro ao buscar solicitações concluídas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar excedentes concluídos pela empresa
router.get('/excedentes-concluidos/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        console.log('📦 Buscando excedentes concluídos para empresa:', empresaId);
        
        const query = `
            SELECT 
                dc.id,
                dc.titulo,
                dc.descricao,
                dc.quantidade,
                dc.data_validade,
                dc.status,
                dc.data_publicacao,
                o.nome_ong
            FROM doacoes_concluidas dc
            LEFT JOIN ongs o ON dc.ong_id = o.id
            WHERE dc.empresa_id = $1 
                AND dc.status = 'concluída'
            ORDER BY dc.data_publicacao DESC
        `;
        
        const result = await pool.query(query, [empresaId]);
        console.log('✅ Excedentes concluídos encontrados:', result.rows.length);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Erro ao buscar excedentes concluídos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;