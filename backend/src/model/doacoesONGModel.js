// backend/src/model/doacoesONGModel.js
import { supabase } from "../config/supabaseClient.js";

// Função para buscar o histórico de doações concluídas (que você já tinha)
export async function buscarDoacoesConcluidasONG(email) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select('id, nome_alimento, quantidade')
        .eq('email_Institucional', email);

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return null;
    }

    return data?.length ? data : null;
}

// =======================================================
// >>>>> FUNÇÃO ADICIONADA PARA RESOLVER O ERRO <<<<<
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