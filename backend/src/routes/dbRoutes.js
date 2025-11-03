// backend/src/routes/dbRoutes.js

import { Router } from 'express';
import { pool } from '../config/dbPool.js'; 
// Assumindo que você tem os middlewares de autenticação disponíveis:
import { verificarToken } from './authMiddleware.js';
import { verificarOng } from './tipoAuthMiddleware.js'; 

const router = Router();

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
            message: 'Falha na conexão ou na query SQL. Verifique o DATABASE_URL.',
            details: error.message 
        });
    }
});


router.get('/api/doacoes-disponiveis-ong', verificarToken, verificarOng, async (req, res) => {
    try {
        // Busca doações (itens excedentes) cadastrados por empresas.
        const query = `
            SELECT
                d.id,
                d.nome_alimento,
                d.quantidade,
                d.unidade,
                d.data_validade,
                d.telefone_contato,
                d.email_contato,
                e.nome_fantasia AS nome_empresa,
                e.cnpj AS cnae_empresa,
                d.status
            FROM
                doacoesDisponiveis d
            INNER JOIN
                empresa e ON d.fk_empresa_id = e.id
            WHERE
                d.status = 'Disponível'
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


router.get('/api/pedidos-disponiveis-empresa', verificarToken, async (req, res) => {
    try {
        // Busca pedidos de doação cadastrados por ONGs.
        // **Aviso**: Assumindo que 'doacoesSolicitadas' é onde a ONG registra o que precisa.
        const query = `
            SELECT
                s.id,
                s.nome_alimento,
                s.quantidade,
                s.unidade,
                s.data_solicitacao,
                s.telefone_contato,
                s.email_contato,
                o.nome_instituicao AS nome_ong,
                o.cnpj AS cnae_ong,
                s.status
            FROM
                doacoesSolicitadas s
            INNER JOIN
                ong o ON s.fk_ong_id = o.id
            WHERE
                s.status = 'Disponível'
            ORDER BY
                s.data_solicitacao DESC;
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

router.post('/api/reservar-doacao', verificarToken, async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body; // tipoDoacao: 'excedente' ou 'solicitacao'
    const usuarioId = req.usuario.id; // ID da ONG ou Empresa que está reservando
    
    // Define a tabela e as colunas de vinculação
    let tableName, fkColumn;
    if (tipoDoacao === 'excedente') {
        tableName = 'doacoesDisponiveis';
        fkColumn = 'fk_ong_id'; // ONG reserva o excedente da Empresa
    } else if (tipoDoacao === 'solicitacao') {
        tableName = 'doacoesSolicitadas';
        fkColumn = 'fk_empresa_id'; // Empresa reserva a solicitação da ONG
    } else {
        return res.status(400).json({ message: "Tipo de doação inválido." });
    }

    try {
        const updateQuery = `
            UPDATE ${tableName}
            SET 
                status = 'Reservado', 
                ${fkColumn} = $1, 
                data_reserva = NOW() 
            WHERE id = $2 AND status = 'Disponível'
            RETURNING id, status;
        `;
        const result = await pool.query(updateQuery, [usuarioId, doacaoId]);

        if (result.rowCount === 0) {
            return res.status(400).json({ 
                message: "Não foi possível reservar. O item pode já ter sido reservado ou não estar disponível." 
            });
        }

        res.status(200).json({ 
            message: "Item reservado com sucesso! O status agora é 'Reservado'.", 
            doacao: result.rows[0] 
        });
    } catch (error) {
        console.error('Erro ao reservar item:', error);
        res.status(500).json({ message: "Erro interno do servidor ao tentar reservar o item." });
    }
});



router.post('/api/cancelar-reserva-e-devolver-estoque', verificarToken, async (req, res) => {
    const { doacaoId, tipoDoacao } = req.body;
    
    // Define a tabela e as colunas de vinculação
    let tableName, fkColumn;
    if (tipoDoacao === 'excedente') {
        tableName = 'doacoesDisponiveis';
        fkColumn = 'fk_ong_id';
    } else if (tipoDoacao === 'solicitacao') {
        tableName = 'doacoesSolicitadas';
        fkColumn = 'fk_empresa_id';
    } else {
        return res.status(400).json({ message: "Tipo de doação inválido para cancelamento." });
    }
    
    try {
        // Reverte o status para 'Disponível' e remove a vinculação.
        const updateQuery = `
            UPDATE ${tableName}
            SET 
                status = 'Disponível', 
                ${fkColumn} = NULL,
                data_reserva = NULL
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
            message: "Reserva cancelada. Item devolvido ao painel e está 'Disponível' novamente.", 
            doacao: result.rows[0] 
        });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor ao tentar cancelar a reserva." });
    }
});

export default router;