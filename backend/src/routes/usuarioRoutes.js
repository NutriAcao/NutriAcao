import express from "express";
import { verificarToken } from "./authMiddleware.js";
import { buscarUsuarioPorId, atualizarResponsavelEmpresa, atualizarDadosEmpresa } from "../model/minhaContaEmpresaModel.js";

const router = express.Router();

router.get("/usuario", verificarToken, async (req, res) => {
  try {
    const { id, tipo } = req.usuario;

    if (!id || !tipo)
      return res.status(400).json({ success: false, message: "Token inválido." });

    const dados = await buscarUsuarioPorId(id, tipo);
    if (!dados)
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });

    res.json({ success: true, message: "Dados retornados com sucesso.", data: dados });
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
    res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
});

router.put("/usuario", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    await atualizarResponsavelEmpresa(userId, req.body);
    res.status(200).json({ success: true, message: "Dados do responsável atualizados com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar usuário:", erro);
    res.status(400).json({ success: false, message: erro.message });
  }
});

router.put("/empresa", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    await atualizarDadosEmpresa(userId, req.body);
    res.status(200).json({ success: true, message: "Dados da empresa atualizados com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar empresa:", erro);
    res.status(400).json({ success: false, message: erro.message });
  }
});

export default router;
