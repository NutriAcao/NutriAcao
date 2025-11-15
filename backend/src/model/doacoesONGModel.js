import { supabase } from "../config/supabaseClient.js";

export async function buscarSolicitacoesDisponiveisONG(id) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select('nome_alimento, quantidade, status')
        .eq('id_ong', id)
        .eq('status', 'disponível')

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarSolicitacoesAndamentoONG(id) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select(`
            nome_alimento,
            quantidade,
            status,
            empresa: id_empresa_reserva (
                nome
            )
        `)
        .eq('id_ong', id)
        .eq('status', 'reservado');

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarExcedentesAndamentoONG(id) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis')
        .select('NomeEmpresa, nome_alimento, quantidade,data_validade, status')
        .eq('id_ong_reserva', id)
        .eq('status', 'reservado')

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarSolicitacoesConcluidasONG(id) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select(`nome_alimento,
                 quantidade,
                 empresa: id_empresa_reserva (
                nome
                )
              `)
        .eq('id_ong', id)
        .eq('status', 'concluído')

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarExcedentesConcluidosONG(id) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis')
        .select('NomeEmpresa, nome_alimento, quantidade')
        .eq('id_ong_reserva', id)
        .eq('status', 'concluído')

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}