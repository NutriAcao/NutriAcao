import { supabase } from "../config/supabaseClient.js";

export async function buscarExcedentesDisponiveisEmpresa(id_empresa) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis') 
        .select('id, nome_alimento, quantidade, status')
        .eq('id_empresa', id_empresa )
        .eq('status', 'disponível')
        
    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return null;
    }

    return data?.length ? data : null;
}

export async function buscarExcedentesReservadosPorEmpresa(id_empresa) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis')
        .select(`
            nome_alimento,
            quantidade,
            data_validade,
            ong: id_ong_reserva (
                nome
            )
        `)
        .eq('id_empresa', id_empresa)
        .eq('status', 'reservado');

    if (error) {
        console.error('Erro ao buscar doações reservadas:', error);
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarDoacoesSolicitadasEmpresa(id_empresa) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select(`
            nome_alimento,
            quantidade,
            dataCadastroSolicitacao,
            nomeONG
        `)
        .eq('id_empresa_reserva', id_empresa)
        .eq('status', 'reservado');

    if (error) {
        console.error('Erro ao buscar doações solicitadas:', error);
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarExcedentesConcluidosPorEmpresa(id_empresa) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis')
        .select(`
            nome_alimento,
            quantidade,
            data_validade,
            ong: id_ong_reserva (
                nome
            )
        `)
        .eq('id_empresa', id_empresa)
        .eq('status', 'concluído');

    if (error) {
        console.error('Erro ao buscar doações reservadas:', error);
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarDoacoesSolicitadasConcluidasEmpresa(id_empresa) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select(`
            nome_alimento,
            quantidade,
            dataCadastroSolicitacao,
            nomeONG
        `)
        .eq('id_empresa_reserva', id_empresa)
        .eq('status', 'concluído');

    if (error) {
        console.error('Erro ao buscar doações solicitadas:', error);
        return [];
    }

    return data?.length ? data : null;
}/**
 * Busca detalhes de um excedente cadastrado pela Empresa (tabela doacoesDisponiveis)
 * @param {number} doacaoId - ID da doação/excedente
 */
export async function buscarDetalhesExcedente(doacaoId) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis') 
        .select(`
            id,
            nome_alimento,
            quantidade,
            data_validade,
            status,
            telefone_contato
            ong: id_ong_reserva (nome, telefone, email) 
        `)
        .eq('id', doacaoId)
        .single();

    if (error) {
        console.error('Erro ao buscar detalhes do excedente:', error.message);
        // Lançar um erro genérico para o controller não expor detalhes do DB
        throw new Error('Erro ao buscar detalhes do excedente.'); 
    }

    return data;
}

/**
 * Busca detalhes de um pedido de ONG reservado pela Empresa (tabela doacoesSolicitadas)
 * Esta função parece já estar correta, mas verifique se usa 'doacoesSolicitadas'.
 */
export async function buscarDetalhesSolicitacao(solicitacaoId) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas') 
        .select(`
            id,
            nome_alimento,
            quantidade,
            status,
            dataCadastroSolicitacao: "dataCadastroSolicitacao", 
            nomeONG: "nomeONG",
            telefoneContato: "telefoneContato",
            emailContato: "emailContato"
        `)
        .eq('id', solicitacaoId)
        .single();

    if (error) {
        console.error('Erro ao buscar detalhes da solicitação:', error.message);
        throw error;
    }

    // Adapta o formato para ser consistente com 'excedente'
    if (data) {
        data.ong = { 
            nome: data.nomeONG, 
            telefone: data.telefoneContato, 
            email: data.emailContato 
        };
    }
    return data;
}