import express from 'express';
import { getPedidosDisponiveis } from '../controllers/doacaoOngController.js';
import { verificarToken } from '../routes/authMiddleware.js'; // Verifique se o caminho está correto
import { getMeusExcedentesDisponiveis, getMeusItensReservados } from '../controllers/doacaoEmpresaController.js';
import { getMeusPedidosDisponiveis, getMeusItensReservadosOng } from '../controllers/doacaoOngController.js'; 
const router = express.Router();

// Rota que o seu frontend (visualizacaoOngs.js) está chamando
// GET /api/pedidos-disponiveis-empresa
router.get('/meus-pedidos-disponiveis', verificarToken, getMeusPedidosDisponiveis);
router.get('/meus-itens-reservados-ong', verificarToken, getMeusItensReservadosOng);
router.get('/pedidos-disponiveis-empresa', verificarToken, getPedidosDisponiveis);
router.get('/meus-excedentes-disponiveis', verificarToken, getMeusExcedentesDisponiveis);
router.get('/meus-itens-reservados', verificarToken, getMeusItensReservados);
export default router;