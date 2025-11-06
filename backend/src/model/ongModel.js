// backend/src/models/ongModel.js
import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function inserirONG(dados) {
    // hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, saltRounds);

    // preparando os dados para inserir no Supabase
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
        telefone_responsavel_ong: dados.telefone_responsavel_ong
        
    };
    //HAHAHAHAHAHAHAHAHAHAHAHAHAHAHA

    const { data, error } = await supabase
        .from('ong')
        .insert([novoRegistro])
        .select();

    if (error) throw error;

    // pra remover a senha antes de retornar
    const resultado = { ...data[0] };
    delete resultado.senha_hash;
    return resultado;
}
