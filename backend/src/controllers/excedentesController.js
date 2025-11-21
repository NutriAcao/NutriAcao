// backend/src/controllers/excedentesController.js
import { supabase } from '../config/supabaseClient.js';

export const cadastrarExcedente = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      categoria_id,
      quantidade,
      unidade_medida_id,
      data_validade
    } = req.body;

    const usuario_id = req.usuario.id;

    // Buscar ID da empresa associada ao usuário
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (empresaError || !empresaData) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui uma empresa cadastrada'
      });
    }

    const empresa_id = empresaData.id;

    // 1. Inserir na tabela excedentes
    const { data: excedente, error: excedenteError } = await supabase
      .from('excedentes')
      .insert([
        {
          empresa_id: empresa_id,
          titulo: titulo,
          descricao: descricao,
          categoria_id: categoria_id,
          quantidade: quantidade,
          unidade_medida_id: unidade_medida_id,
          data_validade: data_validade,
          status: 'disponivel',
          data_criacao: new Date()
        }
      ])
      .select()
      .single();

    if (excedenteError) {
      console.error('Erro ao cadastrar excedente:', excedenteError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar excedente: ' + excedenteError.message
      });
    }

    // 2. Inserir na tabela doacoes_disponiveis
    const { data: doacao, error: doacaoError } = await supabase
      .from('doacoes_disponiveis')
      .insert([
        {
          empresa_id: empresa_id,
          excedente_id: excedente.id,
          titulo: titulo,
          descricao: descricao,
          quantidade: quantidade,
          data_validade: data_validade,
          status: 'disponível',
          data_publicacao: new Date()
        }
      ])
      .select();

    if (doacaoError) {
      console.error('Erro ao criar doação disponível:', doacaoError);
      // Rollback: deletar o excedente criado
      await supabase.from('excedentes').delete().eq('id', excedente.id);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar doação disponível'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Excedente cadastrado com sucesso!',
      data: excedente
    });

  } catch (error) {
    console.error('Erro interno ao cadastrar excedente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const listarCategorias = async (req, res) => {
  try {
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao listar categorias:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar categorias'
      });
    }

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Erro interno ao listar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const listarUnidadesMedida = async (req, res) => {
  try {
    const { data: unidades, error } = await supabase
      .from('unidades_medida')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao listar unidades de medida:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar unidades de medida'
      });
    }

    res.json({
      success: true,
      data: unidades
    });
  } catch (error) {
    console.error('Erro interno ao listar unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};