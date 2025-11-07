// backend/routes/reservaRoutes.js
import express from 'express';
import { 
    reservarDoacaoEmpresa, 
    reservarPedidoOng,
    concluirDoacao, 
    concluirPedido
} from '../controllers/reservaController.js';
import { verificarToken } from '../routes/authMiddleware.js'; 
import { cancelarReserva } from '../controllers/reservaController.js';

const router = express.Router();

// --- ROTAS DE RESERVA ---

// Rota para uma ONG reservar uma Doação de Empresa
// PUT /api/reservar-doacao
router.put('/reservar-doacao', verificarToken, async (req, res) => {
    // 1. O ID da ONG logada é pego do token (authMiddleware)
    const id_ong_logada = req.user.id; 
    
    // 2. Adiciona o ID da ONG ao corpo da requisição para o controller
    req.body.id_ong_logada = id_ong_logada; 

    // 3. Chama o controller com a assinatura padrão (req, res)
    await reservarDoacaoEmpresa(req, res);
});

// Rota para uma Empresa reservar um Pedido de ONG
// PUT /api/reservar-pedido
router.put('/reservar-pedido', verificarToken, async (req, res) => {
    // 1. O ID da Empresa logada é pego do token (authMiddleware)
    const id_empresa_logada = req.user.id; 

    // 2. Adiciona o ID da Empresa ao corpo da requisição para o controller
    req.body.id_empresa_logada = id_empresa_logada; 

    // 3. Chama o controller com a assinatura padrão (req, res)
    await reservarPedidoOng(req, res);
});


// --- ROTAS DE CONCLUSÃO ---

// PUT /api/concluir-doacao
router.put('/concluir-doacao', verificarToken, async (req, res) => {
    // 1. O ID do usuário logado é pego do token (funciona para ONG ou Empresa)
    const id_usuario_logado = req.user.id;
    
    // 2. Adiciona o ID ao corpo da requisição para que o controller possa verificar a permissão
    req.body.id_usuario_logado = id_usuario_logado; 

    // 3. Chama o controller com a assinatura padrão (req, res)
    await concluirDoacao(req, res);
});

// PUT /api/concluir-pedido
router.put('/concluir-pedido', verificarToken, async (req, res) => {
    // 1. O ID do usuário logado é pego do token (funciona para ONG ou Empresa)
    const id_usuario_logado = req.user.id;
    
    // 2. Adiciona o ID ao corpo da requisição
    req.body.id_usuario_logado = id_usuario_logado; 
    
    // 3. Chama o controller com a assinatura padrão (req, res)
    await concluirPedido(req, res);
});
router.put('/cancelar-reserva', verificarToken, async (req, res) => {
    // O ID do usuário logado é pego do token (funciona para ONG ou Empresa)
    const id_usuario_logado = req.user.id;
    
    // Adiciona o ID ao corpo da requisição
    req.body.id_usuario_logado = id_usuario_logado; 
    
    // Chama o controller
    await cancelarReserva(req, res);
});
export default router;