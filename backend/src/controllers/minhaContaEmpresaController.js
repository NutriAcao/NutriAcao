import * as EmpresaModel from '../model/minhaContaEmpresaModel.js';

// GET /api/usuario (empresa)
export async function getEmpresaCompleta(req, res) {
  try {
    const { id, tipo } = req.usuario;
    if (!id || tipo !== 'empresa') return res.status(400).json({ success: false, message: 'Token inválido ou tipo incorreto.' });
    const dados = await EmpresaModel.buscarUsuarioPorId(id, tipo);
    if (!dados) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    // Flatten para o frontend
    const usuario = dados.usuario || {};
    const empresa = dados.empresa || {};
    const responsavel = dados.responsavel || {};
    const enderecos = dados.enderecos || [];
    const endereco = enderecos.length > 0 ? enderecos[0] : {};
    res.json({
      success: true,
      data: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        telefone: usuario.telefone,
        nome_fantasia: empresa.nome_fantasia,
        razao_social: empresa.razao_social,
        cnpj: empresa.cnpj,
        email_institucional: empresa.email_institucional,
        descricao: empresa.descricao,
        site_url: empresa.site_url,
        ramo_atuacao: empresa.ramo_atuacao,
        nome_responsavel_empresa: responsavel.nome_completo,
        cpf_responsavel_empresa: responsavel.cpf,
        cargo_responsavel_empresa: responsavel.cargo,
        email_responsavel_empresa: responsavel.email,
        telefone_responsavel_empresa: responsavel.telefone,
        endereco: endereco // objeto completo
      }
    });
  } catch (err) {
    console.error('Erro no getEmpresaCompleta:', err);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
}

// PUT /api/usuario (atualiza responsável)
export async function putResponsavelEmpresa(req, res) {
  try {
    const usuarioId = req.usuario.id;
    await EmpresaModel.atualizarResponsavel(usuarioId, req.body);
    res.status(200).json({ success: true, message: 'Dados do responsável atualizados com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar responsável empresa:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}

// PUT /api/empresa (atualiza dados da empresa)
export async function putDadosEmpresa(req, res) {
  try {
    const usuarioId = req.usuario.id;
    await EmpresaModel.atualizarDadosEmpresa(usuarioId, req.body);
    res.status(200).json({ success: true, message: 'Dados da empresa atualizados com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar empresa:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}

// PUT /api/usuario/senha -> alterar senha
export async function putAlterarSenha(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) return res.status(400).json({ success: false, message: 'Senha atual e nova são obrigatórias.' });
    await EmpresaModel.alterarSenha(usuarioId, senha_atual, nova_senha);
    res.status(200).json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Erro ao alterar senha (empresa):', err);
    res.status(400).json({ success: false, message: err.message || 'Erro ao alterar senha.' });
  }
}

// DELETE /api/usuario -> excluir conta (empresa)
export async function deleteConta(req, res) {
  try {
    const usuarioId = req.usuario.id;
    await EmpresaModel.excluirUsuario(usuarioId, 'empresa');
    return res.json({ success: true, message: 'Conta excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir conta (empresa):', err);
    return res.status(500).json({ success: false, message: err.message || 'Erro ao excluir conta.' });
  }
}
