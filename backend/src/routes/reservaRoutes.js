// src/routes/reservaRoutes.js
import express from 'express';
import { verificarToken } from './authMiddleware.js';
import { 
    reservarDoacaoONG,
    reservarSolicitacaoEmpresa,
    concluirDoacao,
    concluirSolicitacao
} from '../controllers/reservaController.js';

const router = express.Router();

// ONG reserva doação disponível
router.post('/reservar-doacao', verificarToken, reservarDoacaoONG);

// Empresa reserva solicitação de ONG
router.post('/reservar-solicitacao', verificarToken, reservarSolicitacaoEmpresa);

// Concluir doação
router.post('/concluir-doacao', verificarToken, concluirDoacao);

// Concluir solicitação
router.post('/concluir-solicitacao', verificarToken, concluirSolicitacao);

export default router;