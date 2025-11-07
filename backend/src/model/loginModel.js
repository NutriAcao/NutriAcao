/* arquivo: backend/src/model/loginModel.js - modelo de dados do backend: representa a entidade loginmodel - funções/constantes: tabelas */

/*
    modelo de login / usuário:
    - busca um usuário pelo email nas tabelas 'empresa' e 'ong' (ou tabela especificada)
    - retorna o registro encontrado (com campo adicional 'tipo' indicando a tabela)
    - usado pelo loginController para validar credenciais
*/
import { supabase } from "../config/supabaseClient.js";

export async function buscarUsuarioPorEmail(email, tipo = null) {
  const tabelas = tipo ? [tipo] : ["empresa", "ong"];

  for (const tabela of tabelas) {
    const { data, error } = await supabase
      .from(tabela)
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(`Erro ao buscar na tabela ${tabela}:`, error);
    }

    if (data) {
      return { ...data, tipo: tabela };
    }
  }

  return null;
}
