// src/controllers/doacaoDetalhesController.js
import { supabase } from '../config/supabaseClient.js';

// --- Função Auxiliar Corrigida ---
async function getOngDetails(id_ong) {
    if (!id_ong) return null;

    // CORREÇÃO FINAL: Usando aspas duplas ("nome") para forçar o reconhecimento 
    // do nome da coluna exato no PostgreSQL, resolvendo o erro 'column ongs.nome does not exist'.
    // Buscar dados na tabela 'ongs' e complementar com dados do usuário (telefone/email) se necessário
    const { data, error } = await supabase
        .from('ongs')
        .select('id, usuario_id, responsavel_legal_id, email_institucional, cnpj, nome_ong')
        .eq('id', id_ong)
        .single();
        
    if (error) {
        console.error('Erro ao buscar detalhes da ONG:', error.message); 
        return null;
    }
    
    if (!data) return null;

    // Tentar buscar telefone/email via tabela usuarios (se usuario_id estiver presente)
    let usuarioInfo = null;
    if (data.usuario_id) {
        const { data: uData, error: uErr } = await supabase.from('usuarios').select('nome, telefone, email').eq('id', data.usuario_id).maybeSingle();
        if (!uErr && uData) usuarioInfo = uData;
    }

    return {
        id: data.id,
        nome: data.nome_ong || null,
        email: data.email_institucional || (usuarioInfo && usuarioInfo.email) || null,
        telefone: (usuarioInfo && usuarioInfo.telefone) || null,
        cnpj: data.cnpj || null
    };
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
            
            // Adiciona detalhes da ONG OU um objeto placeholder se a busca falhar
            doacao.ong = ongDetails || { 
                nome: 'ONG não identificada (Verifique o log do servidor)', 
                telefone: '-', 
                email: 'erro@servidor.com' 
            }; 
        }
        // Retorna 200 (OK) em caso de sucesso ou falha na busca da ONG (para não quebrar o modal)
        return res.status(200).json(doacao);

    } catch (error) {
        console.error('Erro fatal ao buscar detalhes do excedente:', error.message);
        // Retorna 500 SOMENTE se o erro for fatal (ex: falha de conexão com o banco)
        return res.status(500).json({ message: 'Falha ao buscar detalhes no servidor. Verifique o log.' });
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

// Listagem Tabela 2
export async function getMinhasSolicitacoesReservadas(req, res) {
    const id_empresa_logada = req.usuario.id;
    if (!id_empresa_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*')
            .eq('status', 'reservado')
            .eq('id_empresa_reserva', id_empresa_logada);

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar solicitações reservadas:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}

// Listagem Tabela 3
export async function getMeusExcedentesReservados(req, res) {
    const id_empresa_logada = req.usuario.id;
    if (!id_empresa_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        // DICA: Adicione .order() para garantir que os mais recentes apareçam primeiro
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*') 
            .eq('status', 'reservado')
            .eq('id_empresa', id_empresa_logada); 
        
        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar excedentes reservadas:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}