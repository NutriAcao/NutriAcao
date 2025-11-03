// src/model/minhaContaEmpresaModel.js
import { supabase } from "../config/supabaseClient.js";

/**
 * Buscar usuário por ID e tipo (empresa ou ong)
 */
export async function buscarUsuarioPorId(id, tipo) {
  const { data, error } = await supabase
    .from(tipo)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }

  return data;
}

/**
 * Atualizar informações do responsável da empresa
 */
export async function atualizarResponsavelEmpresa(id, novosDados) {
  const { error } = await supabase
    .from("empresa")
    .update(novosDados)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar responsável:", error);
    throw error;
  }

  return true;
}
