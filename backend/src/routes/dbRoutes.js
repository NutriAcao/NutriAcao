/* arquivo: backend/src/routes/dbRoutes.js - arquivo de rotas do backend: define endpoints relacionados a dbroutes - define rotas com router; funções/constantes: router, updateQuery, query, usuarioId, result */

/*
    rotas de acesso a dados e funcionalidades principais:
    - contém endpoints para testar conexão com o banco, listar doações/pedidos,
    - reservar/cancelar/reservas e atualizar status de doações
    - utiliza pool (dbPool) para executar queries sql e middlewares de autenticação
*/
import { Router } from "express";
import { pool } from "../config/dbPool.js";
import { verificarToken } from "./authMiddleware.js";
import { verificarOng } from "./tipoAuthMiddleware.js";

const router = Router();

router.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 as is_connected");
    if (result.rows[0].is_connected === 1) {
      return res.status(200).json({
        status: "OK",
        message: "Conexão com o banco de dados estabelecida com sucesso!",
      });
    }
  } catch (error) {
    console.error("Erro ao testar a conexão com o banco:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Falha na conexão ou na query SQL.",
      details: error.message,
    });
  }
});

router.get(
  "/api/doacoes-disponiveis-ong",
  verificarToken,
  verificarOng,
  async (req, res) => {
    try {
      const query = `
            SELECT
                d.id,
                d.nome_alimento,
                d.quantidade,
                d.data_validade,
                d.telefone_contato,
                d.email_contato,
                d."dataCadastroDoacao" AS data_cadastro,
                e.nome AS nome_empresa, -- CORRIGIDO (tabela empresa usa "nome")
                e.cnpj AS cnae_empresa,
                d.status    
            FROM
                "doacoesDisponiveis" d
            INNER JOIN
                empresa e ON d.id_empresa = e.id -- CORRIGIDO (tabela doacoesDisponiveis usa "id_empresa")
            -- WHERE
            --     d.status ILIKE 'disponível' -- <-- REMOVIDA. (Ver explicação)
            ORDER BY
                d.data_validade ASC;
        `;

      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar doações disponíveis para ONG:", error);
      res.status(500).json({
        message: "Erro ao carregar lista de doações.",
        details: error.message,
      });
    }
  },
);

router.get(
  "/api/pedidos-disponiveis-empresa",
  verificarToken,
  async (req, res) => {
    try {
      const query = `
            SELECT
                s.id,
                s.nome_alimento,
                s.quantidade,
                s."dataCadastroSolicitacao" AS data_solicitacao, -- CORRIGIDO
                s."telefoneContato" AS telefone_contato, -- CORRIGIDO
                s."emailContato" AS email_contato, -- CORRIGIDO
                o.nome AS nome_ong, -- CORRIGIDO (tabela ong usa "nome")
                o.cnpj AS cnae_ong,
                s.status
            FROM
                "doacoesSolicitadas" s 
            INNER JOIN
                ong o ON s.id_ong = o.id -- CORRIGIDO (tabela doacoesSolicitadas usa "id_ong")
            -- WHERE
            --    s.status ILIKE 'Disponível' -- <-- REMOVIDA. (Ver explicação)
            ORDER BY
                s."dataCadastroSolicitacao" DESC;
        `;

      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar pedidos disponíveis para Empresa:", error);
      res.status(500).json({
        message: "Erro ao carregar lista de pedidos.",
        details: error.message,
      });
    }
  },
);

router.post("/api/reservar-doacao", verificarToken, async (req, res) => {
  const { doacaoId, tipoDoacao } = req.body;
  const usuarioId = req.usuario.id;

  let tableName, fkColumn;
  if (tipoDoacao === "excedente") {
    tableName = '"doacoesDisponiveis"';
    fkColumn = "id_ong_reserva";
  } else if (tipoDoacao === "solicitacao") {
    tableName = '"doacoesSolicitadas"';
    fkColumn = "id_empresa_reserva";
  } else {
    return res.status(400).json({ message: "Tipo de doação inválido." });
  }

  try {
    const updateQuery = `
            UPDATE ${tableName}
            SET 
                status = 'Reservado', 
                ${fkColumn} = $1 
            WHERE id = $2 AND (status ILIKE 'Disponível' OR status ILIKE 'disponível')
            RETURNING id, status;
        `;
    const result = await pool.query(updateQuery, [usuarioId, doacaoId]);

    if (result.rowCount === 0) {
      return res.status(400).json({
        message:
          "Não foi possível reservar. O item pode já ter sido reservado.",
      });
    }
    res.status(200).json({
      message: "Item reservado com sucesso!",
      doacao: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao reservar item:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao tentar reservar o item." });
  }
});

router.post(
  "/api/cancelar-reserva-e-devolver-estoque",
  verificarToken,
  async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body;

    let tableName, fkColumn;
    if (tipoDoacao === "excedente") {
      tableName = '"doacoesDisponiveis"';
      fkColumn = "id_ong_reserva";
    } else if (tipoDoacao === "solicitacao") {
      tableName = '"doacoesSolicitadas"';
      fkColumn = "id_empresa_reserva";
    } else {
      return res.status(400).json({ message: "Tipo de doação inválido." });
    }

    try {
      const updateQuery = `
            UPDATE ${tableName}
            SET 
                status = 'Disponível', -- Padronizando para 'Disponível' (maiúsculo)
                ${fkColumn} = NULL
            WHERE id = $1 AND status = 'Reservado'
            RETURNING id, status;
        `;
      const result = await pool.query(updateQuery, [doacaoId]);

      if (result.rowCount === 0) {
        return res.status(400).json({
          message:
            "Não foi possível cancelar. A doação não está em status 'Reservado'.",
        });
      }
      res.status(200).json({
        message: "Reserva cancelada. Item devolvido ao painel.",
        doacao: result.rows[0],
      });
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },
);

router.post("/api/update-status", verificarToken, async (req, res) => {
  const { id, tipo, status: novoStatus } = req.body;
  const usuarioId = req.usuario.id;

  let tableName, fkColumn, statusAnterior, statusParaDB;

  if (tipo === "excedente") {
    tableName = '"doacoesDisponiveis"';
    fkColumn = "id_ong_reserva";
  } else if (tipo === "solicitacao") {
    tableName = '"doacoesSolicitadas"';
    fkColumn = "id_empresa_reserva";
  } else {
    return res.status(400).json({ message: "Tipo de doação inválido." });
  }

  if (novoStatus === "em andamento") {
    statusAnterior = "Reservado";
    statusParaDB = "Em Andamento";
  } else if (novoStatus === "concluido") {
    statusAnterior = "Em Andamento";
    statusParaDB = "Concluido";
  } else {
    return res.status(400).json({ message: "Status de destino inválido." });
  }

  try {
    const updateQuery = `
            UPDATE ${tableName}
            SET status = $1
            WHERE id = $2                -- O item deve ser o correto
              AND ${fkColumn} = $3        -- O usuário logado deve ser o dono da reserva
              AND status = $4            -- O item deve estar no status anterior correto
            RETURNING id, status;
        `;
    const result = await pool.query(updateQuery, [
      statusParaDB,
      id,
      usuarioId,
      statusAnterior,
    ]);

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: `Não foi possível atualizar o status. Verifique se o item está no status '${statusAnterior}' e se pertence a você.`,
      });
    }

    res.status(200).json({
      message: "Status atualizado com sucesso!",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default router;
