/* arquivo: backend/src/model/doacoesONGModel.js - modelo de dados do backend: representa a entidade doacoesongmodel */

/*
    modelo de doações (ong):
    - consulta a tabela doacoesSolicitadas para operações relacionadas a doações solicitadas pela ong
    - busca doações concluídas por email institucional
*/
import { supabase } from "../config/supabaseClient.js";

export async function buscarDoacoesConcluidasPorEmailONG(email) {
  const { data, error } = await supabase
    .from("doacoesSolicitadas")
    .select("id, nome_alimento, quantidade")
    .eq("email_Institucional", email);

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Erro ao buscar doações:", error);
    }
    return null;
  }

  return data?.length ? data : null;
}
