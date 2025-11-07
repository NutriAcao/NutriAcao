/* arquivo: backend/src/routes/cadastroRoutes.js - arquivo de rotas do backend: define endpoints relacionados a cadastroroutes - define rotas com router; funções/constantes: router */

/*
	rotas de cadastro:
	- endpoints para cadastro de ong, empresa e registro de doações
	- delegam a lógica para os controllers correspondentes
*/
import { Router } from "express";
import { cadastrarONG } from "../controllers/ongController.js";
import { cadastrarEmpresa } from "../controllers/empresaController.js";
import { cadastrarDoacaoEmpresa } from "../controllers/doacaoEmpresaController.js";
import { cadastrarDoacaoOng } from "../controllers/doacaoOngController.js";

const router = Router();

router.post("/ong", cadastrarONG);
router.post("/empresa", cadastrarEmpresa);
router.post("/doacaoEmpresa", cadastrarDoacaoEmpresa);
router.post("/doacaoOng", cadastrarDoacaoOng);

export default router;
