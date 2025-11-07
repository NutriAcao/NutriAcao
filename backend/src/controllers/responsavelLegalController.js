/* arquivo: backend/src/controllers/responsavelLegalController.js - arquivo de controller do backend: controla rotinas relacionadas a responsavellegalcontroller - funções/constantes: responsavel_id */

/*
    controller de responsável legal:
    - insere um novo responsável na tabela ResponsavelLegal
    - em seguida vincula o responsável à empresa usando a tabela de relação
    - trata erros comuns (ex.: duplicidade de cpf) e retorna códigos adequados
*/
import { supabase } from "../config/supabaseClient.js";

export async function cadastrarResponsavelLegal(req, res) {
  const {
    nome,
    cpf,
    cargo,
    email,
    telefone,

    empresa_id,
  } = req.body;

  if (!nome || !cpf || !email || !empresa_id) {
    return res
      .status(400)
      .send(
        "Dados essenciais do Responsável Legal (Nome, CPF, Email) ou o ID da Empresa não foram fornecidos.",
      );
  }

  try {
    const { data: responsavelData, error: responsavelError } = await supabase
      .from("ResponsavelLegal")
      .insert([
        {
          nome: nome,
          cpf: cpf,
          cargo: cargo,
          email: email,
          telefone: telefone,
        },
      ])
      .select("id");

    if (responsavelError) {
      console.error(
        "Erro ao cadastrar Responsável Legal:",
        responsavelError.message,
      );
      if (responsavelError.code === "23505") {
        return res.status(409).send("CPF do Responsável já cadastrado.");
      }
      return res.status(500).send("Falha na inserção do Responsável Legal.");
    }

    const responsavel_id = responsavelData[0].id;

    const { error: relacaoError } = await supabase
      .from("ResponsavelLegal_Empresa")
      .insert([
        {
          responsavel_id: responsavel_id,
          empresa_id: empresa_id,
        },
      ]);

    if (relacaoError) {
      console.error(
        "Erro ao vincular Responsável à Empresa:",
        relacaoError.message,
      );

      return res
        .status(500)
        .send(
          "Falha ao vincular Responsável à Empresa. O cadastro do responsável foi concluído, mas a vinculação falhou.",
        );
    }

    return res.status(201).json({
      status: "OK",
      message:
        "Responsável Legal cadastrado e vinculado com sucesso à Empresa!",
      responsavel_id: responsavel_id,
      empresa_id: empresa_id,
    });
  } catch (e) {
    console.error("Erro interno do servidor:", e);
    return res.status(500).send("Erro fatal ao processar a requisição.");
  }
}
