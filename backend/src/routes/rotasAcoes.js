// backend/routes/rotasAcoes.js
import express from 'express';
import { verificarToken } from './authMiddleware.js';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// Rota para concluir doação
router.put('/concluir-doacao', verificarToken, async (req, res) => {
    try {
        const { item_id, tipo_item } = req.body;

        if (!item_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID do item é obrigatório' 
            });
        }

        console.log(`🔄 Concluindo doação ID: ${item_id}`);

        // Buscar a doação reservada
        const { data: doacaoReservada, error: errorBusca } = await supabase
            .from('doacoes_reservadas')
            .select('*')
            .eq('id', item_id)
            .single();

        if (errorBusca || !doacaoReservada) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doação não encontrada' 
            });
        }

        // Inserir na tabela de doações concluídas
        const { data: doacaoConcluida, error: errorConcluir } = await supabase
            .from('doacoes_concluidas')
            .insert({
                empresa_id: doacaoReservada.empresa_id,
                ong_id: doacaoReservada.ong_id,
                excedente_id: doacaoReservada.excedente_id,
                titulo: doacaoReservada.titulo,
                descricao: doacaoReservada.descricao,
                quantidade: doacaoReservada.quantidade,
                data_validade: doacaoReservada.data_validade,
                status: 'concluída',
                data_publicacao: new Date()
            })
            .select()
            .single();

        if (errorConcluir) {
            console.error('Erro ao concluir doação:', errorConcluir);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao concluir doação' 
            });
        }

        // Remover da tabela de doações reservadas
        await supabase
            .from('doacoes_reservadas')
            .delete()
            .eq('id', item_id);

        res.json({
            success: true,
            message: 'Doação concluída com sucesso!',
            data: doacaoConcluida
        });

    } catch (err) {
        console.error('Erro na rota /concluir-doacao:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para concluir pedido
router.put('/concluir-pedido', verificarToken, async (req, res) => {
    try {
        const { item_id, tipo_item } = req.body;

        if (!item_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID do item é obrigatório' 
            });
        }

        console.log(`🔄 Concluindo pedido ID: ${item_id}`);

        // Buscar a solicitação reservada
        const { data: solicitacaoReservada, error: errorBusca } = await supabase
            .from('solicitacoes_ong_reservada')
            .select('*')
            .eq('id', item_id)
            .single();

        if (errorBusca || !solicitacaoReservada) {
            return res.status(404).json({ 
                success: false, 
                message: 'Solicitação não encontrada' 
            });
        }

        // Inserir na tabela de solicitações concluídas
        const { data: solicitacaoConcluida, error: errorConcluir } = await supabase
            .from('solicitacoes_ong_concluido')
            .insert({
                empresa_id: solicitacaoReservada.empresa_id,
                ong_id: solicitacaoReservada.ong_id,
                titulo: solicitacaoReservada.titulo,
                descricao: solicitacaoReservada.descricao,
                categoria_id: solicitacaoReservada.categoria_id,
                quantidade_desejada: solicitacaoReservada.quantidade_desejada,
                status: 'concluído',
                data_criacao: new Date()
            })
            .select()
            .single();

        if (errorConcluir) {
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao concluir solicitação' 
            });
        }

        // Remover da tabela de solicitações reservadas
        await supabase
            .from('solicitacoes_ong_reservada')
            .delete()
            .eq('id', item_id);

        res.json({
            success: true,
            message: 'Solicitação concluída com sucesso!',
            data: solicitacaoConcluida
        });

    } catch (err) {
        console.error('Erro na rota /concluir-pedido:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para cancelar reserva
router.put('/cancelar-reserva', verificarToken, async (req, res) => {
    try {
        const { item_id, tipo_item } = req.body;

        if (!item_id || !tipo_item) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID e tipo do item são obrigatórios' 
            });
        }

        console.log(`🔄 Cancelando reserva ID: ${item_id}, Tipo: ${tipo_item}`);

        let tabelaOrigem, tabelaDestino;

        if (tipo_item === 'doacao') {
            tabelaOrigem = 'doacoes_reservadas';
            tabelaDestino = 'doacoes_disponiveis';
        } else if (tipo_item === 'pedido') {
            tabelaOrigem = 'solicitacoes_ong_reservada';
            tabelaDestino = 'solicitacoes_ong';
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Tipo de item inválido' 
            });
        }

        // Buscar o item reservado
        const { data: itemReservado, error: errorBusca } = await supabase
            .from(tabelaOrigem)
            .select('*')
            .eq('id', item_id)
            .single();

        if (errorBusca || !itemReservado) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item não encontrado' 
            });
        }

        // Reinserir na tabela de disponíveis
        const { data: itemDisponivel, error: errorDisponivel } = await supabase
            .from(tabelaDestino)
            .insert({
                ...itemReservado,
                status: 'disponível',
                data_publicacao: new Date(),
                data_criacao: new Date()
            })
            .select()
            .single();

        if (errorDisponivel) {
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao cancelar reserva' 
            });
        }

        // Remover da tabela de reservados
        await supabase
            .from(tabelaOrigem)
            .delete()
            .eq('id', item_id);

        res.json({
            success: true,
            message: 'Reserva cancelada com sucesso!',
            data: itemDisponivel
        });

    } catch (err) {
        console.error('Erro na rota /cancelar-reserva:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});
// Rota para reservar pedido (empresa reserva pedido da ONG)
// No seu rotasAcoes.js - Rota com tratamento de erro completo
router.put('/reservar-pedido', verificarToken, async (req, res) => {
    console.log('🎯 ROTA reservar-pedido ACESSADA!');
    
    try {
        console.log('📦 Body recebido:', req.body);
        console.log('👤 Usuário autenticado:', req.user);

        const { pedido_id, empresa_id } = req.body;

        if (!pedido_id || !empresa_id) {
            console.log('❌ Dados incompletos:', { pedido_id, empresa_id });
            return res.status(400).json({ 
                success: false, 
                message: 'ID do pedido e ID da empresa são obrigatórios' 
            });
        }

        console.log(`🔄 Iniciando reserva - Pedido: ${pedido_id}, Empresa: ${empresa_id}`);

        // 1. Buscar o pedido disponível
        console.log('🔍 Buscando pedido disponível...');
        const { data: pedidoDisponivel, error: errorBusca } = await supabase
            .from('solicitacoes_ong')
            .select('*')
            .eq('id', pedido_id)
            .eq('status', 'disponivel')
            .single();

        console.log('📋 Resultado da busca:', { pedidoDisponivel, errorBusca });

        if (errorBusca || !pedidoDisponivel) {
            console.error('❌ Erro ao buscar pedido:', errorBusca);
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido não encontrado ou já reservado' 
            });
        }

        // 2. Buscar dados da empresa
        console.log('🏢 Buscando dados da empresa...');
        const { data: empresa, error: errorEmpresa } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', empresa_id)
            .single();

        console.log('📊 Dados da empresa:', { empresa, errorEmpresa });

        if (errorEmpresa || !empresa) {
            console.error('❌ Empresa não encontrada:', errorEmpresa);
            return res.status(404).json({ 
                success: false, 
                message: 'Empresa não encontrada' 
            });
        }

        // 3. Inserir na tabela de reservados
        console.log('💾 Inserindo pedido reservado...');
        const { data: pedidoReservado, error: errorReserva } = await supabase
            .from('solicitacoes_ong_reservada')
            .insert({
                empresa_id: empresa_id,
                ong_id: pedidoDisponivel.ong_id,
                titulo: pedidoDisponivel.titulo || pedidoDisponivel.nome_alimento,
                descricao: pedidoDisponivel.descricao,
                categoria_id: pedidoDisponivel.categoria_id,
                quantidade_desejada: pedidoDisponivel.quantidade_desejada || pedidoDisponivel.quantidade,
                status: 'reservado',
                data_criacao: new Date()
            })
            .select()
            .single();

        console.log('✅ Pedido reservado inserido:', { pedidoReservado, errorReserva });

        if (errorReserva) {
            console.error('❌ Erro ao reservar pedido:', errorReserva);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao reservar pedido: ' + errorReserva.message 
            });
        }

        // 4. Remover da tabela de disponíveis
        console.log('🗑️ Removendo pedido disponível...');
        const { error: errorRemover } = await supabase
            .from('solicitacoes_ong')
            .delete()
            .eq('id', pedido_id);

        console.log('✅ Pedido removido:', { errorRemover });

        if (errorRemover) {
            console.error('⚠️ Erro ao remover pedido disponível:', errorRemover);
            // Não retornamos erro aqui porque o pedido já foi reservado
        }

        console.log('🎉 Reserva concluída com sucesso!');
        
        res.json({
            success: true,
            message: 'Pedido reservado com sucesso!',
            data: pedidoReservado
        });

    } catch (err) {
        console.error('💥 ERRO GRAVE na rota /reservar-pedido:', err);
        console.error('Stack trace:', err.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor: ' + err.message 
        });
    }
});
export default router;