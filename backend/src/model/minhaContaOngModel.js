import { supabase } from '../config/supabaseClient.js';
import * as EmpresaModel from './minhaContaEmpresaModel.js';

// Buscar ONG por ID
export async function buscarOngPorId(id) {
  try {
    const { data, error } = await supabase.from('ongs').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar ONG:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Erro em buscarOngPorId:', err);
    return null;
  }
}

// Atualiza ou cria o registro de responsável para ONG
export async function atualizarResponsavelOng(usuarioId, novosDados) {
  try {
    const { data: responsavel } = await supabase.from('responsaveis').select('*').eq('usuario_id', usuarioId).maybeSingle();

    const payload = {
      nome_completo: novosDados.nome_responsavel_ong || novosDados.nome || novosDados.nome_completo || null,
      cpf: novosDados.cpf_responsavel_ong || novosDados.cpf || null,
      cargo: novosDados.cargo_responsavel_ong || novosDados.cargo || null,
      email: novosDados.email_responsavel_ong || novosDados.email || null,
      telefone: novosDados.telefone_responsavel_ong || novosDados.telefone || null,
      data_nascimento: novosDados.data_nascimento || null,
      usuario_id: usuarioId
    };

    if (responsavel && responsavel.id) {
      const { error } = await supabase.from('responsaveis').update(payload).eq('id', responsavel.id);
      if (error) throw error;
      return true;
    } else {
      const { error } = await supabase.from('responsaveis').insert([payload]);
      if (error) throw error;
      return true;
    }
  } catch (err) {
    console.error('Erro ao atualizar/criar responsavel ONG:', err);
    throw err;
  }
}

// Backwards-compatible alias expected by controllers
export async function buscarUsuarioPorId(usuarioId, tipo) {
  // delegate to the shared implementation in minhaContaEmpresaModel
  return EmpresaModel.buscarUsuarioPorId(usuarioId, tipo);
}

export async function atualizarResponsavel(usuarioId, novosDados) {
  return atualizarResponsavelOng(usuarioId, novosDados);
}

export async function alterarSenha(usuarioId, senha_atual, nova_senha) {
  // delegate to shared implementation
  return EmpresaModel.alterarSenha(usuarioId, senha_atual, nova_senha);
}

// Atualizar dados completos da ONG
export async function atualizarDadosOng(id, dados) {
  try {
    const {
      email,
      senha,
      senha_hash,
      nome_responsavel_ong,
      cpf_responsavel_ong,
      cargo_responsavel_ong,
      email_responsavel_ong,
      telefone_responsavel_ong,
      nome,
      cnpj,
      cep,
      endereco,
      telefone
    } = dados;

    const updateOng = {};
    if (email !== undefined) updateOng.email = email;
    if (nome !== undefined) updateOng.nome_ong = nome;
    if (cnpj !== undefined) updateOng.cnpj = cnpj;
    if (cep !== undefined) updateOng.cep = cep;
    if (endereco !== undefined) updateOng.endereco = endereco;
    if (telefone !== undefined) updateOng.telefone = telefone;
    if (nome_responsavel_ong !== undefined) updateOng.nome_responsavel_ong = nome_responsavel_ong;
    if (cpf_responsavel_ong !== undefined) updateOng.cpf_responsavel_ong = cpf_responsavel_ong;
    if (cargo_responsavel_ong !== undefined) updateOng.cargo_responsavel_ong = cargo_responsavel_ong;
    if (email_responsavel_ong !== undefined) updateOng.email_responsavel_ong = email_responsavel_ong;
    if (telefone_responsavel_ong !== undefined) updateOng.telefone_responsavel_ong = telefone_responsavel_ong;

    if (Object.keys(updateOng).length > 0) {
      const { error } = await supabase.from('ongs').update(updateOng).eq('id', id);
      if (error) {
        console.error('Erro ao atualizar dados da ONG:', error);
        throw new Error('Erro ao atualizar informações da ONG.');
      }
    }

    // Update usuario
    const updateUsuario = {};
    if (email !== undefined) updateUsuario.email = email;
    if (nome !== undefined) updateUsuario.nome = nome;
    if (telefone !== undefined) updateUsuario.telefone = telefone;

    if (senha !== undefined) {
      const bcrypt = (await import('bcrypt')).default;
      const SALT_ROUNDS = 10;
      const hash = await bcrypt.hash(String(senha), SALT_ROUNDS);
      updateUsuario.senha_hash = hash;
    } else if (senha_hash !== undefined) {
      updateUsuario.senha_hash = senha_hash;
    }

    if (Object.keys(updateUsuario).length > 0) {
      const { error } = await supabase.from('usuarios').update(updateUsuario).eq('id', id);
      if (error) {
        console.error('Erro ao atualizar usuarios da ONG:', error);
        throw error;
      }
    }

    // Handle endereco object creation/update in 'enderecos'
    if (endereco !== undefined) {
      const enderecoObj = endereco;
      const { data: existingEndereco } = await supabase.from('enderecos').select('*').eq('usuario_id', id).limit(1).maybeSingle();

      if (typeof enderecoObj === 'string') {
        if (existingEndereco && existingEndereco.id) {
          const { error } = await supabase.from('enderecos').update({ logradouro: enderecoObj }).eq('id', existingEndereco.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('enderecos').insert([{ usuario_id: id, logradouro: enderecoObj }]);
          if (error) throw error;
        }
      } else if (typeof enderecoObj === 'object' && enderecoObj !== null) {
        const payload = {
          usuario_id: id,
          cep: enderecoObj.cep || null,
          logradouro: enderecoObj.logradouro || null,
          numero: enderecoObj.numero || null,
          complemento: enderecoObj.complemento || null,
          bairro: enderecoObj.bairro || null,
          cidade: enderecoObj.cidade || null,
          estado: enderecoObj.estado || null,
          latitude: enderecoObj.latitude || null,
          longitude: enderecoObj.longitude || null
        };

        if (existingEndereco && existingEndereco.id) {
          const { error } = await supabase.from('enderecos').update(payload).eq('id', existingEndereco.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('enderecos').insert([payload]);
          if (error) throw error;
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Erro em atualizarDadosOng:', err);
    throw err;
  }
}

/**
 * Excluir usuário e dependências (delegates to minhaContaEmpresaModel.excluirUsuario)
 * @param {number} usuarioId
 * @param {'ong'|'empresa'} tipo
 */
export async function excluirUsuario(usuarioId, tipo) {
  return EmpresaModel.excluirUsuario(usuarioId, tipo);
}
