import * as MinhaContaModel from '../model/minhaContaEmpresaModel.js';

export async function getUsuario(req, res) {
  try {
    const usuarioId = req.usuario && req.usuario.id;
    const tipo = req.usuario && req.usuario.tipo;
    if (!usuarioId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

    const dados = await MinhaContaModel.buscarUsuarioPorId(usuarioId, tipo);
    if (!dados) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    // Mapear resposta para o formato que o frontend espera
    const usuario = dados.usuario || {};
    const responsavel = dados.responsavel || {};
    const enderecos = dados.enderecos || [];

    const enderecoStr = enderecos.length > 0 ? (enderecos[0].logradouro || '') : '';

    if (tipo === 'empresa') {
      const empresa = dados.empresa || {};
      const responseData = {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        telefone: usuario.telefone,

        nome_fantasia: empresa.nome_fantasia || '',
        razao_social: empresa.razao_social || '',
        cnpj: empresa.cnpj || '',
        email_institucional: empresa.email_institucional || '',

        nome_responsavel_empresa: responsavel.nome_completo || '',
        cpf_responsavel_empresa: responsavel.cpf || '',
        cargo_responsavel_empresa: responsavel.cargo || '',
        email_responsavel_empresa: responsavel.email || '',
        telefone_responsavel_empresa: responsavel.telefone || '',

        endereco: enderecoStr
      };

      return res.json({ success: true, data: responseData });
    }

    // tipo ong
    if (tipo === 'ong') {
      const ong = dados.ong || {};
      const responseData = {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        telefone: usuario.telefone,

        nome_ong: ong.nome_ong || '',
        cnpj: ong.cnpj || '',
        email_institucional: ong.email_institucional || '',

        nome_responsavel_ong: responsavel.nome_completo || '',
        cpf_responsavel_ong: responsavel.cpf || '',
        cargo_responsavel_ong: responsavel.cargo || '',
        email_responsavel_ong: responsavel.email || '',
        telefone_responsavel_ong: responsavel.telefone || '',

        endereco: enderecoStr
      };

      return res.json({ success: true, data: responseData });
    }

    return res.status(400).json({ success: false, message: 'Tipo de usuário desconhecido' });

  } catch (err) {
    console.error('Erro em getUsuario controller:', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
}

export async function putResponsavel(req, res) {
  try {
    const usuarioId = req.usuario && req.usuario.id;
    if (!usuarioId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

    await MinhaContaModel.atualizarResponsavel(usuarioId, req.body);
    return res.json({ success: true, message: 'Responsável atualizado com sucesso' });
  } catch (err) {
    console.error('Erro em putResponsavel controller:', err);
    return res.status(500).json({ success: false, message: err.message || 'Erro interno' });
  }
}

export async function putEmpresa(req, res) {
  try {
    const usuarioId = req.usuario && req.usuario.id;
    const tipo = req.usuario && req.usuario.tipo;
    if (!usuarioId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    if (tipo !== 'empresa') return res.status(403).json({ success: false, message: 'Somente empresas podem acessar este endpoint' });

    await MinhaContaModel.atualizarDadosEmpresa(usuarioId, req.body);
    return res.json({ success: true, message: 'Dados da empresa atualizados com sucesso' });
  } catch (err) {
    console.error('Erro em putEmpresa controller:', err);
    return res.status(500).json({ success: false, message: err.message || 'Erro interno' });
  }
}

export async function putOng(req, res) {
  try {
    const usuarioId = req.usuario && req.usuario.id;
    const tipo = req.usuario && req.usuario.tipo;
    if (!usuarioId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    if (tipo !== 'ong') return res.status(403).json({ success: false, message: 'Somente ONGs podem acessar este endpoint' });

    await MinhaContaModel.atualizarDadosOng(usuarioId, req.body);
    return res.json({ success: true, message: 'Dados da ONG atualizados com sucesso' });
  } catch (err) {
    console.error('Erro em putOng controller:', err);
    return res.status(500).json({ success: false, message: err.message || 'Erro interno' });
  }
}
