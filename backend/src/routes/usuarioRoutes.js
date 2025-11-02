import express from "express";
import { verificarToken } from "./authMiddleware.js";
import { buscarUsuarioPorId } from "../model/minhaContaEmpresaModel.js";

const router = express.Router();

/**
 * Rota protegida para retornar os dados completos do usuário logado
 */
router.get("/usuario", verificarToken, async (req, res) => {
  try {
    const { id, tipo } = req.usuario;

    if (!id || !tipo) {
      return res.status(400).json({ success: false, message: "Token inválido." });
    }

    const dados = await buscarUsuarioPorId(id, tipo);

    if (!dados) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.json({
      success: true,
      message: "Dados do usuário retornados com sucesso.",
      data: dados
    });

  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
    return res.status(500).json({ success: false, message: "Erro interno ao buscar dados." });
  }
});

export default router;
