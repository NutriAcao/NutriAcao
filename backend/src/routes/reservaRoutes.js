// backend/routes/reservaRoutes.js
import express from 'express';
import { reservarDoacaoEmpresa, reservarPedidoOng } from '../controllers/reservaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Assumindo que você tem um middleware de autenticação

const router = express.Router();

// Rota para uma ONG reservar uma Doação de Empresa
// A ONG (logada) envia o ID da doação que ela quer reservar
router.put('/reservar-doacao', authMiddleware, async (req, res) => {
    const { doacao_id } = req.body;
    const id_ong_logada = req.user.id; // Pega o ID da ONG logada (do token/authMiddleware)

    // Passa os dados para a função do controller
    await reservarDoacaoEmpresa(req, { ...req.body, doacao_id, id_ong_logada }, res);
});

// Rota para uma Empresa reservar um Pedido de ONG
// A Empresa (logada) envia o ID do pedido que ela quer reservar
router.put('/reservar-pedido', authMiddleware, async (req, res) => {
    const { pedido_id } = req.body;
    const id_empresa_logada = req.user.id; // Pega o ID da Empresa logada

    // Passa os dados para a função do controller
    await reservarPedidoOng(req, { ...req.body, pedido_id, id_empresa_logada }, res);
});
// Em backend/routes/reservaRoutes.js
// ... (depois das rotas 'reservar')
import { concluirDoacao, concluirPedido } from '../controllers/reservaController.js';

router.put('/concluir-doacao', authMiddleware, async (req, res) => {
    const { doacao_id } = req.body;
    const id_usuario_logado = req.user.id;
    await concluirDoacao(req, { ...req.body, doacao_id, id_usuario_logado }, res);
});

router.put('/concluir-pedido', authMiddleware, async (req, res) => {
    const { pedido_id } = req.body;
    const id_usuario_logado = req.user.id;
    await concluirPedido(req, { ...req.body, pedido_id, id_usuario_logado }, res);
});

export default router;
