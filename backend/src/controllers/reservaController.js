// src/controllers/reservaController.js
import { supabase } from '../config/supabaseClient.js';

// =========================================================================
// FUNÇÕES DE RESERVA (Empresa Reserva Doação / ONG Reserva Pedido)
// CORRIGIDO: Agora usa req.usuario.id para garantir que o ID seja salvo
// =========================================================================

export async function reservarDoacaoEmpresa(req, res) {
    // A ONG está logada e quer reservar uma doação (excedente) de uma empresa.
    const { doacao_id } = req.body; 
    
    // CORREÇÃO: Pegamos o ID da ONG diretamente do token autenticado
    const id_ong_logada = req.usuario.id; 

    if (!doacao_id) {
        return res.status(400).json({ message: "ID da doação é obrigatório." });
    }
    if (!id_ong_logada) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .update({ 
                status: 'reservado',
                id_ong_reserva: id_ong_logada, // Preenche a coluna corretamente
                data_reserva: new Date().toISOString() // Opcional: registra a data
            })
            .eq('id', doacao_id)
            .eq('status', 'disponível') // Garante que só reserva se estiver livre
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
    
    // CORREÇÃO: Pegamos o ID da Empresa diretamente do token autenticado
    const id_empresa_logada = req.usuario.id; 

    if (!pedido_id) {
        return res.status(400).json({ message: "ID do pedido é obrigatório." });
    }
    if (!id_empresa_logada) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .update({ 
                status: 'reservado',
                id_empresa_reserva: id_empresa_logada, // Preenche a coluna corretamente
                data_reserva: new Date().toISOString() // Opcional
            })
            .eq('id', pedido_id) 
            .eq('status', 'disponível') 
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
// FUNÇÕES DE AÇÃO (Concluir e Cancelar) 
// Mantidas como estavam, pois a lógica do req.usuario.id já estava correta aqui
// =========================================================================

export async function concluirDoacao(req, res) {
    const id_usuario_logado = req.usuario.id; 
    const { item_id } = req.body; 

    if (!item_id) return res.status(400).json({ message: "ID do item é obrigatório." });

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .update({ status: 'concluído' })
            .eq('id', item_id)
            .eq('status', 'reservado') 
            // Permite que a Empresa Criadora OU a ONG que reservou concluam
            .or(`id_empresa.eq.${id_usuario_logado},id_ong_reserva.eq.${id_usuario_logado}`) 
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
    const id_usuario_logado = req.usuario.id;
    const { item_id } = req.body; 

    if (!item_id) return res.status(400).json({ message: "ID do item é obrigatório." });

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .update({ status: 'concluído' })
            .eq('id', item_id)
            .eq('status', 'reservado')
            // Permite que ONG Criadora OU a Empresa que reservou concluam
            .or(`id_ong.eq.${id_usuario_logado},id_empresa_reserva.eq.${id_usuario_logado}`)
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
             return res.status(400).json({ message: "Tipo de item inválido." });
        }
        
        const { data, error } = await supabase
            .from(tabela)
            .update({ 
                status: 'disponível',
                [campo_reserva_id]: null, // Limpa o ID de quem reservou
                data_reserva: null
            })
            .eq('id', item_id)
            .eq('status', 'reservado') 
            // Garante que apenas quem criou OU quem reservou pode cancelar
            .or(`${campo_criador_id}.eq.${id_usuario_logado},${campo_reserva_id}.eq.${id_usuario_logado}`) 
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