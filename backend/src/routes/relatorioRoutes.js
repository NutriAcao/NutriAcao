// backend/src/routes/relatorioRoutes.js
import express from 'express';
import { verificarToken } from './authMiddleware.js'; // ← MUDEI AQUI
import { verificarEmpresa, verificarOng } from './tipoAuthMiddleware.js'; // ← E AQUI
import { 
    getRelatoriosImpacto, 
    getRelatoriosConsumo,
    getEstatisticas,
    getOngsParceiras 
} from '../controllers/relatoriosController.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

/**
 * @route   GET /api/relatorios/relatorios-impacto
 * @desc    Buscar relatórios de impacto (para empresas) - usa tabela doacoes_concluidas
 * @access  Private (Empresas)
 */
router.get('/relatorios-impacto', verificarEmpresa, getRelatoriosImpacto);

/**
 * @route   GET /api/relatorios/ongs-parceiras
 * @desc    Buscar ONGs parceiras para filtros
 * @access  Private (Empresas)
 */
router.get('/ongs-parceiras', verificarEmpresa, getOngsParceiras);

/**
 * @route   GET /api/relatorios/relatorios-consumo
 * @desc    Buscar relatórios de consumo (para ONGs) - usa tabela doacoes_concluidas
 * @access  Private (ONGs)
 */
router.get('/relatorios-consumo', verificarOng, getRelatoriosConsumo);

/**
 * @route   GET /api/relatorios/estatisticas
 * @desc    Buscar estatísticas resumidas
 * @access  Private
 */
router.get('/estatisticas', getEstatisticas);

export default router;