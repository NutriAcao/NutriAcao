import express from 'express';
import { getHistoricoONG } from '../controllers/historicoController.js';
import { verificarToken } from '../routes/authMiddleware.js';
import { verificarOng } from '../routes/tipoAuthMiddleware.js';

const router = express.Router();

// Rota específica para histórico da ONG
router.get('/historico-ong', verificarToken, verificarOng, getHistoricoONG);

export default router;