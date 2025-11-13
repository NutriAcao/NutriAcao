import express from 'express';
import { buscarExcedentesDisponiveisEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarExcedentesReservadosPorEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarDoacoesSolicitadasEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarExcedentesConcluidosPorEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarDoacoesSolicitadasConcluidasEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarDoacoesConcluidasONG } from '../model/doacoesONGModel.js';
import { getDetalhesDoacao } from '../controllers/doacaoDetalhesController.js';
import { verificarToken } from './authMiddleware.js'; 
const router = express.Router();

//Busca Excedentes disponíveis da empresa
router.get('/doacoesEmpresa', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarExcedentesDisponiveisEmpresa(id);
        

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma doação encontrada para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

//Busca excedentes da empresa que foram reservados por uma ONG
router.get('/excedentesReservadosEmpresa', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarExcedentesReservadosPorEmpresa(id);
        

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma doação encontrada para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Busca doações solicitadas por ONGs que foram aceitas pela Empresa
router.get('/doacoesSolicitadasEmpresa', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarDoacoesSolicitadasEmpresa(id);
        

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma doação encontrada para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Busca excedentes concluídos pela empresa
router.get('/excedentesConcluidosEmpresa', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarExcedentesConcluidosPorEmpresa(id);
        

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma doação encontrada para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

//Busca doações solicitadas por ONGs que foram concluídas pela empresa
router.get('/doacoesSolicitadasConcluidasEmpresa', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarDoacoesSolicitadasConcluidasEmpresa(id);
        

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma doação encontrada para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});






// ROTAS PARA ONGS
router.get('/doacoesONG', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarDoacoesConcluidasONG(email);

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma doação encontrada para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


router.get('/detalhes/:tipo/:id', verificarToken, getDetalhesDoacao);

export default router;
