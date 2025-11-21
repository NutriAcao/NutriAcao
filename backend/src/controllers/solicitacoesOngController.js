// controllers/solicitacoesOngController.js - VERSÃO COMPLETA
import { supabase } from '../config/supabaseClient.js';

export const cadastrarSolicitacaoOng = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      categoria_id,
      quantidade_desejada,
      telefone_contato,
      email_contato
    } = req.body;

    const usuario_id = req.usuario.id;

    console.log('Dados recebidos para solicitação ONG:', req.body);
    console.log('Usuário logado ID:', usuario_id);

    // Buscar o ID da ONG associada a este usuário
    const { data: ongData, error: ongError } = await supabase
      .from('ongs')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (ongError || !ongData) {
      console.error('ONG não encontrada para este usuário:', ongError);
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui uma ONG cadastrada'
      });
    }

    const ong_id = ongData.id;
    console.log('ONG ID encontrada:', ong_id);

    // Inserir na tabela solicitacoes_ong
    const { data: solicitacao, error } = await supabase
      .from('solicitacoes_ong')
      .insert([
        {
          ong_id: ong_id,
          titulo: titulo,
          descricao: descricao,
          categoria_id: categoria_id,
          quantidade_desejada: quantidade_desejada,
          telefone_contato: telefone_contato,
          email_contato: email_contato,
          status: 'disponivel',
          data_criacao: new Date()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar solicitação ONG:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar solicitação: ' + error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Solicitação cadastrada com sucesso!',
      data: solicitacao
    });

  } catch (error) {
    console.error('Erro interno ao cadastrar solicitação ONG:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// SE precisar desta função depois, descomente:
/*
export const listarSolicitacoesOng = async (req, res) => {
  try {
    const { ong_id } = req.params;

    const { data: solicitacoes, error } = await supabase
      .from('solicitacoes_ong')
      .select(`
        *,
        categorias (nome),
        ongs (nome_ong, email_institucional)
      `)
      .eq('ong_id', ong_id)
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
      data: solicitacoes
    });
  } catch (error) {
    console.error('Erro interno ao buscar solicitações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
*/