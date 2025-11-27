import { Router } from 'express';
import { cadastrarOng } from '../controllers/ongController.js';
import { cadastrarEmpresa, buscarEmpresa } from '../controllers/empresaController.js';
import { cadastrarDoacaoEmpresa } from '../controllers/doacaoEmpresaController.js'
import { cadastrarDoacaoOng } from '../controllers/doacaoOngController.js';

import { verificarToken } from './authMiddleware.js';

const router = Router();
// rota de POST que o formulário deve enviar
router.post('/ong', cadastrarOng);
router.post('/cadastrar', cadastrarEmpresa);
router.get('/:id', buscarEmpresa);
router.post('/doacaoEmpresa', verificarToken, cadastrarDoacaoEmpresa)
router.post('/doacaoOng', cadastrarDoacaoOng)


export default router;