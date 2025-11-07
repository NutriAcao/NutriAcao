/* arquivo: backend/src/controllers/doacaoOngController.js - arquivo de controller do backend: controla rotinas relacionadas a doacaoongcontroller */

/*
    controller de doações (ong):
    - recebe dados da solicitação de doação pela ong
    - valida campos essenciais e insere registro na tabela doacoesSolicitadas via supabase
    - trata erros e retorna as respostas apropriadas (201 em sucesso)
*/
import { supabase } from "../config/supabaseClient.js";

export async function cadastrarDoacaoOng(req, res) {
  console.log("Dados recebidos no req.body:", req.body);

  const {
    nome,
    email_Institucional,
    nome_alimento,
    quantidade,
    telefone,
    email,
    id_ong,
  } = req.body;

  if (!nome_alimento || !nome || !email_Institucional || !email) {
    return res
      .status(400)
      .json({ message: "Campos essenciais não podem estar vazios." });
  }

  try {
    const { data, error } = await supabase
      .from("doacoesSolicitadas")
      .insert([
        {
          nomeONG: nome,
          email_Institucional: email_Institucional,
          nome_alimento: nome_alimento,
          quantidade: quantidade,
          telefoneContato: telefone,
          emailContato: email,
          status: "disponível",
          id_ong: id_ong,
        },
      ])
      .select();

    if (error) {
      console.error("Erro ao cadastrar a doação:", error.message);

      return res
        .status(500)
        .json({
          message: "Falha no cadastro da doação. Erro: " + error.message,
        });
    }

    return res.status(201).json({
      status: "OK",
      message: "Doação cadastrada com sucesso !",
      dados: data,
    });
  } catch (e) {
    console.error("Erro interno do servidor no cadastro da Empresa:", e);
    return res
      .status(500)
      .json({ message: "Erro fatal ao processar a requisição." });
  }
}
