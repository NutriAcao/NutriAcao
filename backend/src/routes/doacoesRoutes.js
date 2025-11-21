// backend/src/routes/doacoesRoutes.js - APENAS ROTAS GET
import express from 'express';
import { getPedidosDisponiveis } from '../controllers/doacaoOngController.js';
import { verificarToken } from '../routes/authMiddleware.js';
import { getMeusExcedentesDisponiveis } from '../controllers/doacaoEmpresaController.js';
import { 
  getMeusPedidosDisponiveis, 
  getMeusPedidosReservados, 
  getDoacoesQueReservei 
} from '../controllers/doacaoOngController.js'; 

const router = express.Router();

// Apenas rotas GET
router.get('/meusPedidosReservados', verificarToken, getMeusPedidosReservados); 
router.get('/doacoesReservadas', verificarToken, getDoacoesQueReservei);
router.get('/meus-pedidos-disponiveis', verificarToken, getMeusPedidosDisponiveis);
router.get('/pedidos-disponiveis-empresa', verificarToken, getPedidosDisponiveis);
router.get('/meus-excedentes-disponiveis', verificarToken, getMeusExcedentesDisponiveis);

// REMOVA esta linha se estiver usando arquivo separado
// router.post('/solicitacoes-ong', verificarToken, cadastrarSolicitacaoOng);

export default router;