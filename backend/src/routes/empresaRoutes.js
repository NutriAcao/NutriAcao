// backend/src/routes/empresaRoutes.js
import express from 'express';
import { cadastrarEmpresa, buscarEmpresa } from '../controllers/empresaController.js';

const router = express.Router();

// Rota para cadastrar nova empresa
router.post('/cadastrar', cadastrarEmpresa);

// Rota para buscar empresa por ID
router.get('/:id', buscarEmpresa);

export default router;