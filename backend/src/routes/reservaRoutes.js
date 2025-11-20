// src/routes/reservaRoutes.js
import express from 'express';
import { 
    reservarDoacaoEmpresa, 
    reservarPedidoOng,
    concluirDoacao,
    cancelarReserva,
    concluirPedido
} from '../controllers/reservaController.js';
import { verificarToken } from './authMiddleware.js'; 
import { getPedidosDisponiveis } from '../controllers/pedidoController.js'; 

const router = express.Router();

// --- ROTA GET PARA BUSCAR PEDIDOS (Mantida) ---
router.get('/pedidos-disponiveis-empresa', verificarToken, getPedidosDisponiveis);

// --- ROTAS DE RESERVA (Ainda precisam injetar o ID no body para compatibilidade) ---

// Rota para uma ONG reservar uma Doação de Empresa
// PUT /api/reservar-doacao
router.put('/reservar-doacao', verificarToken, async (req, res) => {
    // Adiciona o ID da ONG ao corpo da requisição para o Controller usar
    req.body.id_ong_logada = req.usuario.id; 
    await reservarDoacaoEmpresa(req, res);
});

// Rota para uma Empresa reservar um Pedido de ONG
// PUT /api/reservar-pedido
router.put('/reservar-pedido', verificarToken, async (req, res) => {
    // Adiciona o ID da Empresa ao corpo da requisição para o Controller usar
    req.body.id_empresa_logada = req.usuario.id; 
    await reservarPedidoOng(req, res);
});


// --- ROTAS DE AÇÃO (CONCLUSÃO E CANCELAMENTO) - SIMPLIFICADAS ---
// O Controller corrigido pega o ID do usuário de req.usuario.id, simplificando o Router.

// PUT /api/concluir-doacao 
router.put('/concluir-doacao', verificarToken, concluirDoacao);

// PUT /api/concluir-pedido
router.put('/concluir-pedido', verificarToken, concluirPedido);

// PUT /api/cancelar-reserva
router.put('/cancelar-reserva', verificarToken, cancelarReserva);

export default router;