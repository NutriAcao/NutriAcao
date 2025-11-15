import express from "express";
import { verificarToken } from "./authMiddleware.js";
import { buscarOngPorId, atualizarResponsavelOng, atualizarDadosOng } from "../model/minhaContaOngModel.js";

const router = express.Router();

// GET para buscar dados da ONG
router.get("/usuario", verificarToken, async (req, res) => {
  try {
    const { id } = req.usuario;

    if (!id)
      return res.status(400).json({ success: false, message: "Token inválido." });

    const dados = await buscarOngPorId(id);
    if (!dados)
      return res.status(404).json({ success: false, message: "ONG não encontrada." });

    res.json({ success: true, message: "Dados retornados com sucesso.", data: dados });
  } catch (erro) {
    console.error("Erro ao buscar ONG:", erro);
    res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
});

// PUT para atualizar responsável da ONG
router.put("/usuario", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    await atualizarResponsavelOng(userId, req.body);
    res.status(200).json({ success: true, message: "Dados do responsável atualizados com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar responsável da ONG:", erro);
    res.status(400).json({ success: false, message: erro.message });
  }
});

// PUT para atualizar dados da ONG
router.put("/ong", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    await atualizarDadosOng(userId, req.body);
    res.status(200).json({ success: true, message: "Dados da ONG atualizados com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar ONG:", erro);
    res.status(400).json({ success: false, message: erro.message });
  }
});

export default router;