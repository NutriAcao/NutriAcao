// src/model/doacoesModel.js
import { supabase } from "../config/supabaseClient.js";

export async function buscarDoacoesDisponiveis() {
    const { data, error } = await supabase
        .from('doacoes_disponiveis')
        .select(`
            id,
            titulo,
            descricao,
            quantidade,
            data_validade,
            status,
            data_publicacao,
            empresa:empresas(
                id,
                nome_fantasia,
                razao_social,
                email_institucional,
                telefone
            ),
            excedente:excedentes(
                unidade_medida:unidades_medida(abreviacao)
            )
        `)
        .eq('status', 'disponível')
        .order('data_publicacao', { ascending: false });

    if (error) {
        console.error('Erro ao buscar doações disponíveis:', error);
        throw error;
    }

    return data || [];
}

export async function buscarDoacoesReservadasPorONG(ong_id) {
    const { data, error } = await supabase
        .from('doacoes_reservadas')
        .select(`
            id,
            titulo,
            descricao,
            quantidade,
            data_validade,
            status,
            data_publicacao,
            empresa:empresas(
                id,
                nome_fantasia,
                razao_social,
                email_institucional
            )
        `)
        .eq('ong_id', ong_id)
        .eq('status', 'reservado')
        .order('data_publicacao', { ascending: false });

    if (error) {
        console.error('Erro ao buscar doações reservadas:', error);
        throw error;
    }

    return data || [];
}

export async function buscarDoacoesConcluidasPorONG(ong_id) {
    const { data, error } = await supabase
        .from('doacoes_concluidas')
        .select(`
            id,
            titulo,
            descricao,
            quantidade,
            data_validade,
            status,
            data_publicacao,
            empresa:empresas(
                id,
                nome_fantasia,
                razao_social
            )
        `)
        .eq('ong_id', ong_id)
        .eq('status', 'concluída')
        .order('data_publicacao', { ascending: false });

    if (error) {
        console.error('Erro ao buscar doações concluídas:', error);
        throw error;
    }

    return data || [];
}

export async function reservarDoacao(doacao_id, ong_id) {
    // Buscar dados da doação disponível
    const { data: doacaoData, error: doacaoError } = await supabase
        .from('doacoes_disponiveis')
        .select('*')
        .eq('id', doacao_id)
        .eq('status', 'disponível')
        .single();

    if (doacaoError || !doacaoData) {
        throw new Error('Doação não encontrada ou já reservada');
    }

    // Inserir na tabela de reservadas
    const { data: reservaData, error: reservaError } = await supabase
        .from('doacoes_reservadas')
        .insert({
            empresa_id: doacaoData.empresa_id,
            ong_id: ong_id,
            excedente_id: doacaoData.excedente_id,
            titulo: doacaoData.titulo,
            descricao: doacaoData.descricao,
            quantidade: doacaoData.quantidade,
            data_validade: doacaoData.data_validade,
            status: 'reservado',
            data_publicacao: doacaoData.data_publicacao
        })
        .select();

    if (reservaError) {
        throw reservaError;
    }

    // Remover da tabela de disponíveis
    await supabase
        .from('doacoes_disponiveis')
        .delete()
        .eq('id', doacao_id);

    return reservaData && reservaData.length > 0 ? reservaData[0] : null;
}

export async function concluirDoacao(doacao_id, ong_id) {
    // Buscar dados da doação reservada
    const { data: reservaData, error: reservaError } = await supabase
        .from('doacoes_reservadas')
        .select('*')
        .eq('id', doacao_id)
        .eq('ong_id', ong_id)
        .eq('status', 'reservado')
        .single();

    if (reservaError || !reservaData) {
        throw new Error('Doação reservada não encontrada');
    }

    // Inserir na tabela de concluídas
    const { data: conclusaoData, error: conclusaoError } = await supabase
        .from('doacoes_concluidas')
        .insert({
            empresa_id: reservaData.empresa_id,
            ong_id: reservaData.ong_id,
            excedente_id: reservaData.excedente_id,
            titulo: reservaData.titulo,
            descricao: reservaData.descricao,
            quantidade: reservaData.quantidade,
            data_validade: reservaData.data_validade,
            status: 'concluída',
            data_publicacao: reservaData.data_publicacao
        })
        .select();

    if (conclusaoError) {
        throw conclusaoError;
    }

    // Remover da tabela de reservadas
    await supabase
        .from('doacoes_reservadas')
        .delete()
        .eq('id', doacao_id);

    // Atualizar métricas
    await atualizarMetricas(reservaData.empresa_id, ong_id, reservaData.quantidade);

    return conclusaoData && conclusaoData.length > 0 ? conclusaoData[0] : null;
}

async function atualizarMetricas(empresa_id, ong_id, quantidade) {
    const { error } = await supabase
        .from('metricas')
        .insert({
            empresa_id: empresa_id,
            ong_id: ong_id,
            quantidade_kg: quantidade,
            data_metrica: new Date().toISOString().split('T')[0],
            tipo_metrica: 'doacao_concluida'
        });

    if (error) {
        console.error('Erro ao atualizar métricas:', error);
    }
}