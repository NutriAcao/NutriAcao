// /backend/src/routes/depoimentosRoutes.js

import express from 'express';
import { depoimentosController } from '../controllers/depoimentosController.js';

const router = express.Router();

// Middleware de autenticação básico (simplificado)
const authenticate = (req, res, next) => {
  // Em uma aplicação real, você validaria o token JWT aqui
  next();
};

// Middleware de admin (simplificado)
const isAdmin = (req, res, next) => {
  // Em uma aplicação real, você verificaria se o usuário é admin
  // Por enquanto, vamos usar um header simples para demonstração
  const isAdmin = req.headers['x-admin'] === 'true';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// Rotas públicas
router.get('/', depoimentosController.getDepoimentosAprovados);
router.post('/', depoimentosController.createDepoimento);

// Rotas administrativas
router.get('/pendentes', authenticate, isAdmin, depoimentosController.getDepoimentosPendentes);
router.put('/:id/aprovar', authenticate, isAdmin, depoimentosController.approveDepoimento);
router.delete('/:id', authenticate, isAdmin, depoimentosController.deleteDepoimento);

export default router;