/* arquivo: backend/src/routes/loginRoutes.js - arquivo de rotas do backend: define endpoints relacionados a loginroutes - define rotas com router; funções/constantes: router */

/*
	rota de autenticação (login):
	- expõe um endpoint POST / para realizar autenticação usando loginController
*/
import { Router } from "express";
import { login } from "../controllers/loginController.js";

const router = Router();

router.post("/", login);

export default router;
