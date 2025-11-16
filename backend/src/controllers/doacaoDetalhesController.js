// src/controllers/doacaoDetalhesController.js
import { supabase } from '../config/supabaseClient.js';

// Função auxiliar para buscar detalhes da ONG
async function getOngDetails(id_ong) {
    if (!id_ong) return null;
    const { data, error } = await supabase
        .from('ongs')
        .select('nome_instituicao as nome, telefone, email')
        .eq('id', id_ong)
        .single();
    if (error) {
        console.error('Erro ao buscar detalhes da ONG:', error.message);
        return null;
    }
    return data;
}

// 1. Detalhes do Excedente (Tabela 1: Disponível | Tabela 3: Reservado)
export async function getDetalhesExcedente(req, res) {
    const id = req.params.id;

    try {
        const { data: doacao, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !doacao) {
            return res.status(404).json({ message: 'Excedente não encontrado.' });
        }
        
        // Se for reservado, busca detalhes da ONG que reservou
        if (doacao.status === 'reservado' && doacao.id_ong_reserva) {
            const ongDetails = await getOngDetails(doacao.id_ong_reserva);
            doacao.ong = ongDetails; // Adiciona os detalhes da ONG ao objeto de doação
        }

        return res.status(200).json(doacao);

    } catch (error) {
        console.error('Erro ao buscar detalhes do excedente:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar detalhes.' });
    }
}

// 2. Detalhes da Solicitação (Tabela 2: Pedido Reservado pela Empresa)
export async function getDetalhesSolicitacao(req, res) {
    const id = req.params.id;

    try {
        const { data: solicitacao, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*') 
            .eq('id', id)
            .single();

        if (error || !solicitacao) {
            return res.status(404).json({ message: 'Solicitação não encontrada.' });
        }
        
        // Busca detalhes da ONG que fez o pedido
        if (solicitacao.id_ong) {
            const ongDetails = await getOngDetails(solicitacao.id_ong);
            solicitacao.ong = ongDetails;
        }

        return res.status(200).json(solicitacao);

    } catch (error) {
        console.error('Erro ao buscar detalhes da solicitação:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar detalhes da solicitação.' });
    }
}
export async function getMinhasSolicitacoesReservadas(req, res) {
    const id_empresa_logada = req.usuario.id;
    if (!id_empresa_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*') // Pega tudo
            .eq('status', 'reservado') // Filtro 1: Status
            .eq('id_empresa_reserva', id_empresa_logada); // Filtro 2: Eu reservei

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar solicitações reservadas:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}

// --- NOVA FUNÇÃO 2: Apenas para a Tabela 3 ---
// Busca EXCEDENTES que EU (Empresa) cadastrei e que foram reservados por uma ONG.
export async function getMeusExcedentesReservados(req, res) {
    const id_empresa_logada = req.usuario.id;
    if (!id_empresa_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*') // Pega tudo
            .eq('status', 'reservado') // Filtro 1: Status
            .eq('id_empresa', id_empresa_logada); // Filtro 2: Eu criei
        
        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar excedentes reservados:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}