import * as OngModel from '../model/minhaContaOngModel.js';

// GET /api/usuario (ong)
export async function getOngCompleta(req, res) {
  try {
    const { id, tipo } = req.usuario;
    if (!id || tipo !== 'ong') return res.status(400).json({ success: false, message: 'Token inválido ou tipo incorreto.' });
    const dados = await OngModel.buscarUsuarioPorId(id, tipo);
    if (!dados) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    // Flatten para o frontend
    const usuario = dados.usuario || {};
    const ong = dados.ong || {};
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
        nome_ong: ong.nome_ong,
        cnpj: ong.cnpj,
        email_institucional: ong.email_institucional,
        area_atuacao: ong.area_atuacao,
        nome_responsavel_ong: responsavel.nome_completo,
        cpf_responsavel_ong: responsavel.cpf,
        cargo_responsavel_ong: responsavel.cargo,
        email_responsavel_ong: responsavel.email,
        telefone_responsavel_ong: responsavel.telefone,
        endereco: endereco // objeto completo
      }
    });
  } catch (err) {
    console.error('Erro no getOngCompleta:', err);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
}

// PUT /api/usuario (atualiza responsável)
export async function putResponsavelOng(req, res) {
  try {
    const usuarioId = req.usuario.id;
    await OngModel.atualizarResponsavel(usuarioId, req.body);
    res.status(200).json({ success: true, message: 'Dados do responsável atualizados com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar responsável ONG:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}

// PUT /api/ong (atualiza dados da ONG)
export async function putDadosOng(req, res) {
  try {
    const usuarioId = req.usuario.id;
    await OngModel.atualizarDadosOng(usuarioId, req.body);
    res.status(200).json({ success: true, message: 'Dados da ONG atualizados com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar ONG:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}

// PUT /api/usuario/senha -> alterar senha para ONG
export async function putAlterarSenha(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) return res.status(400).json({ success: false, message: 'Senha atual e nova são obrigatórias.' });
    await OngModel.alterarSenha(usuarioId, senha_atual, nova_senha);
    res.status(200).json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Erro ao alterar senha (ONG):', err);
    res.status(400).json({ success: false, message: err.message || 'Erro ao alterar senha.' });
  }
}

// DELETE /api/usuario -> excluir conta (ong)
export async function deleteConta(req, res) {
  try {
    const usuarioId = req.usuario.id;
    await OngModel.excluirUsuario(usuarioId, 'ong');
    return res.json({ success: true, message: 'Conta excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir conta (ong):', err);
    return res.status(500).json({ success: false, message: err.message || 'Erro ao excluir conta.' });
  }
}
