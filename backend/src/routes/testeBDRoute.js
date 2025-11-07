/* arquivo: backend/src/routes/testeBDRoute.js - arquivo de rotas do backend: define endpoints relacionados a testebdroute - define rotas com router; funções/constantes: router, querySQL, result */

/*
    rota de teste de banco de dados:
    - endpoint /data-test executa uma query simples para verificar leitura da tabela pessoafisica
    - útil para diagnosticar conexão com o postgres durante desenvolvimento
*/
import { Router } from "express";
import { pool } from "../config/dbPool.js";

const router = Router();

router.get("/data-test", async (req, res) => {
  try {
    const querySQL = "SELECT * FROM pessoafisica";
    const result = await pool.query(querySQL);

    if (result.rows.length > 0) {
      return res.status(200).json({
        status: "OK",
        message: "Dados lidos com sucesso da tabela pessoafisica.",
        data: result.rows[0],
      });
    } else {
      return res.status(200).json({
        status: "WARNING",
        message: "Tabela encontrada, mas está vazia.",
      });
    }
  } catch (error) {
    console.error("ERRO na rota /data-test:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Falha ao conectar ou executar query no PostgreSQL.",
      details: error.message,
    });
  }
});

export default router;
