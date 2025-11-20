import express from 'express';
import { getMeuHistorico } from '../controllers/historicoController.js';
import { verificarToken } from '../routes/authMiddleware.js';

const router = express.Router();

// Rota única para histórico (funciona para ONG e Empresa)
router.get('/meu-historico', verificarToken, getMeuHistorico);

export default router;