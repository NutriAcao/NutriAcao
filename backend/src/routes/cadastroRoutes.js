import { Router } from 'express';
import { cadastrarONG } from '../controllers/ongController.js';
import { cadastrarEmpresa, buscarEmpresa } from '../controllers/empresaController.js';
import { cadastrarDoacaoEmpresa } from '../controllers/doacaoEmpresaController.js'
import { cadastrarDoacaoOng } from '../controllers/doacaoOngController.js';

const router = Router();

// rota de POST que o formulário deve enviar
router.post('/ong', cadastrarONG);
router.post('/cadastrar', cadastrarEmpresa);
router.get('/:id', buscarEmpresa);
router.post('/doacaoEmpresa', cadastrarDoacaoEmpresa)
router.post('/doacaoOng', cadastrarDoacaoOng)

export default router;