// backend/src/controllers/relatoriosController.js
import { supabase } from '../config/supabaseClient.js';

/**
 * Buscar relatórios de impacto para EMPRESAS - VERSÃO DEFINITIVA
 */
export const getRelatoriosImpacto = async (req, res) => {
  try {
    console.log('=== INICIANDO getRelatoriosImpacto ===');
    const usuario_id = req.usuario.id;

    // Buscar empresa do usuário
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nome_fantasia, razao_social')
      .eq('usuario_id', usuario_id)
      .single();

    if (empresaError || !empresaData) {
      return res.status(404).json({
        success: false,
        error: 'Empresa não encontrada'
      });
    }

    const empresa_id = empresaData.id;

    // BUSCA SIMPLES - APENAS COLUNAS QUE EXISTEM
    console.log('🔍 Buscando doações concluídas para empresa ID:', empresa_id);
    const { data: doacoes, error: doacoesError } = await supabase
      .from('doacoes_concluidas')
      .select('*')
      .eq('empresa_id', empresa_id)
      .eq('status', 'concluída')
      .order('data_publicacao', { ascending: false });

    if (doacoesError) {
      console.error('❌ Erro ao buscar doações:', doacoesError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar doações'
      });
    }

    console.log(`✅ ${doacoes?.length || 0} doações encontradas`);

    // Buscar dados das ONGs separadamente (APENAS COLUNAS QUE EXISTEM)
    const doacoesCompletas = [];
    
    for (const doacao of doacoes || []) {
      let ongNome = 'ONG não especificada';

      // Buscar APENAS o nome da ONG (coluna que existe)
      if (doacao.ong_id) {
        const { data: ong } = await supabase
          .from('ongs')
          .select('nome_ong') // APENAS COLUNA QUE EXISTE
          .eq('id', doacao.ong_id)
          .single();
        ongNome = ong?.nome_ong || 'ONG não especificada';
      }

      const quantidade = parseFloat(doacao.quantidade) || 0;
      const totalRefeicoes = Math.round(quantidade * 5);
      const totalCO2 = quantidade * 0.3;

      doacoesCompletas.push({
        id: doacao.id,
        data: doacao.data_publicacao,
        alimentos: [
          {
            nome: doacao.titulo || 'Alimento não especificado',
            quantidade: quantidade,
            unidade: 'kg',
            refeicoes: totalRefeicoes,
            co2: totalCO2,
            categoria: 'outros'
          }
        ],
        ong: ongNome,
        status: doacao.status || 'concluída',
        responsavel: empresaData.nome_fantasia || empresaData.razao_social,
        endereco: 'Endereço não informado',
        telefone: 'Contato não informado',
        totalRefeicoes: totalRefeicoes,
        totalCO2: totalCO2,
        totalAlimentos: quantidade
      });
    }

    return res.json({
      success: true,
      data: doacoesCompletas,
      total: doacoesCompletas.length
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar relatórios de consumo para ONGs - VERSÃO DEFINITIVA
 */
export const getRelatoriosConsumo = async (req, res) => {
  try {
    console.log('=== INICIANDO getRelatoriosConsumo ===');
    const usuario_id = req.usuario.id;

    // Buscar ONG do usuário
    const { data: ongData, error: ongError } = await supabase
      .from('ongs')
      .select('id, nome_ong')
      .eq('usuario_id', usuario_id)
      .single();

    if (ongError || !ongData) {
      return res.status(404).json({
        success: false,
        error: 'ONG não encontrada'
      });
    }

    const ong_id = ongData.id;

    // Buscar solicitações concluídas da ONG
    console.log('🔍 Buscando solicitações concluídas para ONG ID:', ong_id);
    const { data: solicitacoes, error: solicitacoesError } = await supabase
      .from('solicitacoes_ong_concluido')
      .select('*')
      .eq('ong_id', ong_id)
      .eq('status', 'concluído')
      .order('data_criacao', { ascending: false });

    if (solicitacoesError) {
      console.error('❌ Erro ao buscar solicitações:', solicitacoesError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar solicitações'
      });
    }

    console.log(`✅ ${solicitacoes?.length || 0} solicitações encontradas`);

    // Buscar dados das empresas separadamente
    const solicitacoesCompletas = [];
    
    for (const solicitacao of solicitacoes || []) {
      let empresaNome = 'Empresa não especificada';

      // Buscar nome da empresa
      if (solicitacao.empresa_id) {
        const { data: empresa } = await supabase
          .from('empresas')
          .select('nome_fantasia, razao_social')
          .eq('id', solicitacao.empresa_id)
          .single();
        empresaNome = empresa?.nome_fantasia || empresa?.razao_social || 'Empresa não especificada';
      }

      const quantidade = parseFloat(solicitacao.quantidade_desejada) || 0;
      const totalRefeicoes = Math.round(quantidade * 5);
      const totalCO2 = quantidade * 0.3;

      solicitacoesCompletas.push({
        id: solicitacao.id,
        data: solicitacao.data_criacao,
        alimentos: [
          {
            nome: solicitacao.titulo || 'Alimento não especificado',
            quantidade: quantidade,
            unidade: 'kg',
            refeicoes: totalRefeicoes,
            co2: totalCO2,
            categoria: 'outros'
          }
        ],
        empresa: empresaNome,
        status: solicitacao.status || 'concluído',
        responsavel: ongData.nome_ong,
        endereco: 'Endereço não informado',
        telefone: 'Contato não informado',
        totalRefeicoes: totalRefeicoes,
        totalCO2: totalCO2,
        totalAlimentos: quantidade
      });
    }

    return res.json({
      success: true,
      data: solicitacoesCompletas,
      total: solicitacoesCompletas.length
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar ONGs parceiras para o filtro
 */
export const getOngsParceiras = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    
    // Buscar empresa do usuário
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (empresaError || !empresaData) {
      return res.status(404).json({
        success: false,
        error: 'Empresa não encontrada'
      });
    }

    const empresa_id = empresaData.id;
    
    // Buscar ONGs únicas das doações concluídas
    const { data: doacoes, error } = await supabase
      .from('doacoes_concluidas')
      .select('ong_id')
      .eq('empresa_id', empresa_id)
      .not('ong_id', 'is', null);

    if (error) {
      console.error('❌ Erro ao buscar ONGs:', error);
      throw error;
    }

    // Extrair ONGs únicas
    const ongsUnicas = [];
    const ongsIds = new Set();

    for (const doacao of doacoes || []) {
      if (doacao.ong_id && !ongsIds.has(doacao.ong_id)) {
        ongsIds.add(doacao.ong_id);
        
        // Buscar nome da ONG
        const { data: ong } = await supabase
          .from('ongs')
          .select('nome_ong')
          .eq('id', doacao.ong_id)
          .single();
        
        if (ong) {
          ongsUnicas.push({
            id: doacao.ong_id,
            nome: ong.nome_ong
          });
        }
      }
    }

    console.log(`✅ ${ongsUnicas.length} ONGs parceiras encontradas`);

    res.json({
      success: true,
      data: ongsUnicas
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ONGs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar ONGs'
    });
  }
};

/**
 * Buscar estatísticas resumidas
 */
export const getEstatisticas = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const tipo_usuario = req.usuario.tipo;

    let totalAlimentos = 0;
    let totalDoacoes = 0;

    if (tipo_usuario === 'empresa') {
      // Buscar doações da empresa
      const { data: doacoes, error } = await supabase
        .from('doacoes_concluidas')
        .select('quantidade')
        .eq('empresa_id', usuario_id)
        .eq('status', 'concluída');

      if (!error && doacoes) {
        totalDoacoes = doacoes.length;
        totalAlimentos = doacoes.reduce((sum, d) => sum + (parseFloat(d.quantidade) || 0), 0);
      }
    } else if (tipo_usuario === 'ong') {
      // Buscar solicitações da ONG
      const { data: solicitacoes, error } = await supabase
        .from('solicitacoes_ong_concluido')
        .select('quantidade_desejada')
        .eq('ong_id', usuario_id)
        .eq('status', 'concluído');

      if (!error && solicitacoes) {
        totalDoacoes = solicitacoes.length;
        totalAlimentos = solicitacoes.reduce((sum, s) => sum + (parseFloat(s.quantidade_desejada) || 0), 0);
      }
    }

    const totalRefeicoes = Math.round(totalAlimentos * 5);
    const totalCO2 = totalAlimentos * 0.3;
    const pessoasBeneficiadas = Math.round(totalRefeicoes / 3);

    return res.json({
      success: true,
      data: {
        totalDoacoes,
        totalAlimentos: totalAlimentos.toFixed(1),
        totalRefeicoes,
        totalCO2: totalCO2.toFixed(1),
        pessoasBeneficiadas
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
};