// backend/src/routes/dbRoutes.js

import { Router } from 'express';
import { pool } from '../config/dbPool.js'; 
import { verificarToken } from './authMiddleware.js';
import { verificarOng } from './tipoAuthMiddleware.js'; 

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
        // CORRIGIDO: Usa e.nome (da tabela empresa) e d."dataCadastroDoacao"
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
            WHERE
                d.status ILIKE 'disponível' -- ILIKE ignora maiúscula/minúscula
            ORDER BY
                d.data_validade ASC;
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
        // CORRIGIDO: Usa s."dataCadastroSolicitacao", s."telefoneContato", s."emailContato" e o.nome
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
            WHERE
                s.status ILIKE 'Disponível'
            ORDER BY
                s."dataCadastroSolicitacao" DESC;
        `;
        
        const result = await pool.query(query);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Erro ao buscar pedidos disponíveis para Empresa:", error);
        res.status(500).json({ 
            message: 'Erro ao carregar lista de pedidos.', 
            details: error.message 
        });
    }
});

// ROTA 3: RESERVAR ITEM (Usa as novas colunas)
router.post('/api/reservar-doacao', verificarToken, async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body; 
    const usuarioId = req.usuario.id; 
    
    // CORRIGIDO: Aponta para as novas colunas de reserva
    let tableName, fkColumn;
    if (tipoDoacao === 'excedente') {
        tableName = '"doacoesDisponiveis"';
        fkColumn = 'id_ong_reserva'; // CORRIGIDO (Nova coluna)
    } else if (tipoDoacao === 'solicitacao') {
        tableName = '"doacoesSolicitadas"';
        fkColumn = 'id_empresa_reserva'; // CORRIGIDO (Nova coluna)
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
                message: "Não foi possível reservar. O item pode já ter sido reservado." 
            });
        }
        res.status(200).json({ 
            message: "Item reservado com sucesso!", 
            doacao: result.rows[0] 
        });
    } catch (error)
    {
        console.error('Erro ao reservar item:', error);
        res.status(500).json({ message: "Erro interno do servidor ao tentar reservar o item." });
    }
});


// ROTA 4: CANCELAR RESERVA (Usa as novas colunas)
router.post('/api/cancelar-reserva-e-devolver-estoque', verificarToken, async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body;
    
    // CORRIGIDO: Aponta para as novas colunas de reserva
    let tableName, fkColumn;
    if (tipoDoacao === 'excedente') {
        tableName = '"doacoesDisponiveis"';
        fkColumn = 'id_ong_reserva'; // CORRIGIDO (Nova coluna)
    } else if (tipoDoacao === 'solicitacao') {
        tableName = '"doacoesSolicitadas"';
        fkColumn = 'id_empresa_reserva'; // CORRIGIDO (Nova coluna)
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
                message: "Não foi possível cancelar. A doação não está em status 'Reservado'." 
            });
        }
        res.status(200).json({ 
            message: "Reserva cancelada. Item devolvido ao painel.", 
            doacao: result.rows[0] 
        });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

export default router;
//commit teste