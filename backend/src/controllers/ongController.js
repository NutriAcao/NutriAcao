/* arquivo: backend/src/controllers/ongController.js - arquivo de controller do backend: controla rotinas relacionadas a ongcontroller - funções/constantes: dados */

/*
    controller de ong (cadastro):
    - valida campos essenciais de cadastro de ong
    - delega a criação da ong à função inserirONG (model)
    - trata erros de duplicidade (cnpj/email) e retorna o registro criado
*/
import { inserirONG } from "../model/ongModel.js";

export async function cadastrarONG(req, res) {
  const {
    nome,
    cnpj,
    area_atuacao,
    cep,
    endereco,
    telefone,
    email,
    nome_responsavel_ong,
    cpf_responsavel_ong,
    cargo_responsavel_ong,
    email_responsavel_ong,
    telefone_responsavel_ong,
    senha,
  } = req.body;

  if (!senha || !nome || !cnpj || !email) {
    return res
      .status(400)
      .send(
        "Campos essenciais (Nome, CNPJ, E-mail e Senha) não podem estar vazios.",
      );
  }

  try {
    const dados = await inserirONG({
      nome,
      cnpj,
      area_atuacao,
      cep,
      endereco,
      telefone,
      email,
      nome_responsavel_ong,
      cpf_responsavel_ong,
      cargo_responsavel_ong,
      email_responsavel_ong,
      telefone_responsavel_ong,
      senha,
    });

    return res.status(201).json({
      status: "OK",
      message:
        "ONG cadastrada com sucesso! Agora é necessário cadastrar o Responsável Legal.",
      dados: dados,
    });
  } catch (error) {
    console.error("Erro ao cadastrar ONG:", error);

    if (error.code === "23505") {
      return res
        .status(409)
        .send("CNPJ ou E-mail institucional já cadastrado.");
    }

    return res
      .status(500)
      .send("Falha no cadastro da ONG. Detalhes: " + error.message);
  }
}
