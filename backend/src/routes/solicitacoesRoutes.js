// backend/src/routes/solicitacoesRoutes.js
import express from 'express';
import { cadastrarSolicitacaoOng } from '../controllers/solicitacoesOngController.js';
import { verificarToken } from './authMiddleware.js';

const router = express.Router();

router.post('/solicitacoes-ong', verificarToken, cadastrarSolicitacaoOng);

export default router;