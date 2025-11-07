// Para Empresa

export async function reservarDoacaoEmpresa(req, res) {
    // 1. Receber ID da Doação a ser reservada e ID da ONG que está reservando
    const { doacao_id, id_ong_logada } = req.body; 

    // 2. Validação
    if (!doacao_id || !id_ong_logada) {
        return res.status(400).json({ message: "ID da doação e da ONG são obrigatórios." });
    }

    try {
        // 3. Atualizar o status e registrar o ID da ONG que reservou
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .update({ 
                status: 'reservado', // Novo Status!
                id_ong_reserva: id_ong_logada 
            })
            .eq('id', doacao_id) // Filtra pelo ID da doação
            .eq('status', 'disponível') // Garante que só reserve se estiver disponível
            .select();

        if (error) {
            console.error('Erro ao reservar doação:', error.message);
            return res.status(500).json({ message: "Falha ao reservar a doação. Erro: " + error.message });
        }

        if (data && data.length === 0) {
             // Isso acontece se a doação não foi encontrada ou já foi reservada (o filtro .eq('status', 'disponível') falhou)
             return res.status(409).json({ message: "Doação não encontrada ou já foi reservada." });
        }

        return res.status(200).json({ 
            status: 'OK', 
            message: 'Doação reservada com sucesso!', 
            dados: data
        });

    } catch (e) {
        console.error('Erro interno do servidor na reserva de doação:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}

// para ONGS

export async function reservarPedidoOng(req, res) {
    // 1. Receber ID do Pedido a ser reservado e ID da Empresa que está reservando
    const { pedido_id, id_empresa_logada } = req.body; 

    // 2. Validação
    if (!pedido_id || !id_empresa_logada) {
        return res.status(400).json({ message: "ID do pedido e da Empresa são obrigatórios." });
    }

    try {
        // 3. Atualizar o status e registrar o ID da Empresa que reservou
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .update({ 
                status: 'reservado', // Novo Status!
                id_empresa_reserva: id_empresa_logada 
            })
            .eq('id', pedido_id) // Filtra pelo ID do pedido
            .eq('status', 'disponível') // Garante que só reserve se estiver disponível
            .select();

        if (error) {
            console.error('Erro ao reservar pedido:', error.message);
            return res.status(500).json({ message: "Falha ao reservar o pedido. Erro: " + error.message });
        }

        if (data && data.length === 0) {
             return res.status(409).json({ message: "Pedido não encontrado ou já foi reservado." });
        }

        return res.status(200).json({ 
            status: 'OK', 
            message: 'Pedido reservado com sucesso!', 
            dados: data
        });

    } catch (e) {
        console.error('Erro interno do servidor na reserva de pedido:', e);
        return res.status(500).json({ message: "Erro fatal ao processar a requisição." });
    }
}
// Em backend/controllers/reservaController.js

// Função para CONCLUIR uma Doação (que estava reservada)
export async function concluirDoacao(req, res) {
    const { doacao_id, id_usuario_logado } = req.body; 

    const { data, error } = await supabase
        .from('doacoesDisponiveis')
        .update({ status: 'concluido' })
        .eq('id', doacao_id)
        .eq('status', 'reservado') // Só pode concluir se estiver 'reservado'
        // Segurança: Garante que só o criador ou quem reservou pode concluir
        .or(`id_empresa.eq.${id_usuario_logado},id_ong_reserva.eq.${id_usuario_logado}`) 
        .select();

    if (error) return res.status(500).json({ message: "Falha ao concluir: " + error.message });
    if (data.length === 0) return res.status(404).json({ message: "Item não encontrado ou você não tem permissão." });

    return res.status(200).json({ message: 'Doação concluída com sucesso!' });
}

// Função para CONCLUIR um Pedido (que estava reservado)
export async function concluirPedido(req, res) {
    const { pedido_id, id_usuario_logado } = req.body;

    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .update({ status: 'concluido' })
        .eq('id', pedido_id)
        .eq('status', 'reservado')
        .or(`id_ong.eq.${id_usuario_logado},id_empresa_reserva.eq.${id_usuario_logado}`)
        .select();

    if (error) return res.status(500).json({ message: "Falha ao concluir: " + error.message });
    if (data.length === 0) return res.status(404).json({ message: "Item não encontrado ou você não tem permissão." });

    return res.status(200).json({ message: 'Pedido concluído com sucesso!' });
}