/* arquivo: backend/src/model/ongModel.js - modelo de dados do backend: representa a entidade ongmodel - funções/constantes: novoRegistro, saltRounds, resultado, senhaHash */

/*
    modelo de ong:
    - encapsula a lógica de persistência para criação de ong
    - recebe dados, gera hash da senha com bcrypt e insere registro na tabela 'ong' via supabase
    - remove o campo senha_hash antes de retornar o resultado
*/
import { supabase } from "../config/supabaseClient.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export async function inserirONG(dados) {
  const senhaHash = await bcrypt.hash(dados.senha, saltRounds);

  const novoRegistro = {
    nome: dados.nome,
    cnpj: dados.cnpj,
    area_atuacao: dados.area_atuacao,
    cep: dados.cep,
    endereco: dados.endereco,
    telefone: dados.telefone,
    email: dados.email,
    senha_hash: senhaHash,

    nome_responsavel_ong: dados.nome_responsavel_ong,
    cpf_responsavel_ong: dados.cpf_responsavel_ong,
    cargo_responsavel_ong: dados.cargo_responsavel_ong,
    email_responsavel_ong: dados.email_responsavel_ong,
    telefone_responsavel_ong: dados.telefone_responsavel_ong,
  };

  const { data, error } = await supabase
    .from("ong")
    .insert([novoRegistro])
    .select();

  if (error) throw error;

  const resultado = { ...data[0] };
  delete resultado.senha_hash;
  return resultado;
}
