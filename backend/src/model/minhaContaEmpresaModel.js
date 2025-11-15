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

export async function atualizarResponsavelEmpresa(id, novosDados, tipo) {
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

export async function atualizarDadosEmpresa(id, dados) {
  const {
    email,
    senha_hash,
    nome_responsavel_empresa,
    cpf_responsavel_empresa,
    cargo_responsavel_empresa,
    email_responsavel_empresa,
    telefone_responsavel_empresa,
    nome,
    telefone,
    endereco
  } = dados;

  const { error } = await supabase
    .from("empresa")
    .update({
      email,
      senha_hash,
      nome_responsavel_empresa,
      cpf_responsavel_empresa,
      cargo_responsavel_empresa,
      email_responsavel_empresa,
      telefone_responsavel_empresa,
      nome,
      telefone,
      endereco
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar dados da empresa:", error);
    throw new Error("Erro ao atualizar informações da empresa.");
  }

  return true;
}
