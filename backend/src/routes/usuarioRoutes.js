import express from "express";
import { verificarToken } from "./authMiddleware.js";
import * as EmpresaController from "../controllers/minhaContaEmpresaController.js";
import * as OngController from "../controllers/minhaContaOngController.js";

const router = express.Router();

// GET /api/usuario -> despacha para controller correto baseado no tipo do token
router.get("/usuario", verificarToken, (req, res) => {
	const tipo = req.usuario && req.usuario.tipo;
	if (tipo === "empresa") return EmpresaController.getEmpresaCompleta(req, res);
	if (tipo === "ong") return OngController.getOngCompleta(req, res);
	return res.status(400).json({ success: false, message: "Tipo de usuário inválido." });
});

// PUT /api/usuario -> atualiza dados do responsável (despacha por tipo)
router.put("/usuario", verificarToken, (req, res) => {
	const tipo = req.usuario && req.usuario.tipo;
	if (tipo === "empresa") return EmpresaController.putResponsavelEmpresa(req, res);
	if (tipo === "ong") return OngController.putResponsavelOng(req, res);
	return res.status(400).json({ success: false, message: "Tipo de usuário inválido." });
});

// PUT /api/usuario/senha -> alterar senha (despacha por tipo)
router.put("/usuario/senha", verificarToken, (req, res) => {
  const tipo = req.usuario && req.usuario.tipo;
  if (tipo === "empresa") return EmpresaController.putAlterarSenha(req, res);
  if (tipo === "ong") return OngController.putAlterarSenha(req, res);
  return res.status(400).json({ success: false, message: "Tipo de usuário inválido." });
});

// Endpoints específicos para atualizar dados completos
router.put("/empresa", verificarToken, EmpresaController.putDadosEmpresa);
// DELETE /api/usuario -> excluir conta (despacha por tipo)
router.delete("/usuario", verificarToken, (req, res) => {
	const tipo = req.usuario && req.usuario.tipo;
	if (tipo === "empresa") return EmpresaController.deleteConta(req, res);
	if (tipo === "ong") return OngController.deleteConta(req, res);
	return res.status(400).json({ success: false, message: "Tipo de usuário inválido." });
});
router.put("/ong", verificarToken, OngController.putDadosOng);

export default router;
