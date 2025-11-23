// src/controllers/reservaController.js - ATUALIZADO
import { supabase } from '../config/supabaseClient.js';

// =========================================================================
// FUNÇÕES DE RESERVA (Empresa Reserva Doação / ONG Reserva Pedido)
// =========================================================================

export async function reservarDoacaoEmpresa(req, res) {
    // A ONG está logada e quer reservar uma doação (excedente) de uma empresa.
    const { doacao_id } = req.body; 
    
    const usuario_id = req.usuario.id;

    if (!doacao_id) {
        return res.status(400).json({ message: "ID da doação é obrigatório." });
    }
    if (!usuario_id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
        // Buscar ID da ONG associada ao usuário
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ 
                message: 'Usuário não possui uma ONG cadastrada' 
            });
        }

        const id_ong_logada = ongData.id;

        const { data, error } = await supabase
            .from('doacoes_disponiveis') // NOVA TABELA
            .update({ 
                status: 'reservado',
                id_ong_reserva: id_ong_logada,
                data_reserva: new Date().toISOString()
            })
            .eq('id', doacao_id)
            .eq('status', 'disponível')
            .select();

        if (error) {
            console.error('Erro ao reservar doação:', error.message);
            return res.status(500).json({ message: "Falha ao reservar a doação. Erro: " + error.message });
        }
        
        if (!data || data.length === 0) {
             return res.status(409).json({ message: "Doação não encontrada ou já foi reservada por outra pessoa." });
        }

        return res.status(200).json({ status: 'OK', message: 'Doação reservada com sucesso!', dados: data });

    } catch (e) {
        console.error('Erro interno do servidor na reserva de doação:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

export async function reservarPedidoOng(req, res) {
    // A Empresa está logada e quer reservar um pedido solicitado por uma ONG.
    const { pedido_id } = req.body;
    
    const usuario_id = req.usuario.id;

    if (!pedido_id) {
        return res.status(400).json({ message: "ID do pedido é obrigatório." });
    }
    if (!usuario_id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
        // Buscar ID da Empresa associada ao usuário
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ 
                message: 'Usuário não possui uma empresa cadastrada' 
            });
        }

        const id_empresa_logada = empresaData.id;

        const { data, error } = await supabase
            .from('solicitacoes_ong') // NOVA TABELA
            .update({ 
                status: 'reservado',
                id_empresa_reserva: id_empresa_logada,
                data_reserva: new Date().toISOString()
            })
            .eq('id', pedido_id)
            .eq('status', 'disponivel')
            .select();

        if (error) {
            console.error('Erro ao reservar pedido:', error.message);
            return res.status(500).json({ message: "Falha ao reservar o pedido. Erro: " + error.message });
        }
        
        if (!data || data.length === 0) {
             return res.status(409).json({ message: "Pedido não encontrado ou já foi reservado." });
        }

        return res.status(200).json({ status: 'OK', message: 'Pedido reservado com sucesso!', dados: data });

    } catch (e) {
        console.error('Erro interno do servidor na reserva de pedido:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

// =========================================================================
// FUNÇÕES DE CONCLUSÃO (Atualizadas para novas tabelas)
// =========================================================================

export async function concluirDoacao(req, res) {
    const usuario_id = req.usuario.id;
    const { item_id } = req.body;

    if (!item_id) return res.status(400).json({ message: "ID do item é obrigatório." });

    try {
        // Buscar ID da empresa/ONG associada ao usuário
        const { data: empresaData } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const { data: ongData } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const empresa_id = empresaData?.id;
        const ong_id = ongData?.id;

        const { data, error } = await supabase
            .from('doacoes_disponiveis') // NOVA TABELA
            .update({ status: 'concluído' })
            .eq('id', item_id)
            .eq('status', 'reservado')
            .or(`empresa_id.eq.${empresa_id},id_ong_reserva.eq.${ong_id}`)
            .select();

        if (error) {
            console.error('Erro Supabase ao concluir doação:', error.message);
            return res.status(500).json({ message: "Falha ao concluir: " + error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Item não encontrado, ou você não tem permissão para concluir." });
        }
        return res.status(200).json({ message: 'Doação concluída com sucesso!' });
    } catch (e) {
        console.error('Erro interno ao concluir doação:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

export async function concluirPedido(req, res) {
    const usuario_id = req.usuario.id;
    const { item_id } = req.body;

    if (!item_id) return res.status(400).json({ message: "ID do item é obrigatório." });

    try {
        // Buscar ID da empresa/ONG associada ao usuário
        const { data: empresaData } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const { data: ongData } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const empresa_id = empresaData?.id;
        const ong_id = ongData?.id;

        const { data, error } = await supabase
            .from('solicitacoes_ong') // NOVA TABELA
            .update({ status: 'concluído' })
            .eq('id', item_id)
            .eq('status', 'reservado')
            .or(`ong_id.eq.${ong_id},id_empresa_reserva.eq.${empresa_id}`)
            .select();

        if (error) {
            console.error('Erro Supabase ao concluir pedido:', error.message);
            return res.status(500).json({ message: "Falha ao concluir: " + error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Item não encontrado, ou você não tem permissão para concluir." });
        }
        return res.status(200).json({ message: 'Pedido concluído com sucesso!' });
    } catch (e) {
        console.error('Erro interno ao concluir pedido:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

export async function cancelarReserva(req, res) {
    const usuario_id = req.usuario.id;
    const { item_id, tipo_item } = req.body;
    
    if (!item_id || !tipo_item) {
        return res.status(400).json({ message: "ID do item e tipo são obrigatórios." });
    }

    try {
        let tabela, campo_reserva_id, campo_criador_id;

        if (tipo_item === 'doacao') {
            tabela = 'doacoes_disponiveis'; // NOVA TABELA
            campo_reserva_id = 'id_ong_reserva';
            campo_criador_id = 'empresa_id';
        } else if (tipo_item === 'pedido') {
            tabela = 'solicitacoes_ong'; // NOVA TABELA
            campo_reserva_id = 'id_empresa_reserva';
            campo_criador_id = 'ong_id';
        } else {
            return res.status(400).json({ message: "Tipo de item inválido." });
        }

        // Buscar IDs das entidades associadas ao usuário
        const { data: empresaData } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const { data: ongData } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const empresa_id = empresaData?.id;
        const ong_id = ongData?.id;

        const { data, error } = await supabase
            .from(tabela)
            .update({ 
                status: tabela === 'doacoes_disponiveis' ? 'disponível' : 'disponivel',
                [campo_reserva_id]: null,
                data_reserva: null
            })
            .eq('id', item_id)
            .eq('status', 'reservado')
            .or(`${campo_criador_id}.eq.${tabela === 'doacoes_disponiveis' ? empresa_id : ong_id},${campo_reserva_id}.eq.${tabela === 'doacoes_disponiveis' ? ong_id : empresa_id}`)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Reserva não encontrada ou sem permissão." });
        }

        return res.status(200).json({ 
            status: 'OK', 
            message: 'Reserva cancelada com sucesso! O item está novamente disponível.', 
            dados: data
        });

    } catch (e) {
        console.error('Erro ao cancelar reserva:', e.message);
        return res.status(500).json({ message: "Falha ao cancelar a reserva." });
    }
}