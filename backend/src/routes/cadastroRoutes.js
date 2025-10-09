import { Router } from 'express';
import { cadastrarPessoaFisica } from '../controllers/pessoaFisicaController.js'; 
import { cadastrarResponsavelLegal } from '../controllers/responsavelLegalController.js';
import { cadastrarOng } from '../controllers/ongController.js';
import { cadastrarEmpresa } from '../controllers/empresaController.js';

const router = Router();

// Rota de POST que o formulário da Pessoa Física deve enviar para
router.post('/pessoafisica', cadastrarPessoaFisica);
router.post('/responsavellegal', cadastrarResponsavelLegal);
router.post('/ong', cadastrarOng);
router.post('/empresa', cadastrarEmpresa);

export default router;