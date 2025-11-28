document.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/usuario", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const resposta = await res.json();

    if (!resposta.success) {
      alert("Erro: " + resposta.message);
      return;
    }

    const dados = resposta.data;
    window.dadosEmpresa = dados; // Armazena para uso posterior

    function formatEndereco(endereco) {
      if (!endereco) return null;
      const parts = [];
      if (endereco.logradouro) parts.push(endereco.logradouro);
      if (endereco.numero) parts.push(endereco.numero);
      if (endereco.complemento) parts.push(endereco.complemento);
      const local = [];
      if (endereco.bairro) local.push(endereco.bairro);
      if (endereco.cidade) local.push(endereco.cidade);
      if (endereco.estado) local.push(endereco.estado);
      const addr = parts.join(', ');
      const localStr = local.join(' - ');
      const cep = endereco.cep ? `CEP ${endereco.cep}` : '';
      return [addr, localStr, cep].filter(Boolean).join(' | ');
    }

    // Dados do responsável
    document.getElementById("nome").textContent = dados.nome_responsavel_empresa || "Não informado";
    document.getElementById("cargo").textContent = dados.cargo_responsavel_empresa || "Não informado";
    document.getElementById("cpf").textContent = dados.cpf_responsavel_empresa || "Não informado";
    document.getElementById("emailResp").textContent = dados.email_responsavel_empresa || "Não informado";
    document.getElementById("telefone").textContent = dados.telefone_responsavel_empresa || "Não informado";

    // Dados da empresa
    document.getElementById("nomeEmpresa").textContent = dados.nome || "Não informado";
    document.getElementById("cnpj").textContent = dados.cnpj || "Não informado";
  // Endereço: pode ser string (legacy) ou objeto
  const enderecoFormatado = typeof dados.endereco === 'string' ? dados.endereco : formatEndereco(dados.endereco);
  document.getElementById("enderecoEmpresa").textContent = enderecoFormatado || "Não informado";
    document.getElementById("emailContato").textContent = dados.email || "Não informado";
    document.getElementById("telefoneComercial").textContent = dados.telefone || "Não informado";

    // Dados de segurança / login
    document.getElementById("email").textContent = dados.email || "Não informado";

  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
});

// --- Helpers: máscaras e validações ---
function onlyDigits(s) { return (s || '').replace(/\D+/g, ''); }
function maskCEP(v) {
  const d = onlyDigits(v).slice(0,8);
  if (d.length <= 5) return d;
  return d.slice(0,5) + '-' + d.slice(5);
}
function maskPhone(v) {
  const d = onlyDigits(v).slice(0,11);
  if (d.length <= 2) return d;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`; // fixo
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; // celular
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return v;
}
function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateCEP(cep) {
  if (!cep) return false;
  const d = onlyDigits(cep);
  return d.length === 8;
}
function validatePhone(phone) {
  if (!phone) return false;
  const d = onlyDigits(phone);
  return d.length === 10 || d.length === 11;
}
function validatePassword(pw) {
  if (!pw) return true; // optional
  return pw.length >= 6;
}


const modal = document.getElementById("modal-edicao");
const modalTitulo = document.getElementById("modal-titulo");
const formEdicao = document.getElementById("form-edicao");
const btnFechar = document.querySelector(".close");
const btnCancelar = document.getElementById("cancelar-edicao");
const btnSalvar = document.getElementById("salvar-edicao");

// Fechar modal
btnFechar.addEventListener("click", () => (modal.style.display = "none"));
btnCancelar.addEventListener("click", () => (modal.style.display = "none"));

document.getElementById("editar-informacoes").addEventListener("click", () => {
  // Formatação ao digitar telefone do responsável
  setTimeout(() => {
    const telInput = document.getElementById('telefone-editar');
    if (telInput) {
      telInput.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
      });
      telInput.value = maskPhone(telInput.value);
    }
  }, 100);
  const dados = window.dadosEmpresa;

  modalTitulo.textContent = "Editar Informações do Responsável";
  formEdicao.innerHTML = `
    <label>Nome:</label>
    <input type="text" id="nome-editar" value="${dados.nome_responsavel_empresa || ""}" required>

    <label>CPF:</label>
    <input type="text" id="cpf-editar" value="${dados.cpf_responsavel_empresa || ""}" required>

    <label>Cargo:</label>
    <input type="text" id="cargo-editar" value="${dados.cargo_responsavel_empresa || ""}" required>

    <label>Email:</label>
    <input type="email" id="emailResp-editar" value="${dados.email_responsavel_empresa || ""}" required>

    <label>Telefone:</label>
    <input type="text" id="telefone-editar" value="${dados.telefone_responsavel_empresa || ""}" required>
  `;

  modal.style.display = "flex";

  // Salvar alterações
  btnSalvar.onclick = async () => {
    const nomeEl = document.getElementById("nome-editar");
    const cpfEl = document.getElementById("cpf-editar");
    const cargoEl = document.getElementById("cargo-editar");
    const emailEl = document.getElementById("emailResp-editar");
    const telEl = document.getElementById("telefone-editar");
    const payload = {
      nome_responsavel_empresa: nomeEl ? nomeEl.value : "",
      cpf_responsavel_empresa: cpfEl ? cpfEl.value : "",
      cargo_responsavel_empresa: cargoEl ? cargoEl.value : "",
      email_responsavel_empresa: emailEl ? emailEl.value : "",
      telefone_responsavel_empresa: telEl ? telEl.value : ""
    };

    // validações básicas
    if (!validateEmail(payload.email_responsavel_empresa)) {
      alert('E-mail do responsável inválido.');
      return;
    }
    if (!validatePhone(payload.telefone_responsavel_empresa)) {
      alert('Telefone do responsável inválido. Informe DDD + número (10 ou 11 dígitos).');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/usuario", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resposta = await res.json();

      if (resposta.success) {
        alert("Informações do responsável atualizadas com sucesso!");
        modal.style.display = "none";
        location.reload();
      } else {
        alert("Erro ao atualizar: " + resposta.message);
      }
    } catch (erro) {
      console.error("Erro ao salvar alterações:", erro);
      alert("Erro ao atualizar informações do responsável.");
    }
  };
});

// Modal de alterar senha (Segurança)
document.getElementById('alterar-senha')?.addEventListener('click', () => {
  modalTitulo.textContent = 'Alterar senha';
  formEdicao.innerHTML = `
    <label>Senha atual:</label>
    <input type="password" id="senha-atual" required>

    <label>Nova senha:</label>
    <input type="password" id="nova-senha" required>

    <label>Confirme nova senha:</label>
    <input type="password" id="confirma-nova-senha" required>
  `;
  modal.style.display = 'flex';

  btnSalvar.onclick = async () => {
    const atual = document.getElementById('senha-atual').value;
    const nova = document.getElementById('nova-senha').value;
    const conf = document.getElementById('confirma-nova-senha').value;
    if (!atual || !nova || !conf) { alert('Preencha todos os campos.'); return; }
    if (nova !== conf) { alert('Nova senha e confirmação não conferem.'); return; }
    if (!validatePassword(nova)) { alert('Senha muito curta. Use ao menos 6 caracteres.'); return; }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/usuario/senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ senha_atual: atual, nova_senha: nova })
      });
      const j = await res.json();
      if (j.success) {
        alert('Senha alterada com sucesso.');
        modal.style.display = 'none';
      } else {
        alert('Erro: ' + (j.message || 'Não foi possível alterar a senha.'));
      }
    } catch (e) {
      console.error('Erro ao alterar senha:', e);
      alert('Erro ao alterar senha.');
    }
  };
});


document.getElementById("atualizar-contato").addEventListener("click", () => {
  // Formatação ao digitar telefone comercial
  setTimeout(() => {
    const telInput = document.getElementById('telefoneComercial-editar');
    if (telInput) {
      telInput.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
      });
      telInput.value = maskPhone(telInput.value);
    }
  }, 100);
  const dados = window.dadosEmpresa;

  modalTitulo.textContent = "Atualizar Dados de Contato da Empresa";
  formEdicao.innerHTML = `
    <label>Nome da Empresa:</label>
    <input type="text" id="nomeEmpresa-editar" value="${dados.nome || ""}" required>

    <label>CNPJ:</label>
    <input type="text" id="cnpj-editar" value="${dados.cnpj || ""}" required>

    <label>CEP:</label>
    <input type="text" id="cep-editar" value="${(dados.endereco && dados.endereco.cep) || ""}">

    <label>Logradouro:</label>
    <input type="text" id="logradouro-editar" value="${(dados.endereco && dados.endereco.logradouro) || ""}">

    <label>Número:</label>
    <input type="text" id="numero-editar" value="${(dados.endereco && dados.endereco.numero) || ""}">

    <label>Complemento:</label>
    <input type="text" id="complemento-editar" value="${(dados.endereco && dados.endereco.complemento) || ""}">

    <label>Bairro:</label>
    <input type="text" id="bairro-editar" value="${(dados.endereco && dados.endereco.bairro) || ""}">

    <label>Cidade:</label>
    <input type="text" id="cidade-editar" value="${(dados.endereco && dados.endereco.cidade) || ""}">

    <label>Estado:</label>
    <input type="text" id="estado-editar" value="${(dados.endereco && dados.endereco.estado) || ""}">

    <label>E-mail de Contato:</label>
    <input type="email" id="emailContato-editar" value="${dados.email || ""}" required>

    <label>Telefone Comercial:</label>
    <input type="text" id="telefoneComercial-editar" value="${dados.telefone || ""}" required>

  `;

  modal.style.display = "flex";
  // attach masks to CEP / telefone inputs
  const cepInp = document.getElementById('cep-editar');
  const telefoneComercialInp = document.getElementById('telefoneComercial-editar');
  const emailContatoInp = document.getElementById('emailContato-editar');
  const senhaInp = document.getElementById('senha-editar');

  if (cepInp) cepInp.addEventListener('input', () => { cepInp.value = maskCEP(cepInp.value); });
  if (telefoneComercialInp) telefoneComercialInp.addEventListener('input', () => { telefoneComercialInp.value = maskPhone(telefoneComercialInp.value); });

  // Autocomplete por CEP (ViaCEP)
  async function buscarCepEmpresa(cepRaw) {
    const cep = onlyDigits(cepRaw);
    if (cep.length !== 8) return;
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if (data && !data.erro) {
        if (document.getElementById('logradouro-editar')) document.getElementById('logradouro-editar').value = data.logradouro || '';
        if (document.getElementById('bairro-editar')) document.getElementById('bairro-editar').value = data.bairro || '';
        if (document.getElementById('cidade-editar')) document.getElementById('cidade-editar').value = data.localidade || '';
        if (document.getElementById('estado-editar')) document.getElementById('estado-editar').value = data.uf || '';
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
    }
  }
  if (cepInp) cepInp.addEventListener('blur', () => buscarCepEmpresa(cepInp.value));

  // Salvar alterações
  btnSalvar.onclick = async () => {
    const nomeEl = document.getElementById("nomeEmpresa-editar");
    const cnpjEl = document.getElementById("cnpj-editar");
    const cepEl = document.getElementById("cep-editar");
    const logradouroEl = document.getElementById("logradouro-editar");
    const numeroEl = document.getElementById("numero-editar");
    const complementoEl = document.getElementById("complemento-editar");
    const bairroEl = document.getElementById("bairro-editar");
    const cidadeEl = document.getElementById("cidade-editar");
    const estadoEl = document.getElementById("estado-editar");
    const emailEl = document.getElementById("emailContato-editar");
    const telefoneEl = document.getElementById("telefoneComercial-editar");
    const senhaEl = document.getElementById("senha-editar");

    const enderecoObj = {
      cep: cepEl ? cepEl.value : null,
      logradouro: logradouroEl ? logradouroEl.value : null,
      numero: numeroEl ? numeroEl.value : null,
      complemento: complementoEl ? complementoEl.value : null,
      bairro: bairroEl ? bairroEl.value : null,
      cidade: cidadeEl ? cidadeEl.value : null,
      estado: estadoEl ? estadoEl.value : null
    };

    const payload = {
      nome: nomeEl ? nomeEl.value : "",
      cnpj: cnpjEl ? cnpjEl.value : "",
      endereco: enderecoObj,
      email: emailEl ? emailEl.value : "",
      telefone: telefoneEl ? telefoneEl.value : ""
    };

    const novaSenha = senhaEl ? senhaEl.value : "";
    if (novaSenha && novaSenha.length > 0) payload.senha = novaSenha;

    // Validações
    if (!validateEmail(payload.email)) {
      alert('E-mail de contato inválido.');
      return;
    }
    if (enderecoObj.cep) {
      if (!validateCEP(enderecoObj.cep)) {
        alert('CEP inválido. Use o formato 00000-000 ou informe 8 dígitos.');
        return;
      }
    }
    if (!validatePhone(payload.telefone)) {
      alert('Telefone comercial inválido. Informe DDD + número (10 ou 11 dígitos).');
      return;
    }
    if (!validatePassword(novaSenha)) {
      alert('Senha muito curta. Utilize ao menos 6 caracteres.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resposta = await res.json();

      if (resposta.success) {
        alert("Dados da empresa atualizados com sucesso!");
        modal.style.display = "none";
        location.reload();
      } else {
        alert("Erro ao atualizar: " + resposta.message);
      }
    } catch (erro) {
      console.error("Erro ao atualizar dados da empresa:", erro);
      alert("Erro ao atualizar dados da empresa.");
    }
  };
});

// --- Excluir conta (empresa) ---
const btnExcluirEmpresa = document.getElementById('excluir-conta');
if (btnExcluirEmpresa) {
  btnExcluirEmpresa.addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/usuario', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) {
        localStorage.removeItem('token');
        window.location.href = '/loginpage';
      } else {
        alert('Erro ao excluir conta: ' + (j.message || 'Resposta inválida'));
      }
    } catch (e) {
      console.error('Erro ao chamar DELETE /api/usuario:', e);
      alert('Erro ao excluir conta. Veja o console para mais detalhes.');
    }
  });
}
