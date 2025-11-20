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
        // Inserir na tabela solicitacoes_ong
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
            // USANDO OS NOVOS CAMPOS
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