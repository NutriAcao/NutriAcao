// routes/doacoesRoutes.js
import express from 'express';
import { getPedidosDisponiveis } from '../controllers/doacaoOngController.js';
import { verificarToken } from '../routes/authMiddleware.js';
import { getMeusExcedentesDisponiveis } from '../controllers/doacaoEmpresaController.js';
import { 
  getMeusPedidosDisponiveis, 
  getMeusPedidosReservados, 
  getDoacoesQueReservei 
} from '../controllers/doacaoOngController.js';
import { getDoacoesDisponiveisONG } from '../controllers/doacoesDisponiveisController.js';

const router = express.Router();

// Rotas de visualização (APENAS GET)
router.get('/meusPedidosReservados', verificarToken, getMeusPedidosReservados); 
router.get('/doacoesReservadas', verificarToken, getDoacoesQueReservei);
router.get('/meus-pedidos-disponiveis', verificarToken, getMeusPedidosDisponiveis);
router.get('/pedidos-disponiveis-empresa', verificarToken, getPedidosDisponiveis);
router.get('/meus-excedentes-disponiveis', verificarToken, getMeusExcedentesDisponiveis);
router.get('/doacoes-disponiveis-ong', verificarToken, getDoacoesDisponiveisONG);

export default router;