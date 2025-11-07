/* arquivo: backend/src/controllers/empresaController.js - arquivo de controller do backend: controla rotinas relacionadas a empresacontroller - funções/constantes: saltRounds, senhaHash, dadosResposta */

/*
    controller de empresas (cadastro):
    - recebe dados da empresa e do responsável no corpo da requisição
    - valida campos essenciais (senha, nome, cnpj, email, area_atuacao)
    - cria hash da senha com bcrypt e insere registro na tabela 'empresa' via supabase
    - remove o campo senha_hash antes de retornar os dados ao cliente
    - trata erros de duplicidade (cnpj/email) e erros internos
*/
import { supabase } from "../config/supabaseClient.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export async function cadastrarEmpresa(req, res) {
  console.log("Dados recebidos no req.body:", req.body);

  const {
    nome,
    cnpj,
    area_atuacao,
    cep,
    endereco,
    telefone,
    email,

    senha,
    nome_responsavel_empresa,
    cpf_responsavel_empresa,
    cargo_responsavel_empresa,
    email_responsavel_empresa,
    telefone_responsavel_empresa,
  } = req.body;

  if (!senha || !nome || !cnpj || !email || !area_atuacao) {
    return res
      .status(400)
      .send(
        "Campos essenciais (Nome, CNPJ, Tipo de Negócio, E-mail e Senha) não podem estar vazios.",
      );
  }

  try {
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const { data, error } = await supabase
      .from("empresa")
      .insert([
        {
          nome: nome,
          cnpj: cnpj,
          area_atuacao: area_atuacao,
          cep: cep,
          endereco: endereco,
          telefone: telefone,
          email: email,

          senha_hash: senhaHash,

          nome_responsavel_empresa: nome_responsavel_empresa,
          cpf_responsavel_empresa: cpf_responsavel_empresa,
          cargo_responsavel_empresa: cargo_responsavel_empresa,
          email_responsavel_empresa: email_responsavel_empresa,
          telefone_responsavel_empresa: telefone_responsavel_empresa,
        },
      ])
      .select();

    if (error) {
      console.error("Erro ao cadastrar Empresa:", error.message);

      if (error.code === "23505") {
        return res
          .status(409)
          .send("CNPJ ou E-mail institucional já cadastrado.");
      }
      return res
        .status(500)
        .send("Falha no cadastro da Empresa. Erro: " + error.message);
    }

    const dadosResposta = { ...data[0] };
    delete dadosResposta.senha_hash;

    return res.status(201).json({
      status: "OK",
      message:
        "Empresa cadastrada com sucesso! Agora é necessário cadastrar o Representante Legal.",
      dados: dadosResposta,
    });
  } catch (e) {
    console.error("Erro interno do servidor no cadastro da Empresa:", e);
    return res.status(500).send("Erro fatal ao processar a requisição.");
  }
}
