import { Router } from 'express';
import { cadastrarONG } from '../controllers/ongController.js';
import { cadastrarEmpresa } from '../controllers/empresaController.js';

const router = Router();

// Rota de POST que o formulário deve enviar
router.post('/ong', cadastrarONG);
router.post('/empresa', cadastrarEmpresa);

export default router;