import express from 'express';
import { getPedidosDisponiveis } from '../controllers/doacaoOngController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Verifique se o caminho está correto
import { getMeusExcedentesDisponiveis, getMeusItensReservados } from '../controllers/doacaoEmpresaController.js';
import { getMeusPedidosDisponiveis, getMeusItensReservadosOng } from '../controllers/doacaoOngController.js'; 
const router = express.Router();

// Rota que o seu frontend (visualizacaoOngs.js) está chamando
// GET /api/pedidos-disponiveis-empresa
router.get('/meus-pedidos-disponiveis', authMiddleware, getMeusPedidosDisponiveis);
router.get('/meus-itens-reservados-ong', authMiddleware, getMeusItensReservadosOng);
router.get('/pedidos-disponiveis-empresa', authMiddleware, getPedidosDisponiveis);
router.get('/meus-excedentes-disponiveis', authMiddleware, getMeusExcedentesDisponiveis);
router.get('/meus-itens-reservados', authMiddleware, getMeusItensReservados);
export default router;