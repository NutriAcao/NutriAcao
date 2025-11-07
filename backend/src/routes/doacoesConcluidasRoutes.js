/* arquivo: backend/src/routes/doacoesConcluidasRoutes.js - arquivo de rotas do backend: define endpoints relacionados a doacoesconcluidasroutes - usa express (backend); define rotas com router; funções/constantes: router, doacoes */

/*
    rotas para recuperar doações concluídas:
    - fornece endpoints que consultam models para buscar doações concluídas por email
    - endpoints esperam query param 'email' e retornam 404 se não houver resultados
*/
import express from "express";
import { buscarDoacoesConcluidasPorEmailEmpresa } from "../model/doacoesEmpresaModel.js";
import { buscarDoacoesConcluidasPorEmailONG } from "../model/doacoesONGModel.js";
const router = express.Router();

router.get("/doacoesEmpresa", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    const doacoes = await buscarDoacoesConcluidasPorEmailEmpresa(email);

    if (!doacoes) {
      return res
        .status(404)
        .json({ message: "Nenhuma doação encontrada para este email" });
    }

    res.status(200).json(doacoes);
  } catch (err) {
    console.error("Erro na rota /doacoes:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/doacoesONG", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    const doacoes = await buscarDoacoesConcluidasPorEmailONG(email);

    if (!doacoes) {
      return res
        .status(404)
        .json({ message: "Nenhuma doação encontrada para este email" });
    }

    res.status(200).json(doacoes);
  } catch (err) {
    console.error("Erro na rota /doacoes:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
