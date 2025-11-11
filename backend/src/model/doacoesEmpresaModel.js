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
        return null;
    }

    return data?.length ? data : null;
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
        return null;
    }

    return data?.length ? data : null;
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
        return null;
    }

    return data?.length ? data : null;
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
        return null;
    }

    return data?.length ? data : null;
}

