import { supabase } from "../config/supabaseClient.js";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Busca completo do usuário + relações (empresas/ongs, responsavel, enderecos)
export async function buscarUsuarioPorId(usuarioId, tipo) {
  try {
    const { data: usuario, error: usuarioErr } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .single();

    if (usuarioErr) {
      console.error('Erro ao buscar usuario:', usuarioErr);
      return null;
    }

    const result = { usuario };

    if (tipo === 'empresa') {
      const { data: empresa } = await supabase.from('empresas').select('*').eq('usuario_id', usuarioId).maybeSingle();
      const { data: responsavel } = await supabase.from('responsaveis').select('*').eq('usuario_id', usuarioId).maybeSingle();
      const { data: enderecos } = await supabase.from('enderecos').select('*').eq('usuario_id', usuarioId);
      result.empresa = empresa || null;
      result.responsavel = responsavel || null;
      result.enderecos = enderecos || [];
    } else if (tipo === 'ong') {
      const { data: ong } = await supabase.from('ongs').select('*').eq('usuario_id', usuarioId).maybeSingle();
      const { data: responsavel } = await supabase.from('responsaveis').select('*').eq('usuario_id', usuarioId).maybeSingle();
      const { data: enderecos } = await supabase.from('enderecos').select('*').eq('usuario_id', usuarioId);
      result.ong = ong || null;
      result.responsavel = responsavel || null;
      result.enderecos = enderecos || [];
    }

    return result;
  } catch (err) {
    console.error('Erro em buscarUsuarioPorId:', err);
    return null;
  }
}

// Atualiza ou cria o registro de responsável para um usuário (empresa ou ong)
export async function atualizarResponsavel(usuarioId, novosDados) {
  try {
    const { data: responsavel } = await supabase.from('responsaveis').select('*').eq('usuario_id', usuarioId).maybeSingle();

    const payload = {
      nome_completo: novosDados.nome_responsavel_empresa || novosDados.nome_responsavel_ong || novosDados.nome || novosDados.nome_completo || null,
      cpf: novosDados.cpf_responsavel_empresa || novosDados.cpf_responsavel_ong || novosDados.cpf || null,
      cargo: novosDados.cargo_responsavel_empresa || novosDados.cargo_responsavel_ong || novosDados.cargo || null,
      email: novosDados.email_responsavel_empresa || novosDados.email_responsavel_ong || novosDados.email || null,
      telefone: novosDados.telefone_responsavel_empresa || novosDados.telefone_responsavel_ong || novosDados.telefone || null,
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
    console.error('Erro ao atualizar/criar responsavel:', err);
    throw err;
  }
}

// Atualiza dados da empresa (tabela empresas + usuarios + enderecos)
export async function atualizarDadosEmpresa(usuarioId, dados) {
  try {
    // Atualiza a tabela empresas por usuario_id
    const updateEmpresa = {};
    if (dados.cnpj !== undefined) updateEmpresa.cnpj = dados.cnpj;
    if (dados.nome !== undefined) {
      updateEmpresa.nome_fantasia = dados.nome;
      updateEmpresa.razao_social = dados.nome;
    }
    if (dados.email !== undefined) updateEmpresa.email_institucional = dados.email;
    if (dados.descricao !== undefined) updateEmpresa.descricao = dados.descricao;
    if (dados.site_url !== undefined) updateEmpresa.site_url = dados.site_url;
    if (dados.ramo_atuacao !== undefined) updateEmpresa.ramo_atuacao = dados.ramo_atuacao;

    if (Object.keys(updateEmpresa).length > 0) {
      const { error } = await supabase.from('empresas').update(updateEmpresa).eq('usuario_id', usuarioId);
      if (error) {
        console.error('Erro ao atualizar empresas:', error);
        throw error;
      }
    }

    // Atualiza tabela usuarios
    const updateUsuario = {};
    if (dados.email !== undefined) updateUsuario.email = dados.email;
    if (dados.nome !== undefined) updateUsuario.nome = dados.nome;
    if (dados.telefone !== undefined) updateUsuario.telefone = dados.telefone;

    // Accept plain password `senha` (will be hashed) or already-hashed `senha_hash`.
    if (dados.senha !== undefined) {
      const hash = await bcrypt.hash(String(dados.senha), SALT_ROUNDS);
      updateUsuario.senha_hash = hash;
    } else if (dados.senha_hash !== undefined) {
      updateUsuario.senha_hash = dados.senha_hash;
    }

    if (Object.keys(updateUsuario).length > 0) {
      const { error } = await supabase.from('usuarios').update(updateUsuario).eq('id', usuarioId);
      if (error) {
        console.error('Erro ao atualizar usuarios:', error);
        throw error;
      }
    }

    // Endereço: aceita objeto estruturado ou string simples
    if (dados.endereco !== undefined) {
      const endereco = dados.endereco;
      const { data: existingEndereco } = await supabase.from('enderecos').select('*').eq('usuario_id', usuarioId).limit(1).maybeSingle();

      if (typeof endereco === 'string') {
        if (existingEndereco && existingEndereco.id) {
          const { error } = await supabase.from('enderecos').update({ logradouro: endereco }).eq('id', existingEndereco.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('enderecos').insert([{ usuario_id: usuarioId, logradouro: endereco }]);
          if (error) throw error;
        }
      } else if (typeof endereco === 'object' && endereco !== null) {
        const payload = {
          usuario_id: usuarioId,
          cep: endereco.cep || null,
          logradouro: endereco.logradouro || null,
          numero: endereco.numero || null,
          complemento: endereco.complemento || null,
          bairro: endereco.bairro || null,
          cidade: endereco.cidade || null,
          estado: endereco.estado || null,
          latitude: endereco.latitude || null,
          longitude: endereco.longitude || null
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
    console.error('Erro em atualizarDadosEmpresa:', err);
    throw err;
  }
}

// Atualiza dados de ONG (tabela ongs + usuarios + enderecos)
export async function atualizarDadosOng(usuarioId, dados) {
  try {
    const updateOng = {};
    if (dados.cnpj !== undefined) updateOng.cnpj = dados.cnpj;
    if (dados.nome !== undefined) updateOng.nome_ong = dados.nome;
    if (dados.email !== undefined) updateOng.email_institucional = dados.email;
    if (dados.area_atuacao !== undefined) updateOng.area_atuacao = dados.area_atuacao;

    if (Object.keys(updateOng).length > 0) {
      const { error } = await supabase.from('ongs').update(updateOng).eq('usuario_id', usuarioId);
      if (error) throw error;
    }

    const updateUsuario = {};
    if (dados.email !== undefined) updateUsuario.email = dados.email;
    if (dados.nome !== undefined) updateUsuario.nome = dados.nome;
    if (dados.telefone !== undefined) updateUsuario.telefone = dados.telefone;

    // Accept plain password `senha` (will be hashed) or already-hashed `senha_hash`.
    if (dados.senha !== undefined) {
      const hash = await bcrypt.hash(String(dados.senha), SALT_ROUNDS);
      updateUsuario.senha_hash = hash;
    } else if (dados.senha_hash !== undefined) {
      updateUsuario.senha_hash = dados.senha_hash;
    }

    if (Object.keys(updateUsuario).length > 0) {
      const { error } = await supabase.from('usuarios').update(updateUsuario).eq('id', usuarioId);
      if (error) throw error;
    }

    // Endereco
    if (dados.endereco !== undefined) {
      const endereco = dados.endereco;
      const { data: existingEndereco } = await supabase.from('enderecos').select('*').eq('usuario_id', usuarioId).limit(1).maybeSingle();

      if (typeof endereco === 'string') {
        if (existingEndereco && existingEndereco.id) {
          const { error } = await supabase.from('enderecos').update({ logradouro: endereco }).eq('id', existingEndereco.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('enderecos').insert([{ usuario_id: usuarioId, logradouro: endereco }]);
          if (error) throw error;
        }
      } else if (typeof endereco === 'object' && endereco !== null) {
        const payload = {
          usuario_id: usuarioId,
          cep: endereco.cep || null,
          logradouro: endereco.logradouro || null,
          numero: endereco.numero || null,
          complemento: endereco.complemento || null,
          bairro: endereco.bairro || null,
          cidade: endereco.cidade || null,
          estado: endereco.estado || null,
          latitude: endereco.latitude || null,
          longitude: endereco.longitude || null
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

// Alterar senha: verifica senha atual e atualiza com novo hash
export async function alterarSenha(usuarioId, senhaAtual, novaSenha) {
  try {
    if (!senhaAtual || !novaSenha) throw new Error('Senha atual e nova são obrigatórias.');

    const { data: usuario, error: usuarioErr } = await supabase.from('usuarios').select('senha_hash').eq('id', usuarioId).maybeSingle();
    if (usuarioErr) {
      console.error('Erro ao buscar usuario para alterar senha:', usuarioErr);
      throw new Error('Erro ao verificar usuário.');
    }
    if (!usuario) throw new Error('Usuário não encontrado.');

    const senhaHash = usuario.senha_hash;
    const match = await bcrypt.compare(String(senhaAtual), String(senhaHash || ''));
    if (!match) throw new Error('Senha atual incorreta.');

    const novoHash = await bcrypt.hash(String(novaSenha), SALT_ROUNDS);
    const { error: updateErr } = await supabase.from('usuarios').update({ senha_hash: novoHash }).eq('id', usuarioId);
    if (updateErr) {
      console.error('Erro ao atualizar senha:', updateErr);
      throw new Error('Erro ao atualizar senha.');
    }

    return true;
  } catch (err) {
    console.error('Erro em alterarSenha:', err);
    throw err;
  }
}
