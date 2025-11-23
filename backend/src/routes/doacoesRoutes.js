// routes/doacoesRoutes.js
import express from 'express';
import { verificarToken } from '../routes/authMiddleware.js';
import { 
    getDoacoesDisponiveisONG, 
    reservarDoacaoONG,
    concluirDoacao 
} from '../controllers/doacoesDisponiveisController.js';

const router = express.Router();

// Rotas para doações disponíveis
router.get('/doacoes-disponiveis-ong', verificarToken, getDoacoesDisponiveisONG);
router.post('/reservar-doacao', verificarToken, reservarDoacaoONG);
router.post('/concluir-doacao', verificarToken, concluirDoacao);

export default router;