// backend/src/routes/dbRoutes.js

import { Router } from 'express';
import { pool } from '../config/dbPool.js'; 
import { verificarToken } from './authMiddleware.js';
import { verificarOng, verificarEmpresa } from './tipoAuthMiddleware.js'; 

const router = Router();

// rota de Teste pra saber se o banco de dados está conectado "(OK)"
router.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 as is_connected');
        if (result.rows[0].is_connected === 1) {
             return res.status(200).json({ 
                 status: 'OK', 
                 message: 'Conexão com o banco de dados estabelecida com sucesso!' 
             });
        }
    } catch (error) {
        console.error("Erro ao testar a conexão com o banco:", error.message);
        return res.status(500).json({ 
            status: 'ERROR', 
            message: 'Falha na conexão ou na query SQL.',
            details: error.message 
        });
    }
});

// ROTA 1: PAINEL DA ONG - Busca doações disponíveis (Excedentes de Empresas)
router.get('/api/doacoes-disponiveis-ong', verificarToken, verificarOng, async (req, res) => {
    try {
        const query = `
            SELECT
                dd.id,
                dd.titulo as nome_alimento,
                dd.quantidade,
                dd.data_validade,
                dd.telefone_contato,
                dd.email_contato,
                dd.data_publicacao as data_cadastro,
                e.nome_fantasia as nome_empresa,
                e.cnpj as cnae_empresa,
                dd.status    
            FROM
                doacoes_disponiveis dd
            INNER JOIN
                empresas e ON dd.empresa_id = e.id
            WHERE
                dd.status ILIKE 'disponível'
            ORDER BY
                dd.data_validade ASC;
        `;
        
        const result = await pool.query(query);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Erro ao buscar doações disponíveis para ONG:", error);
        res.status(500).json({ 
            message: 'Erro ao carregar lista de doações.', 
            details: error.message 
        });
    }
});

// ROTA 2: PAINEL DA EMPRESA - Busca pedidos disponíveis (Solicitações de ONGs)
router.get('/api/pedidos-disponiveis-empresa', verificarToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                so.id,
                so.titulo as nome_alimento,
                so.quantidade_desejada as quantidade,
                so.data_criacao as data_solicitacao,
                so.telefone_contato,
                so.email_contato,
                o.nome_ong as nome_ong,
                so.status
            FROM solicitacoes_ong so
            LEFT JOIN ongs o ON so.ong_id = o.id
            WHERE so.status = 'disponivel'
            ORDER BY so.data_criacao DESC;
        `;
        
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ message: 'Erro ao carregar pedidos.' });
    }
});
// ROTA 3: RESERVAR ITEM
router.post('/api/reservar-doacao', verificarToken, async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body; 
    const usuarioId = req.usuario.id; 
    
    let originalTable, reservaTable, usuarioColumn;
    
    if (tipoDoacao === 'excedente') {
        originalTable = 'doacoes_disponiveis';
        reservaTable = 'doacoes_reservadas';
        usuarioColumn = 'ong_id';
    } else if (tipoDoacao === 'solicitacao') {
        originalTable = 'solicitacoes_ong';
        reservaTable = 'solicitacoes_ong_reservada';
        usuarioColumn = 'empresa_id';
    } else {
        return res.status(400).json({ message: "Tipo de doação inválido." });
    }

    try {
        // Primeiro busca a doação original
        const originalQuery = `SELECT * FROM ${originalTable} WHERE id = $1 AND status ILIKE 'disponível'`;
        const originalResult = await pool.query(originalQuery, [doacaoId]);
        
        if (originalResult.rows.length === 0) {
            return res.status(400).json({ 
                message: "Não foi possível reservar. O item pode já ter sido reservado." 
            });
        }

        const item = originalResult.rows[0];
        // ----- Limite: ONG pode reservar no máximo 4 doações por semana -----
        if (tipoDoacao === 'excedente') {
            try {
                const countQuery = `SELECT COUNT(*) FROM doacoes_reservadas WHERE ong_id = $1 AND data_publicacao >= NOW() - INTERVAL '7 days'`;
                const countResult = await pool.query(countQuery, [usuarioId]);
                const reservedLast7Days = parseInt(countResult.rows[0].count, 10) || 0;
                if (reservedLast7Days >= 4) {
                    return res.status(429).json({
                        message: 'Limite semanal atingido: você já reservou 4 doações nesta semana.'
                    });
                }
            } catch (countErr) {
                console.error('Erro ao verificar limite semanal de reservas:', countErr);
                // Não bloqueia por falha na verificação; apenas loga e continua
            }
        }
        
        // Insere na tabela de reservas
        let insertQuery;
        if (tipoDoacao === 'excedente') {
            insertQuery = `
                INSERT INTO doacoes_reservadas (empresa_id, ong_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'reservado', $8)
                RETURNING id, status;
            `;
        } else {
            insertQuery = `
                INSERT INTO solicitacoes_ong_reservada (empresa_id, ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao)
                VALUES ($1, $2, $3, $4, $5, $6, 'reservado', $7)
                RETURNING id, status;
            `;
        }

        const insertParams = tipoDoacao === 'excedente' 
            ? [item.empresa_id, usuarioId, item.excedente_id, item.titulo, item.descricao, item.quantidade, item.data_validade, item.data_publicacao]
            : [usuarioId, item.ong_id, item.titulo, item.descricao, item.categoria_id, item.quantidade_desejada, item.data_criacao];

        const result = await pool.query(insertQuery, insertParams);
        
        // Remove da tabela de disponíveis
        await pool.query(`DELETE FROM ${originalTable} WHERE id = $1`, [doacaoId]);

        res.status(200).json({ 
            message: "Item reservado com sucesso!", 
            doacao: result.rows[0] 
        });
    } catch (error) {
        console.error('Erro ao reservar item:', error);
        res.status(500).json({ message: "Erro interno do servidor ao tentar reservar o item." });
    }
});

// ROTA 4: CANCELAR RESERVA
router.post('/api/cancelar-reserva-e-devolver-estoque', verificarToken, async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body;
    const usuarioId = req.usuario.id;
    
    try {
        if (tipoDoacao === 'excedente') {
            // Busca o item reservado
            const reservaQuery = `SELECT * FROM doacoes_reservadas WHERE id = $1 AND ong_id = $2`;
            const reservaResult = await pool.query(reservaQuery, [doacaoId, usuarioId]);
            
            if (reservaResult.rows.length === 0) {
                return res.status(400).json({ 
                    message: "Reserva não encontrada ou você não tem permissão para cancelá-la." 
                });
            }

            const item = reservaResult.rows[0];
            
            // Move de volta para doacoes_disponiveis
            const insertQuery = `
                INSERT INTO doacoes_disponiveis (empresa_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao, telefone_contato, email_contato)
                VALUES ($1, $2, $3, $4, $5, $6, 'disponível', $7, $8, $9)
            `;
            await pool.query(insertQuery, [
                item.empresa_id, item.excedente_id, item.titulo, item.descricao, 
                item.quantidade, item.data_validade, item.data_publicacao,
                item.telefone_contato, item.email_contato
            ]);
            
            await pool.query('DELETE FROM doacoes_reservadas WHERE id = $1', [doacaoId]);
            
        } else if (tipoDoacao === 'solicitacao') {
            // Busca o item reservado
            const reservaQuery = `SELECT * FROM solicitacoes_ong_reservada WHERE id = $1 AND empresa_id = $2`;
            const reservaResult = await pool.query(reservaQuery, [doacaoId, usuarioId]);
            
            if (reservaResult.rows.length === 0) {
                return res.status(400).json({ 
                    message: "Reserva não encontrada ou você não tem permissão para cancelá-la." 
                });
            }

            const item = reservaResult.rows[0];
            
            // Move de volta para solicitacoes_ong
            const insertQuery = `
                INSERT INTO solicitacoes_ong (ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao, telefone_contato, email_contato)
                VALUES ($1, $2, $3, $4, $5, 'disponível', $6, $7, $8)
            `;
            await pool.query(insertQuery, [
                item.ong_id, item.titulo, item.descricao, item.categoria_id,
                item.quantidade_desejada, item.data_criacao, item.telefone_contato, item.email_contato
            ]);
            
            await pool.query('DELETE FROM solicitacoes_ong_reservada WHERE id = $1', [doacaoId]);
        } else {
            return res.status(400).json({ message: "Tipo de doação inválido." });
        }

        res.status(200).json({ 
            message: "Reserva cancelada. Item devolvido ao painel."
        });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

// ROTA 5: ATUALIZAR STATUS (concluir doação)
router.post('/api/update-status', verificarToken, async (req, res) => {
    const { id, tipo, status: novoStatus } = req.body;
    const usuarioId = req.usuario.id;

    try {
        if (tipo === 'excedente' && novoStatus === 'concluído') {
            // Busca o item reservado
            const reservaQuery = `SELECT * FROM doacoes_reservadas WHERE id = $1 AND ong_id = $2`;
            const reservaResult = await pool.query(reservaQuery, [id, usuarioId]);
            
            if (reservaResult.rows.length === 0) {
                return res.status(400).json({ 
                    message: "Item não encontrado ou você não tem permissão para concluí-lo." 
                });
            }

            const item = reservaResult.rows[0];
            
            // Move para doacoes_concluidas
            const insertQuery = `
                INSERT INTO doacoes_concluidas (empresa_id, ong_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'concluída', $8)
            `;
            await pool.query(insertQuery, [
                item.empresa_id, item.ong_id, item.excedente_id, item.titulo,
                item.descricao, item.quantidade, item.data_validade, item.data_publicacao
            ]);
            
            await pool.query('DELETE FROM doacoes_reservadas WHERE id = $1', [id]);
            
        } else if (tipo === 'solicitacao' && novoStatus === 'concluído') {
            // Busca o item reservado
            const reservaQuery = `SELECT * FROM solicitacoes_ong_reservada WHERE id = $1 AND empresa_id = $2`;
            const reservaResult = await pool.query(reservaQuery, [id, usuarioId]);
            
            if (reservaResult.rows.length === 0) {
                return res.status(400).json({ 
                    message: "Item não encontrado ou você não tem permissão para concluí-lo." 
                });
            }

            const item = reservaResult.rows[0];
            
            // Move para solicitacoes_ong_concluido
            const insertQuery = `
                INSERT INTO solicitacoes_ong_concluido (empresa_id, ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao)
                VALUES ($1, $2, $3, $4, $5, $6, 'concluído', $7)
            `;
            await pool.query(insertQuery, [
                item.empresa_id, item.ong_id, item.titulo, item.descricao,
                item.categoria_id, item.quantidade_desejada, item.data_criacao
            ]);
            
            await pool.query('DELETE FROM solicitacoes_ong_reservada WHERE id = $1', [id]);
        } else {
            return res.status(400).json({ message: "Tipo de doação ou status inválido." });
        }

        res.status(200).json({ 
            message: "Doação concluída com sucesso!"
        });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});
// ROTA 6: HISTÓRICO DE DOAÇÕES CONCLUÍDAS PARA ONG
router.get('/doacoesConcluidasONG/solicitacoesConcluidasONG', verificarToken, verificarOng, async (req, res) => {
  try {
    const ongId = req.usuario.ong_id;
    
    if (!ongId) {
      return res.status(400).json({ error: 'ONG não vinculada a este usuário' });
    }

    console.log(`Buscando solicitações para ONG ID: ${ongId}, Usuário: ${req.usuario.id}`);
    
    const query = `
      SELECT 
        soc.id,
        soc.titulo as nome_alimento,
        soc.quantidade_desejada as quantidade,
        soc.data_criacao as data_conclusao,
        soc.status,
        e.nome_fantasia as empresa_nome,
        e.id as empresa_id
      FROM solicitacoes_ong_concluido soc
      INNER JOIN empresas e ON soc.empresa_id = e.id
      WHERE soc.ong_id = $1
      ORDER BY soc.data_criacao DESC
    `;
    
    const result = await pool.query(query, [ongId]);
    console.log(`✅ ${result.rows.length} solicitações encontradas para ONG ID: ${ongId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar solicitações concluídas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA 7: HISTÓRICO DE EXCEDENTES CONCLUÍDOS PARA ONG
router.get('/doacoesConcluidasONG/excedentesConcluidosONG', verificarToken, verificarOng, async (req, res) => {
  try {
    const ongId = req.usuario.ong_id;
    
    if (!ongId) {
      return res.status(400).json({ error: 'ONG não vinculada a este usuário' });
    }

    console.log(`Buscando excedentes para ONG ID: ${ongId}, Usuário: ${req.usuario.id}`);
    
    const query = `
      SELECT 
        dc.id,
        dc.titulo as nome_alimento,
        dc.quantidade,
        dc.data_validade,
        dc.data_publicacao as data_conclusao,
        dc.status,
        e.nome_fantasia as nomeempresa,
        e.id as empresa_id
      FROM doacoes_concluidas dc
      INNER JOIN empresas e ON dc.empresa_id = e.id
      WHERE dc.ong_id = $1 AND dc.excedente_id IS NOT NULL
      ORDER BY dc.data_publicacao DESC
    `;
    
    const result = await pool.query(query, [ongId]);
    console.log(`✅ ${result.rows.length} excedentes encontrados para ONG ID: ${ongId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar excedentes concluídos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;