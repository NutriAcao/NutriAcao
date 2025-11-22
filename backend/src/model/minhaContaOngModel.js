import { supabase } from "../config/supabaseClient.js";

/**
 * Buscar ONG por ID
 */
export async function buscarOngPorId(id) {
  const { data, error } = await supabase
    .from("ong")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar ONG:", error);
    return null;
  }

  return data;
}

/**
 * Atualizar dados do responsável da ONG
 */
export async function atualizarResponsavelOng(id, novosDados) {
  const { error } = await supabase
    .from("ong")
    .update(novosDados)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar responsável da ONG:", error);
    throw error;
  }

  return true;
}

/**
 * Atualizar dados completos da ONG
 */
export async function atualizarDadosOng(id, dados) {
  const {
    email,
    senha_hash,
    nome_responsavel_ong,
    cpf_responsavel_ong,
    cargo_responsavel_ong,
    email_responsavel_ong,
    telefone_responsavel_ong,
    nome,
    cnpj,
    area_atuacao,
    cep,
    endereco,
    telefone
  } = dados;

  const { error } = await supabase
    .from("ong")
    .update({
      email,
      senha_hash,
      nome_responsavel_ong,
      cpf_responsavel_ong,
      cargo_responsavel_ong,
      email_responsavel_ong,
      telefone_responsavel_ong,
      nome,
      cnpj,
      area_atuacao,
      cep,
      endereco,
      telefone
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar dados da ONG:", error);
    throw new Error("Erro ao atualizar informações da ONG.");
  }

  return true;
}