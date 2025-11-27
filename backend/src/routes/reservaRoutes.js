// src/routes/reservaRoutes.js - CORRIGIR MÉTODOS
import express from 'express';
import { verificarToken } from './authMiddleware.js';
import { 
    reservarDoacaoONG,
    reservarSolicitacaoEmpresa,
    concluirDoacaoReservada,
    concluirPedidoONG,
    cancelarReservaONG
} from '../controllers/reservaController.js';

const router = express.Router();

// Rotas existentes
router.post('/reservar-doacao', verificarToken, reservarDoacaoONG);
router.post('/reservar-solicitacao', verificarToken, reservarSolicitacaoEmpresa);

// CORREÇÃO: Mudar PUT para POST
router.post('/concluir-doacao-reservada', verificarToken, concluirDoacaoReservada);
router.post('/concluir-pedido-ong', verificarToken, concluirPedidoONG);
router.post('/cancelar-reserva-ong', verificarToken, cancelarReservaONG);

export default router;