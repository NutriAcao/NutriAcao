import express from "express";
import { verificarToken } from "./authMiddleware.js";
import * as OngController from "../controllers/minhaContaOngController.js";

const router = express.Router();

// Endpoints específicos para ONG (rotas alternativas)
router.get("/usuario/ong", verificarToken, OngController.getOngCompleta);
router.put("/usuario/ong", verificarToken, OngController.putResponsavelOng);
router.put("/ong", verificarToken, OngController.putDadosOng);

export default router;