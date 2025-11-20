//refatorado
import express from 'express';
import { loginUsuario, getPerfilUsuario } from '../controllers/loginController.js';
import { verificarToken } from './authMiddleware.js'; 

const router = express.Router();

// Rota pública
router.post('/login', loginUsuario);

// Rota protegida
router.get('/perfil', verificarToken, getPerfilUsuario); 

export default router;