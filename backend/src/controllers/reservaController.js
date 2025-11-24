// src/controllers/reservaController.js - VERSÃO COMPLETA
import { supabase } from '../config/supabaseClient.js';

// =====================================================
// FUNÇÕES EXISTENTES (que já estão no seu router)
// =====================================================

// ONG reserva doação disponível
export const reservarDoacaoONG = async (req, res) => {
    try {
        const { doacao_id } = req.body;
        const usuarioId = req.usuario.id;

        console.log(`🔄 ONG ${usuarioId} reservando doação ${doacao_id}`);

        // Verificar se a doação existe e está disponível
        const { data: doacao, error: doacaoError } = await supabase
            .from('doacoes')
            .select('*')
            .eq('id', doacao_id)
            .eq('status', 'disponível')
            .single();

        if (doacaoError || !doacao) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doação não encontrada ou já foi reservada' 
            });
        }

        // Reservar a doação para a ONG
        const { error: updateError } = await supabase
            .from('doacoes')
            .update({ 
                status: 'reservado',
                ong_id: usuarioId,
                data_reserva: new Date().toISOString()
            })
            .eq('id', doacao_id);

        if (updateError) {
            throw updateError;
        }

        console.log(`✅ Doação ${doacao_id} reservada com sucesso para ONG ${usuarioId}`);

        res.json({ 
            success: true, 
            message: 'Doação reservada com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao reservar doação:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

// Empresa reserva solicitação de ONG
export const reservarSolicitacaoEmpresa = async (req, res) => {
    try {
        const { solicitacao_id } = req.body;
        const usuarioId = req.usuario.id;

        console.log(`🔄 Empresa ${usuarioId} reservando solicitação ${solicitacao_id}`);

        // Verificar se a solicitação existe e está disponível
        const { data: solicitacao, error: solicitacaoError } = await supabase
            .from('solicitacoes_ong')
            .select('*')
            .eq('id', solicitacao_id)
            .eq('status', 'disponível')
            .single();

        if (solicitacaoError || !solicitacao) {
            return res.status(404).json({ 
                success: false, 
                message: 'Solicitação não encontrada ou já foi reservada' 
            });
        }

        // Reservar a solicitação para a empresa
        const { error: updateError } = await supabase
            .from('solicitacoes_ong')
            .update({ 
                status: 'reservado',
                empresa_id: usuarioId,
                data_reserva: new Date().toISOString()
            })
            .eq('id', solicitacao_id);

        if (updateError) {
            throw updateError;
        }

        console.log(`✅ Solicitação ${solicitacao_id} reservada com sucesso para empresa ${usuarioId}`);

        res.json({ 
            success: true, 
            message: 'Solicitação reservada com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao reservar solicitação:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

// =====================================================
// NOVAS FUNÇÕES PARA CONCLUSÃO (que estão no router)
// =====================================================

// Concluir doação reservada - MOVENDO para doacoes_concluidas
export const concluirDoacaoReservada = async (req, res) => {
    try {
        const { doacao_id } = req.body;
        const usuarioId = req.usuario.id;

        console.log(`📦 Concluindo doação reservada ID: ${doacao_id} por ONG ${usuarioId}`);

        // 1. Buscar dados completos da doação
        const { data: doacao, error: doacaoError } = await supabase
            .from('doacoes')
            .select('*')
            .eq('id', doacao_id)
            .eq('status', 'reservado')
            .eq('ong_id', usuarioId)
            .single();

        if (doacaoError || !doacao) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doação não encontrada ou não está reservada para você' 
            });
        }

        // 2. Inserir na tabela de doações concluídas
        const { error: insertError } = await supabase
            .from('doacoes_concluidas')
            .insert({
                titulo: doacao.titulo,
                descricao: doacao.descricao,
                quantidade: doacao.quantidade,
                data_validade: doacao.data_validade,
                status: 'concluída',
                data_publicacao: doacao.data_publicacao,
                data_conclusao: new Date().toISOString(),
                empresa_id: doacao.empresa_id,
                ong_id: usuarioId,
                categoria_id: doacao.categoria_id,
                unidade_medida_id: doacao.unidade_medida_id,
                cep_retirada: doacao.cep_retirada,
                telefone_contato: doacao.telefone_contato,
                email_contato: doacao.email_contato
            });

        if (insertError) {
            console.error('❌ Erro ao inserir na tabela concluída:', insertError);
            throw insertError;
        }

        // 3. Remover da tabela de doações ativas
        const { error: deleteError } = await supabase
            .from('doacoes')
            .delete()
            .eq('id', doacao_id);

        if (deleteError) {
            console.error('❌ Erro ao remover da tabela ativa:', deleteError);
            throw deleteError;
        }

        console.log(`✅ Doação ${doacao_id} concluída e movida para tabela de conclusão`);

        res.json({ 
            success: true, 
            message: 'Doação concluída com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao concluir doação:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

// Concluir pedido da ONG - MOVENDO para solicitacoes_ong_concluido
export const concluirPedidoONG = async (req, res) => {
    try {
        const { pedido_id } = req.body;
        const usuarioId = req.usuario.id;

        console.log(`📦 Concluindo pedido ONG ID: ${pedido_id} por ONG ${usuarioId}`);

        // 1. Buscar dados completos do pedido
        const { data: pedido, error: pedidoError } = await supabase
            .from('solicitacoes_ong')
            .select('*')
            .eq('id', pedido_id)
            .eq('ong_id', usuarioId)
            .eq('status', 'reservado')
            .single();

        if (pedidoError || !pedido) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido não encontrado ou não está reservado' 
            });
        }

        // 2. Inserir na tabela de solicitações concluídas
        const { error: insertError } = await supabase
            .from('solicitacoes_ong_concluido')
            .insert({
                titulo: pedido.titulo,
                descricao: pedido.descricao,
                quantidade_desejada: pedido.quantidade_desejada,
                status: 'concluído',
                data_criacao: pedido.data_criacao,
                data_conclusao: new Date().toISOString(),
                ong_id: usuarioId,
                empresa_id: pedido.empresa_id,
                categoria_id: pedido.categoria_id,
                observacoes: pedido.observacoes
            });

        if (insertError) {
            console.error('❌ Erro ao inserir na tabela concluída:', insertError);
            throw insertError;
        }

        // 3. Remover da tabela de solicitações ativas
        const { error: deleteError } = await supabase
            .from('solicitacoes_ong')
            .delete()
            .eq('id', pedido_id);

        if (deleteError) {
            console.error('❌ Erro ao remover da tabela ativa:', deleteError);
            throw deleteError;
        }

        console.log(`✅ Pedido ${pedido_id} concluído e movido para tabela de conclusão`);

        res.json({ 
            success: true, 
            message: 'Pedido concluído com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao concluir pedido:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

// Cancelar reserva
export const cancelarReservaONG = async (req, res) => {
    try {
        const { item_id, tipo_item } = req.body;
        const usuarioId = req.usuario.id;

        console.log(`📦 Cancelando reserva - ID: ${item_id}, Tipo: ${tipo_item} por usuário ${usuarioId}`);

        if (tipo_item === 'doacao') {
            // Verificar se a doação está reservada para esta ONG
            const { data: doacao, error: doacaoError } = await supabase
                .from('doacoes')
                .select('*')
                .eq('id', item_id)
                .eq('status', 'reservado')
                .eq('ong_id', usuarioId)
                .single();

            if (doacaoError || !doacao) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doação não encontrada ou não está reservada para você' 
                });
            }

            // Cancelar reserva da doação
            const { error: updateError } = await supabase
                .from('doacoes')
                .update({ 
                    status: 'disponível',
                    ong_id: null,
                    data_reserva: null
                })
                .eq('id', item_id);

            if (updateError) {
                throw updateError;
            }

        } else if (tipo_item === 'pedido') {
            // Verificar se o pedido pertence a esta ONG e está reservado
            const { data: pedido, error: pedidoError } = await supabase
                .from('solicitacoes_ong')
                .select('*')
                .eq('id', item_id)
                .eq('ong_id', usuarioId)
                .eq('status', 'reservado')
                .single();

            if (pedidoError || !pedido) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Pedido não encontrado ou não está reservado' 
                });
            }

            // Cancelar reserva do pedido
            const { error: updateError } = await supabase
                .from('solicitacoes_ong')
                .update({ 
                    status: 'disponível',
                    empresa_id: null,
                    data_reserva: null
                })
                .eq('id', item_id);

            if (updateError) {
                throw updateError;
            }
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Tipo de item inválido' 
            });
        }

        console.log(`✅ Reserva ${item_id} cancelada com sucesso`);

        res.json({ 
            success: true, 
            message: 'Reserva cancelada com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao cancelar reserva:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

// =====================================================
// FUNÇÕES ADICIONAIS (se precisar no futuro)
// =====================================================

// Concluir doação (função genérica - se precisar)
export const concluirDoacao = async (req, res) => {
    // Implementação se necessário
    res.json({ success: true, message: 'Doação concluída' });
};

// Concluir solicitação (função genérica - se precisar)
export const concluirSolicitacao = async (req, res) => {
    // Implementação se necessário
    res.json({ success: true, message: 'Solicitação concluída' });
};