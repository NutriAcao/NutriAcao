// backend/src/routes/ongRoutes.js
import express from 'express';
import { cadastrarOng } from '../controllers/ongController.js';

const router = express.Router();

// Rota para cadastrar nova ONG
router.post('/cadastrar', cadastrarOng);

export default router;