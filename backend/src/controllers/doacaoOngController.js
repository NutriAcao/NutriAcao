// controllers/doacaoOngController.js

// ADAPTADO ----------------------------------------------///////////////

import { supabase } from '../config/supabaseClient.js';

export async function cadastrarDoacaoOng(req, res) {
    console.log('Dados recebidos no req.body:', req.body); 
    
    const { 
      titulo,
      descricao,
      categoria_id,
      quantidade_desejada,
      telefone_contato,
      email_contato,
      ong_id
    } = req.body;

    // Verificação de segurança e validação
    if (!titulo || !quantidade_desejada || !ong_id) {
        return res.status(400).json({
          success: false,
          message: "Campos essenciais não podem estar vazios."
        });
    }
    
    try {
        // Inserir na tabela solicitacoes_ong (ESTRUTURA CORRIGIDA)
        const { data, error } = await supabase
            .from('solicitacoes_ong')
            .insert([
                { 
                    ong_id: ong_id,
                    titulo: titulo,
                    descricao: descricao || '',
                    categoria_id: categoria_id || 1,
                    quantidade_desejada: quantidade_desejada,
                    status: 'disponivel',
                    data_criacao: new Date(),
                    telefone_contato: telefone_contato,
                    email_contato: email_contato
                } 
            ])
            .select();

        if (error) {
            console.error('Erro ao cadastrar a solicitação:', error.message);
            return res.status(500).json({
              success: false,
              message: "Falha no cadastro da solicitação. Erro: " + error.message
            });
        }

        return res.status(201).json({ 
            success: true,
            message: 'Solicitação cadastrada com sucesso!', 
            data: data
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro da solicitação:', e);
        return res.status(500).json({
          success: false,
          message: "Erro fatal ao processar a requisição."
        });
    }
}

export async function getPedidosDisponiveis(req, res) {
    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*') // Pega todas as colunas
            .eq('status', 'disponível'); // O FILTRO MÁGICO!

        if (error) throw error;

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar pedidos disponíveis:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}

// -------------------------------------------------------------------
// FUNÇÃO 3: Para a Tabela "Meus Pedidos Disponíveis" (Status: Disponível)
// -------------------------------------------------------------------
export async function getMeusPedidosDisponiveis(req, res) {
    const id_ong_logada = req.usuario.id; 

    if (!id_ong_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*')
            .eq('status', 'disponível') 
            .eq('id_ong', id_ong_logada); // Filtro: Somente os pedidos que EU criei

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar meus pedidos:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}

// -------------------------------------------------------------------
// FUNÇÃO 4: Para a Tabela "Itens Recebidos/Reservados" (Status: Reservado)
// -------------------------------------------------------------------
export async function getMeusPedidosReservados(req, res) {
    const id_ong_logada = req.usuario.id;

    if (!id_ong_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*') 
            .eq('status', 'reservado') // Filtro 1: Status
            .eq('id_ong', id_ong_logada); // Filtro 2: Eu (ONG) criei

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar meus pedidos reservados:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}

// --- NOVO (PARA TABELA 3: Doações que eu reservei) ---
// Tabela 3: Excedentes em Andamento (Reservados por Mim)
export async function getDoacoesQueReservei(req, res) {
    const id_ong_logada = req.usuario.id;

    if (!id_ong_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*') 
            .eq('status', 'reservado') // Filtro 1: Status
            .eq('id_ong_reserva', id_ong_logada); // Filtro 2: Eu (ONG) reservei
        
        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar doações que reservei:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
} // ← CHAVE DE FECHAMENTO ADICIONADA AQUI

// Função para listar solicitações (se necessário)
export async function listarSolicitacoesOng(req, res) {
  try {
    const { data, error } = await supabase
      .from('solicitacoes_ong')
      .select(`
        *,
        categorias (nome),
        ongs (nome_ong, email_institucional)
      `)
      .eq('ong_id', req.params.ong_id)
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar solicitações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar solicitações'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Erro interno ao buscar solicitações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}