// src/routes/reservaRoutes.js - VERIFIQUE SE ESTÁ ASSIM
import express from 'express';
import { 
    reservarDoacaoEmpresa, 
    reservarPedidoOng,
    concluirDoacao,
    cancelarReserva,
    concluirPedido
} from '../controllers/reservaController.js';
import { verificarToken } from './authMiddleware.js'; 

const router = express.Router();

// --- ROTAS DE RESERVA ---
router.put('/reservar-doacao', verificarToken, reservarDoacaoEmpresa);
router.put('/reservar-pedido', verificarToken, reservarPedidoOng);

// --- ROTAS DE AÇÃO ---
router.put('/concluir-doacao', verificarToken, concluirDoacao);
router.put('/concluir-pedido', verificarToken, concluirPedido);
router.put('/cancelar-reserva', verificarToken, cancelarReserva);

export default router;