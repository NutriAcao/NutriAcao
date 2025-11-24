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
        // ❗️ ATENÇÃO: A CLÁUSULA 'WHERE' FOI REMOVIDA ABAIXO. LEIA A EXPLICAÇÃO NO FINAL.
        const query = `
            SELECT 
                dd.id,
                dd.titulo as nome_alimento,
                dd.quantidade,
                dd.data_validade,
                dd.telefone_contato,
                dd.email_contato,
                dd.data_publicacao,
                e.nome_fantasia as nome_empresa,
                e.ramo_atuacao as cnae_empresa,
                dd.status
            FROM doacoes_disponiveis dd
            LEFT JOIN empresas e ON dd.empresa_id = e.id
            WHERE dd.status = 'disponível'`;
        
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
        console.error("Erro ao buscar pedidos disponíveis para Empresa:", error);
        res.status(500).json({ 
            message: 'Erro ao carregar lista de pedidos.', 
            details: error.message 
        });
    }
});

// ROTA 3: RESERVAR ITEM (Usa as novas colunas)
router.post('/api/reservar-doacao', verificarToken, async (req, res) => {
    console.log('🔔 REQUISIÇÃO RECEBIDA em /api/reservar-doacao');
    console.log('Body:', req.body);
    console.log('Usuário:', req.usuario);
    
    const { doacao_id } = req.body;
    const ongId = req.usuario.id;

    if (!doacao_id) {
        return res.status(400).json({ message: "ID da doação é obrigatório." });
    }

    console.log(`🔄 ONG ${ongId} reservando doação ${doacao_id}`);
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
                status = 'reservado', 
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
// ROTA 4: EMPRESA RESERVA PEDIDO (COM COLUNAS CORRETAS)
router.post('/api/reservar-pedido', verificarToken, async (req, res) => {
    const { pedido_id } = req.body;
    const empresaId = req.usuario.id;

    console.log(`🔄 Empresa ${empresaId} reservando pedido ${pedido_id}`);

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // 1. Buscar dados do pedido
        const selectPedido = `
            SELECT id, ong_id, titulo, descricao, categoria_id, quantidade_desejada, 
                   data_criacao, status
            FROM solicitacoes_ong 
            WHERE id = $1 AND status = 'disponivel'
        `;
        
        console.log(`🔍 Buscando pedido ${pedido_id}...`);
        const pedidoResult = await client.query(selectPedido, [pedido_id]);
        
        if (pedidoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log('❌ Pedido não encontrado ou já reservado');
            return res.status(400).json({ message: "Pedido não encontrado ou já reservado." });
        }

        const pedido = pedidoResult.rows[0];
        console.log('✅ Pedido encontrado:', pedido);

        // 2. Inserir na tabela de reservados (APENAS COLUNAS QUE EXISTEM)
        const insertReserva = `
            INSERT INTO solicitacoes_ong_reservada 
            (empresa_id, ong_id, titulo, descricao, categoria_id, quantidade_desejada, status, data_criacao)
            VALUES ($1, $2, $3, $4, $5, $6, 'reservado', $7)
            RETURNING id;
        `;
        
        console.log('📝 Inserindo na tabela solicitacoes_ong_reservada...');
        const reservaResult = await client.query(insertReserva, [
            empresaId,
            pedido.ong_id,
            pedido.titulo,
            pedido.descricao || '', // descricao pode ser null
            pedido.categoria_id,
            pedido.quantidade_desejada,
            pedido.data_criacao
        ]);

        // 3. Remover da tabela de disponíveis
        await client.query('DELETE FROM solicitacoes_ong WHERE id = $1', [pedido_id]);

        await client.query('COMMIT');
        
        console.log(`✅ Pedido ${pedido_id} movido para reservados com ID: ${reservaResult.rows[0].id}`);
        res.status(200).json({ 
            message: "Pedido reservado com sucesso!",
            pedido_id: pedido_id
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('❌ Erro ao reservar pedido:', error.message);
        res.status(500).json({ 
            message: "Erro interno do servidor.",
            details: error.message 
        });
    } finally {
        if (client) client.release();
    }
});
// --- NOVA ROTA ---

// ROTA 5: ATUALIZAR STATUS (em andamento / concluído)
router.post('/api/update-status', verificarToken, async (req, res) => {
    // 1. Obter dados do frontend e do token
    const { id, tipo, status: novoStatus } = req.body; // 'novoStatus' vem como 'em andamento' ou 'concluído'
    const usuarioId = req.usuario.id;

    let tableName, fkColumn, statusAnterior, statusParaDB;

    // 2. Determinar tabelas e status anterior/novo
    if (tipo === 'excedente') {
        tableName = '"doacoesDisponiveis"';
        fkColumn = 'id_ong_reserva';
    } else if (tipo === 'solicitacao') {
        tableName = '"doacoesSolicitadas"';
        fkColumn = 'id_empresa_reserva';
    } else {
        return res.status(400).json({ message: "Tipo de doação inválido." });
    }

    // 3. Determinar o fluxo de status (Máquina de Estados)
    if (novoStatus === 'em andamento') {
        statusAnterior = 'reservado';
        statusParaDB = 'Em Andamento'; // Padronizando para maiúsculas no DB
    } else if (novoStatus === 'concluído') {
        statusAnterior = 'Em Andamento'; // Só pode concluir se estava 'Em Andamento'
        statusParaDB = 'Concluído';
    } else {
        return res.status(400).json({ message: "Status de destino inválido." });
    }

    // 4. Executar a atualização no banco
    try {
        const updateQuery = `
            UPDATE ${tableName}
            SET status = $1
            WHERE id = $2                -- O item deve ser o correto
              AND ${fkColumn} = $3        -- O usuário logado deve ser o dono da reserva
              AND status = $4            -- O item deve estar no status anterior correto
            RETURNING id, status;
        `;
        const result = await pool.query(updateQuery, [statusParaDB, id, usuarioId, statusAnterior]);

        // 5. Verificar se a atualização foi bem-sucedida
        if (result.rowCount === 0) {
            // Se 0 linhas foram afetadas, o WHERE falhou
            return res.status(400).json({ 
                message: `Não foi possível atualizar o status. Verifique se o item está no status '${statusAnterior}' e se pertence a você.` 
            });
        }
        
        // 6. Sucesso
        res.status(200).json({ 
            message: "Status atualizado com sucesso!", 
            item: result.rows[0] 
        });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});


export default router;
//commit teste