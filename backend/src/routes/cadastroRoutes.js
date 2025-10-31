import { Router } from 'express';
import { cadastrarONG } from '../controllers/ongController.js';
import { cadastrarEmpresa } from '../controllers/empresaController.js';
import { cadastrarDoacaoEmpresa } from '../controllers/doacaoEmpresaController.js'
import { cadastrarDoacaoOng } from '../controllers/doacaoOngController.js';

const router = Router();

// Rota de POST que o formulário deve enviar
router.post('/ong', cadastrarONG);
router.post('/empresa', cadastrarEmpresa);
router.post('/doacaoEmpresa', cadastrarDoacaoEmpresa)
router.post('/doacaoOng', cadastrarDoacaoOng)

export default router;