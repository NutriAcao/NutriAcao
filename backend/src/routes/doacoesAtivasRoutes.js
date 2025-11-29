import express from 'express';
import { pool } from '../config/dbPool.js';

const router = express.Router();

// Buscar excedentes cadastrados pela empresa (doacoes_disponiveis)
router.get('/excedentes-cadastrados/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;

        const query = `
            SELECT 
                dd.id,
                dd.titulo as nome_alimento,
                dd.descricao,
                dd.quantidade,
                dd.data_validade,
                dd.status,
                dd.data_publicacao as data_cadastro,
                dd.telefone_contato,
                dd.email_contato,
                dd.cep_retirada,
                dd.endereco_retirada
            FROM doacoes_disponiveis dd
        WHERE dd.empresa_id = $1 
            ORDER BY dd.data_publicacao DESC
        `;

        const result = await pool.query(query, [empresaId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar excedentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar solicitações em andamento (solicitacoes_ong_reservada)
router.get('/solicitacoes-andamento/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;

        const query = `
            SELECT 
                sor.id,
                sor.titulo as nome_alimento,
                sor.descricao,
                sor.quantidade_desejada as quantidade,
                sor.data_criacao as data_cadastro,
                sor.status,
                o.nome_ong as nome_ong,
                o.email_institucional as email_ong,
                r.telefone as telefone_ong,
                r.email as email_responsavel,
                r.nome_completo as responsavel_ong
            FROM solicitacoes_ong_reservada sor
            INNER JOIN ongs o ON sor.ong_id = o.id
            INNER JOIN responsaveis r ON o.responsavel_legal_id = r.id
            WHERE sor.empresa_id = $1 
                AND sor.status = 'reservado'
            ORDER BY sor.data_criacao DESC
        `;

        const result = await pool.query(query, [empresaId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar excedentes em andamento (doacoes_reservadas)
router.get('/excedentes-andamento/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;

        const query = `
            SELECT 
                dr.id,
                dr.titulo as nome_alimento,
                dr.descricao,
                dr.quantidade,
                dr.data_validade,
                dr.status,
                dr.data_publicacao as data_cadastro,
                o.nome_ong as nome_ong,
                o.email_institucional as email_ong,
                r.telefone as telefone_ong,
                r.email as email_responsavel,
                r.nome_completo as responsavel_ong
            FROM doacoes_reservadas dr
            INNER JOIN ongs o ON dr.ong_id = o.id
            INNER JOIN responsaveis r ON o.responsavel_legal_id = r.id
            WHERE dr.empresa_id = $1 
                AND dr.status = 'reservado'
            ORDER BY dr.data_publicacao DESC
        `;

        const result = await pool.query(query, [empresaId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar excedentes em andamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Detalhes de um excedente DISPONÍVEL (doacoes_disponiveis)
router.get('/detalhes/excedente-disponivel/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                dd.id,
                dd.titulo as nome_alimento,
                dd.descricao,
                dd.quantidade,
                dd.data_validade,
                dd.status,
                dd.data_publicacao as data_cadastro,
                dd.telefone_contato,
                dd.email_contato,
                dd.cep_retirada,
                dd.endereco_retirada
            FROM doacoes_disponiveis dd
            WHERE dd.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Excedente não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes do excedente disponível:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Detalhes de um excedente (doacoes_reservadas)
router.get('/detalhes/excedente/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
  SELECT 
    dd.*, 
    o.nome_ong, 
    r.telefone AS telefone_contato, 
    r.email AS email_contato,
    r.nome_completo AS nome_responsavel
  FROM doacoes_reservadas dd
  INNER JOIN ongs o 
    ON dd.ong_id = o.id
  INNER JOIN responsaveis r 
    ON o.responsavel_legal_id = r.id
  WHERE dd.id = $1
`;


        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Excedente não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes do excedente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Detalhes de uma solicitação (solicitacoes_ong_reservada)
router.get('/detalhes/solicitacao/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                sor.*,
                o.nome_ong,
                o.email_institucional,
                r.telefone as telefone_contato,
                r.email as email_contato,
                r.nome_completo as responsavel
            FROM solicitacoes_ong_reservada sor
            INNER JOIN ongs o ON sor.ong_id = o.id
            INNER JOIN responsaveis r ON o.responsavel_legal_id = r.id
            WHERE sor.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitação não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes da solicitação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Concluir doação (doacoes_reservadas)
router.put('/concluir-doacao/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // 1. Buscar dados da doação reservada
        const selectQuery = `
            SELECT * FROM doacoes_reservadas WHERE id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Doação não encontrada' });
        }

        const doacao = selectResult.rows[0];

        // 2. Inserir na tabela de doações concluídas
        const insertQuery = `
            INSERT INTO doacoes_concluidas 
            (empresa_id, ong_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'concluída', NOW())
        `;

        await client.query(insertQuery, [
            doacao.empresa_id,
            doacao.ong_id,
            doacao.excedente_id,
            doacao.titulo,
            doacao.descricao,
            doacao.quantidade,
            doacao.data_validade
        ]);

        // 3. Remover da tabela de reservadas
        const deleteQuery = `
            DELETE FROM doacoes_reservadas WHERE id = $1
        `;
        await client.query(deleteQuery, [id]);

        await client.query('COMMIT');
        res.json({ message: 'Doação concluída com sucesso' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao concluir doação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});

// Concluir pedido (solicitacoes_ong_reservada)
router.put('/concluir-pedido/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // 1. Buscar dados da solicitação reservada
        const selectQuery = `
            SELECT * FROM solicitacoes_ong_reservada WHERE id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        const pedido = selectResult.rows[0];

        // 2. Inserir na tabela de concluídas
        const insertQuery = `
            INSERT INTO solicitacoes_ong_concluido 
            (empresa_id, ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao)
            VALUES ($1, $2, $3, $4, $5, $6, 'concluído', NOW())
        `;

        await client.query(insertQuery, [
            pedido.empresa_id,
            pedido.ong_id,
            pedido.titulo,
            pedido.descricao,
            pedido.categoria_id,
            pedido.quantidade_desejada
        ]);

        // 3. Remover da tabela de reservadas
        const deleteQuery = `
            DELETE FROM solicitacoes_ong_reservada WHERE id = $1
        `;
        await client.query(deleteQuery, [id]);

        await client.query('COMMIT');
        res.json({ message: 'Pedido concluído com sucesso' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao concluir pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});

// Cancelar reserva
router.put('/cancelar-reserva/:id/:tipo', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id, tipo } = req.params;

        if (tipo === 'doacao') {
            // Cancelar reserva de doacao_reservada e voltar para doacoes_disponiveis
            const selectQuery = `
                SELECT * FROM doacoes_reservadas WHERE id = $1
            `;
            const selectResult = await client.query(selectQuery, [id]);

            if (selectResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Doação não encontrada' });
            }

            const doacao = selectResult.rows[0];

            // Inserir de volta em doacoes_disponiveis
            const insertQuery = `
                INSERT INTO doacoes_disponiveis 
                (empresa_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao, cep_retirada, telefone_contato, email_contato)
                VALUES ($1, $2, $3, $4, $5, $6, 'disponível', NOW(), $7, $8, $9)
            `;

            await client.query(insertQuery, [
                doacao.empresa_id,
                doacao.excedente_id,
                doacao.titulo,
                doacao.descricao,
                doacao.quantidade,
                doacao.data_validade,
                doacao.cep_retirada,
                doacao.telefone_contato,
                doacao.email_contato
            ]);

            // Remover da tabela de reservadas
            await client.query('DELETE FROM doacoes_reservadas WHERE id = $1', [id]);

        } else if (tipo === 'pedido') {
            // Cancelar reserva de solicitacoes_ong_reservada e voltar para solicitacoes_ong
            const selectQuery = `
                SELECT * FROM solicitacoes_ong_reservada WHERE id = $1
            `;
            const selectResult = await client.query(selectQuery, [id]);

            if (selectResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            const pedido = selectResult.rows[0];

            // Inserir de volta em solicitacoes_ong
            const insertQuery = `
                INSERT INTO solicitacoes_ong 
                (ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao, telefone_contato, email_contato)
                VALUES ($1, $2, $3, $4, $5, 'disponivel', NOW(), $6, $7)
            `;

            await client.query(insertQuery, [
                pedido.ong_id,
                pedido.titulo,
                pedido.descricao,
                pedido.categoria_id,
                pedido.quantidade_desejada,
                pedido.telefone_contato,
                pedido.email_contato
            ]);

            // Remover da tabela de reservadas
            await client.query('DELETE FROM solicitacoes_ong_reservada WHERE id = $1', [id]);
        } else {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Tipo inválido' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Reserva cancelada com sucesso' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});
// Cancelar/Deletar excedente cadastrado
router.delete('/cancelar-excedente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Cancelando excedente ID:', id);

        const query = `
            DELETE FROM doacoes_disponiveis 
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Excedente não encontrado' });
        }

        res.json({
            message: 'Excedente cancelado e removido com sucesso',
            excedente: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erro ao cancelar excedente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Concluir pedido (solicitação reservada)
router.put('/concluir-pedido/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        console.log('✅ Concluindo pedido ID:', id);

        // 1. Buscar dados da solicitação reservada
        const selectQuery = `
            SELECT * FROM solicitacoes_ong_reservada WHERE id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        const pedido = selectResult.rows[0];

        // 2. Inserir na tabela de concluídas
        const insertQuery = `
            INSERT INTO solicitacoes_ong_concluido 
            (empresa_id, ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao)
            VALUES ($1, $2, $3, $4, $5, $6, 'concluído', NOW())
            RETURNING *
        `;

        const insertResult = await client.query(insertQuery, [
            pedido.empresa_id,
            pedido.ong_id,
            pedido.titulo,
            pedido.descricao,
            pedido.categoria_id,
            pedido.quantidade_desejada
        ]);

        // 3. Remover da tabela de reservadas
        const deleteQuery = `
            DELETE FROM solicitacoes_ong_reservada WHERE id = $1
        `;
        await client.query(deleteQuery, [id]);

        await client.query('COMMIT');

        res.json({
            message: 'Pedido concluído com sucesso',
            pedido: insertResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erro ao concluir pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});

// Cancelar pedido (solicitação reservada)
router.put('/cancelar-pedido/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        console.log('❌ Cancelando pedido ID:', id);

        // 1. Buscar dados da solicitação reservada
        const selectQuery = `
            SELECT * FROM solicitacoes_ong_reservada WHERE id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        const pedido = selectResult.rows[0];

        // 2. Inserir de volta na tabela de disponíveis (solicitacoes_ong)
        const insertQuery = `
            INSERT INTO solicitacoes_ong 
            (ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao, telefone_contato, email_contato)
            VALUES ($1, $2, $3, $4, $5, 'disponivel', NOW(), $6, $7)
            RETURNING *
        `;

        const insertResult = await client.query(insertQuery, [
            pedido.ong_id,
            pedido.titulo,
            pedido.descricao,
            pedido.categoria_id,
            pedido.quantidade_desejada,
            pedido.telefone_contato,
            pedido.email_contato
        ]);

        // 3. Remover da tabela de reservadas
        const deleteQuery = `
            DELETE FROM solicitacoes_ong_reservada WHERE id = $1
        `;
        await client.query(deleteQuery, [id]);

        await client.query('COMMIT');

        res.json({
            message: 'Pedido cancelado com sucesso',
            pedido: insertResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erro ao cancelar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});

// Concluir doação (excedente reservado)
router.put('/concluir-doacao/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        console.log('✅ Concluindo doação ID:', id);

        // 1. Buscar dados da doação reservada
        const selectQuery = `
            SELECT * FROM doacoes_reservadas WHERE id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Doação não encontrada' });
        }

        const doacao = selectResult.rows[0];

        // 2. Inserir na tabela de concluídas
        const insertQuery = `
            INSERT INTO doacoes_concluidas 
            (empresa_id, ong_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'concluída', NOW())
            RETURNING *
        `;

        const insertResult = await client.query(insertQuery, [
            doacao.empresa_id,
            doacao.ong_id,
            doacao.excedente_id,
            doacao.titulo,
            doacao.descricao,
            doacao.quantidade,
            doacao.data_validade
        ]);

        // 3. Remover da tabela de reservadas
        const deleteQuery = `
            DELETE FROM doacoes_reservadas WHERE id = $1
        `;
        await client.query(deleteQuery, [id]);

        await client.query('COMMIT');

        res.json({
            message: 'Doação concluída com sucesso',
            doacao: insertResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erro ao concluir doação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});

// Cancelar doação (excedente reservado)
router.put('/cancelar-doacao/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        console.log('❌ Cancelando doação ID:', id);

        // 1. Buscar dados da doação reservada
        const selectQuery = `
            SELECT * FROM doacoes_reservadas WHERE id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Doação não encontrada' });
        }

        const doacao = selectResult.rows[0];

        // 2. Inserir de volta na tabela de disponíveis
        const insertQuery = `
            INSERT INTO doacoes_disponiveis 
            (empresa_id, excedente_id, titulo, descricao, quantidade, data_validade, status, data_publicacao, cep_retirada, telefone_contato, email_contato, endereco_retirada)
            VALUES ($1, $2, $3, $4, $5, $6, 'disponível', NOW(), $7, $8, $9, $10)
            RETURNING *
        `;

        const insertResult = await client.query(insertQuery, [
            doacao.empresa_id,
            doacao.excedente_id,
            doacao.titulo,
            doacao.descricao,
            doacao.quantidade,
            doacao.data_validade,
            doacao.cep_retirada,
            doacao.telefone_contato,
            doacao.email_contato,
            doacao.endereco_retirada
        ]);

        // 3. Remover da tabela de reservadas
        const deleteQuery = `
            DELETE FROM doacoes_reservadas WHERE id = $1
        `;
        await client.query(deleteQuery, [id]);

        await client.query('COMMIT');

        res.json({
            message: 'Doação cancelada com sucesso',
            doacao: insertResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erro ao cancelar doação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
});

export default router;