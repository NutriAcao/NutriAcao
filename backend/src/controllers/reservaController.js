// src/controllers/reservaController.js
import { supabase } from '../config/supabaseClient.js';

// =========================================================================
// FUNÇÕES DE RESERVA (Empresa Reserva Doação / ONG Reserva Pedido)
// Estas funções mantêm a lógica de pegar o ID do body (injetado pelo router)
// =========================================================================

export async function reservarDoacaoEmpresa(req, res) {
    // id_ong_logada VEM do req.body (injetado pelo router)
    const { doacao_id, id_ong_logada } = req.body; 

    if (!doacao_id || !id_ong_logada) {
        return res.status(400).json({ message: "ID da doação e da ONG são obrigatórios." });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .update({ 
                status: 'reservado',
                id_ong_reserva: id_ong_logada 
            })
            .eq('id', doacao_id)
            .eq('status', 'disponível') 
            .select();

        if (error) {
            console.error('Erro ao reservar doação:', error.message);
            return res.status(500).json({ message: "Falha ao reservar a doação. Erro: " + error.message });
        }
        if (data && data.length === 0) {
             return res.status(409).json({ message: "Doação não encontrada ou já foi reservada." });
        }
        return res.status(200).json({ status: 'OK', message: 'Doação reservada com sucesso!', dados: data });
    } catch (e) {
        console.error('Erro interno do servidor na reserva de doação:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

export async function reservarPedidoOng(req, res) {
    // id_empresa_logada VEM do req.body (injetado pelo router)
    const { pedido_id, id_empresa_logada } = req.body; 

    if (!pedido_id || !id_empresa_logada) {
        return res.status(400).json({ message: "ID do pedido e da Empresa são obrigatórios." });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .update({ 
                status: 'reservado',
                id_empresa_reserva: id_empresa_logada 
            })
            .eq('id', pedido_id) 
            .eq('status', 'disponível') 
            .select();

        if (error) {
            console.error('Erro ao reservar pedido:', error.message);
            return res.status(500).json({ message: "Falha ao reservar o pedido. Erro: " + error.message });
        }
        if (data && data.length === 0) {
             return res.status(409).json({ message: "Pedido não encontrado ou já foi reservado." });
        }
        return res.status(200).json({ status: 'OK', message: 'Pedido reservado com sucesso!', dados: data });
    } catch (e) {
        console.error('Erro interno do servidor na reserva de pedido:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}


// =========================================================================
// FUNÇÕES DE AÇÃO (Concluir e Cancelar) - CORRIGIDAS PARA USAR req.usuario.id
// =========================================================================

export async function concluirDoacao(req, res) {
    // CORREÇÃO: Pega o ID do usuário diretamente do token
    const id_usuario_logado = req.usuario.id; 
    const { item_id } = req.body; 

    if (!item_id) return res.status(400).json({ message: "ID do item é obrigatório." });

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .update({ status: 'concluído' })
            .eq('id', item_id)
            .eq('status', 'reservado') 
            // Permite que ONG reservadora OU Empresa criadora conclua
            .or(`id_empresa.eq.${id_usuario_logado},id_ong_reserva.eq.${id_usuario_logado}`) 
            .select();

        if (error) {
            console.error('Erro Supabase ao concluir doação:', error.message);
            return res.status(500).json({ message: "Falha ao concluir: " + error.message });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Item não encontrado, não está reservado ou você não tem permissão para concluir." });
        }
        return res.status(200).json({ message: 'Doação concluída com sucesso!' });
    } catch (e) {
        console.error('Erro interno ao concluir doação:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

export async function concluirPedido(req, res) {
    // CORREÇÃO: Pega o ID do usuário diretamente do token
    const id_usuario_logado = req.usuario.id;
    const { item_id } = req.body; 

    if (!item_id) return res.status(400).json({ message: "ID do item é obrigatório." });

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .update({ status: 'concluído' })
            .eq('id', item_id)
            .eq('status', 'reservado')
            // Permite que ONG criadora OU Empresa reservadora conclua
            .or(`id_ong.eq.${id_usuario_logado},id_empresa_reserva.eq.${id_usuario_logado}`)
            .select();

        if (error) {
            console.error('Erro Supabase ao concluir pedido:', error.message);
            return res.status(500).json({ message: "Falha ao concluir: " + error.message });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Item não encontrado, não está reservado ou você não tem permissão para concluir." });
        }
        return res.status(200).json({ message: 'Pedido concluído com sucesso!' });
    } catch (e) {
        console.error('Erro interno ao concluir pedido:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

export async function cancelarReserva(req, res) {
    // CORREÇÃO: Pega o ID do usuário diretamente do token
    const id_usuario_logado = req.usuario.id; 
    const { item_id, tipo_item } = req.body; 
    
    if (!item_id || !tipo_item) {
        return res.status(400).json({ message: "ID do item e tipo são obrigatórios." });
    }

    try {
        let tabela;
        let campo_reserva_id; 
        let campo_criador_id; 

        if (tipo_item === 'doacao') {
            tabela = 'doacoesDisponiveis';
            campo_reserva_id = 'id_ong_reserva'; 
            campo_criador_id = 'id_empresa'; 
        } else if (tipo_item === 'pedido') {
            tabela = 'doacoesSolicitadas';
            campo_reserva_id = 'id_empresa_reserva'; 
            campo_criador_id = 'id_ong'; 
        } else {
             return res.status(400).json({ message: "Tipo de item inválido (esperado 'doacao' ou 'pedido')." });
        }
        
        const { data, error } = await supabase
            .from(tabela)
            .update({ 
                status: 'disponível',
                [campo_reserva_id]: null, // Limpa o ID de quem reservou
            })
            .eq('id', item_id)
            .eq('status', 'reservado') 

            // SEGURANÇA: Garante que apenas quem criou OU quem reservou pode cancelar.
            .or(`${campo_criador_id}.eq.${id_usuario_logado},${campo_reserva_id}.eq.${id_usuario_logado}`) 
            .select();

        if (error) throw error;

        if (data.length === 0) {
             return res.status(404).json({ message: "Reserva não encontrada, não está reservada, ou você não tem permissão para cancelar." });
        }

        return res.status(200).json({ 
            status: 'OK', 
            message: 'Reserva cancelada com sucesso! O item está novamente disponível.', 
            dados: data
        });

    } catch (e) {
        console.error('Erro ao cancelar reserva:', e.message);
        return res.status(500).json({ message: "Falha ao cancelar a reserva. Erro: " + e.message });
    }
}