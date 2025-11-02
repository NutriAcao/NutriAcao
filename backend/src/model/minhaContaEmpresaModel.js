import { supabase } from "../config/supabaseClient.js";

/**
 * Busca os dados completos da empresa pelo ID
 * @param {number} 
 * @returns {object|null} 
 */
export async function buscarEmpresaPorId(id) {
  const { data, error } = await supabase
    .from('empresa')
    .select(`
      id,
      email,
      nome_responsavel_empresa,
      cpf_responsavel_empresa,
      cargo_responsavel_empresa,
      email_responsavel_empresa,
      telefone_responsavel_empresa
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar empresa:', error);
    return null;
  }

  return data;
}

/**
 * Busca os dados completos da ONG pelo ID
*/
export async function buscarOngPorId(id) {
  const { data, error } = await supabase
    .from('ong')
    .select(`
      id,
      email,
      nome_responsavel_ong,
      cpf_responsavel_ong,
      cargo_responsavel_ong,
      email_responsavel_ong,
      telefone_responsavel_ong
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar ONG:', error);
    return null;
  }

  return data;
}

/**
 * Função genérica — tenta buscar tanto empresa quanto ONG
 * @param {number} id - ID do usuário
 * @param {string} tipo - "empresa" ou "ong"
 */
export async function buscarUsuarioPorId(id, tipo = null) {
  if (tipo === 'empresa') return buscarEmpresaPorId(id);
  if (tipo === 'ong') return buscarOngPorId(id);

  // tenta nas duas tabelas
  const empresa = await buscarEmpresaPorId(id);
  if (empresa) return { ...empresa, tipo: 'empresa' };

  const ong = await buscarOngPorId(id);
  if (ong) return { ...ong, tipo: 'ong' };

  return null;
}
