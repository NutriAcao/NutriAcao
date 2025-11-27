import express from 'express';
import { verificarToken } from './authMiddleware.js';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// =====================================================
// ROTAS PARA HISTÓRICO DE DOAÇÕES CONCLUÍDAS
// =====================================================

// Doações concluídas pela ONG
router.get('/solicitacoesConcluidasONG', verificarToken, async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Buscar solicitações concluídas da ONG
        const { data: solicitacoes, error } = await supabase
            .from('solicitacoes_ong_concluido')
            .select(`
                id,
                titulo,
                descricao,
                quantidade_desejada,
                status,
                data_criacao,
                empresa:empresas(nome_fantasia, razao_social)
            `)
            .eq('ong_id', id)
            .eq('status', 'concluído')
            .order('data_criacao', { ascending: false });

        if (error) throw error;

        res.json(solicitacoes || []);

    } catch (err) {
        console.error('Erro na rota /solicitacoesConcluidasONG:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Excedentes concluídos pela ONG
router.get('/excedentesConcluidosONG', verificarToken, async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Buscar doações concluídas da ONG
        const { data: doacoes, error } = await supabase
            .from('doacoes_concluidas')
            .select(`
                id,
                titulo,
                descricao,
                quantidade,
                data_validade,
                status,
                data_publicacao,
                empresa:empresas(nome_fantasia, razao_social)
            `)
            .eq('ong_id', id)
            .eq('status', 'concluída')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;

        res.json(doacoes || []);

    } catch (err) {
        console.error('Erro na rota /excedentesConcluidosONG:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Doações solicitadas concluídas pela Empresa
router.get('/doacoesSolicitadasConcluidasEmpresa', verificarToken, async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Buscar solicitações concluídas pela empresa
        const { data: solicitacoes, error } = await supabase
            .from('solicitacoes_ong_concluido')
            .select(`
                id,
                titulo,
                descricao,
                quantidade_desejada,
                status,
                data_criacao,
                ong:ongs(nome_ong)
            `)
            .eq('empresa_id', id)
            .eq('status', 'concluído')
            .order('data_criacao', { ascending: false });

        if (error) throw error;

        res.json(solicitacoes || []);

    } catch (err) {
        console.error('Erro na rota /doacoesSolicitadasConcluidasEmpresa:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Excedentes concluídos pela Empresa
router.get('/excedentesConcluidosEmpresa', verificarToken, async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Buscar excedentes concluídos pela empresa
        const { data: excedentes, error } = await supabase
            .from('doacoes_concluidas')
            .select(`
                id,
                titulo,
                descricao,
                quantidade,
                data_validade,
                status,
                data_publicacao,
                ong:ongs(nome_ong)
            `)
            .eq('empresa_id', id)
            .eq('status', 'concluída')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;

        res.json(excedentes || []);

    } catch (err) {
        console.error('Erro na rota /excedentesConcluidosEmpresa:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;