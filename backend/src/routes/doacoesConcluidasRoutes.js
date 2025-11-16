import express from 'express';
import { buscarExcedentesDisponiveisEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarExcedentesReservadosPorEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarDoacoesSolicitadasEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarExcedentesConcluidosPorEmpresa } from '../model/doacoesEmpresaModel.js';
import { buscarDoacoesSolicitadasConcluidasEmpresa } from '../model/doacoesEmpresaModel.js';

import { buscarSolicitacoesDisponiveisONG } from '../model/doacoesONGModel.js';
import { buscarSolicitacoesAndamentoONG } from '../model/doacoesONGModel.js';
import { buscarExcedentesAndamentoONG } from '../model/doacoesONGModel.js';
import { buscarSolicitacoesConcluidasONG } from '../model/doacoesONGModel.js';
import { buscarExcedentesConcluidosONG } from '../model/doacoesONGModel.js';

import { verificarToken } from './authMiddleware.js';
import { getDetalhesExcedente, 
    getDetalhesSolicitacao,
    getMinhasSolicitacoesReservadas, 
    getMeusExcedentesReservados } from '../controllers/doacaoDetalhesController.js';

const router = express.Router();

router.get('/doacoesSolicitadasEmpresa', verificarToken, getMinhasSolicitacoesReservadas);

// O frontend chama "/doacoesConcluidasEmpresa/excedentesReservadosEmpresa"
router.get('/excedentesReservadosEmpresa', verificarToken, getMeusExcedentesReservados);
router.get('/detalhes/excedente/:id', verificarToken, getDetalhesExcedente);
router.get('/detalhes/solicitacao/:id', verificarToken, getDetalhesSolicitacao);
//Busca Excedentes disponíveis da empresa
router.get('/doacoesEmpresa', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarExcedentesDisponiveisEmpresa(id);
        

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma excedente disponível para este email' });
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
            return res.status(404).json({ message: 'Nenhum excedente reservado para este email' });
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
            return res.status(404).json({ message: 'Nenhuma doação solicitada para este email' });
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
            return res.status(404).json({ message: 'Nenhum excedente concluído para este email' });
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
            return res.status(404).json({ message: 'Nenhuma solicitação concluída para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});






// ROTAS PARA ONGS


router.get('/solicitacoesDisponiveisONG', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarSolicitacoesDisponiveisONG(id);

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma solicitação disponível para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/solicitacoesAndamentoONG', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarSolicitacoesAndamentoONG(id);

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma solicitação em andamento para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/excedentesAndamentoONG', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarExcedentesAndamentoONG(id);

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhum excedente em andamento para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/solicitacoesConcluidasONG', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarSolicitacoesConcluidasONG(id);

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhuma solicitação em andamento para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/excedentesConcluidosONG', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
    }

    try {
        const doacoes = await buscarExcedentesConcluidosONG(id);

        if (!doacoes) {
            return res.status(404).json({ message: 'Nenhum excedente concluído para este email' });
        }

        res.status(200).json(doacoes);
    } catch (err) {
        console.error('Erro na rota /doacoes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


export default router;
