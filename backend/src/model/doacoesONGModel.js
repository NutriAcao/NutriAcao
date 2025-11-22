// backend/src/model/doacoesONGModel.js
import { supabase } from "../config/supabaseClient.js";

export async function buscarSolicitacoesDisponiveisONG(id) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select('nome_alimento, quantidade, status')
        .eq('id_ong', id)
        .eq('status', 'disponível');

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}

export async function buscarDoacoesConcluidasONG(id) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select('nome_alimento, quantidade, status')
        .eq('id_ong', id)
        .eq('status', 'concluído');

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
        .select('NomeEmpresa, nome_alimento, quantidade, data_validade, status')
        .eq('id_ong_reserva', id)
        .eq('status', 'reservado');

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
        .select(`
            nome_alimento,
            quantidade,
            empresa: id_empresa_reserva (
                nome
            )
        `)
        .eq('id_ong', id)
        .eq('status', 'concluído');

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
        .eq('status', 'concluído');

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return [];
    }

    return data?.length ? data : [];
}

// =======================================================
// FUNÇÃO ADICIONADA PARA RESOLVER O ERRO
// =======================================================
/**
 * Busca todos os pedidos de doação de ONGs que estão no status 'disponível'
 * para que as Empresas possam visualizá-los e reservá-los.
 */
export async function buscarPedidosDisponiveisParaEmpresa() {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select(`
            id, 
            nome_alimento, 
            quantidade, 
            data_validade, 
            status, 
            data_cadastro_solicitacao,
            ong: id_ong (nome)
        `)
        .eq('status', 'disponível') // Filtra apenas pedidos que ainda não foram reservados
        .order('data_cadastro_solicitacao', { ascending: false }); // Ordena por mais recente

    if (error) {
        console.error('Erro ao buscar pedidos disponíveis para empresa:', error.message);
        throw error;
    }

    // Adapta o formato para garantir que o nome da ONG esteja diretamente acessível se necessário
    return data.map(item => ({
        ...item,
        nomeONG: item.ong ? item.ong.nome : 'ONG Não Identificada'
    }));
}