import express from 'express';
import { getMeuHistorico } from '../controllers/historicoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota única para histórico (funciona para ONG e Empresa)
router.get('/meu-historico', authMiddleware, getMeuHistorico);

export default router;