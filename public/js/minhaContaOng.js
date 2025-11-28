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
    window.dadosOng = dados;

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
      return [addr, localStr].filter(Boolean).join(' | ');
    }

    document.getElementById("nomeResponsavel").textContent = dados.nome_responsavel_ong || "Não informado";
    document.getElementById("cargoResponsavel").textContent = dados.cargo_responsavel_ong || "Não informado";
    document.getElementById("cpfResponsavel").textContent = dados.cpf_responsavel_ong || "Não informado";
    document.getElementById("emailResponsavel").textContent = dados.email_responsavel_ong || "Não informado";
    document.getElementById("telefoneResponsavel").textContent = dados.telefone_responsavel_ong || "Não informado";

    // --- Dados da ONG ---
    document.getElementById("nomeOng").textContent = dados.nome || "Não informado";
    document.getElementById("cnpjOng").textContent = dados.cnpj || "Não informado";
    // Removido campo área de atuação
    document.getElementById("cepOng").textContent = dados.cep || "Não informado";
  // Endereço e CEP: dados.endereco pode ser string (legacy) ou objeto
  const enderecoStr = typeof dados.endereco === 'string' ? dados.endereco : formatEndereco(dados.endereco);
  document.getElementById("enderecoOng").textContent = enderecoStr || "Não informado";
  document.getElementById("cepOng").textContent = (dados.endereco && dados.endereco.cep) || dados.cep || "Não informado";
  document.getElementById("emailOng").textContent = dados.email || "Não informado";
  document.getElementById("telefoneOng").textContent = dados.telefone || "Não informado";

    // --- Segurança / login ---
    document.getElementById("emailLogin").textContent = dados.email || "Não informado";

  } catch (erro) {
    console.error("Erro ao buscar dados da ONG:", erro);
  }
});


// --- Seletores principais do modal ---
const modal = document.getElementById("modal-edicao");
const modalTitulo = document.getElementById("modal-titulo");
const formEdicao = document.getElementById("form-edicao");
const btnFechar = document.querySelector(".close");
const btnCancelar = document.getElementById("cancelar-edicao");
const btnSalvar = document.getElementById("salvar-edicao");

// Fechar modal
btnFechar.addEventListener("click", () => (modal.style.display = "none"));
btnCancelar.addEventListener("click", () => (modal.style.display = "none"));

// --- Helpers: máscaras e validações (mesmas que em minhaContaEmpresa) ---
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
  // Padrão brasileiro: (XX)XXXXX-XXXX ou (XX)XXXX-XXXX
  if (d.length === 11) {
    // Celular: 11 dígitos, começa com 9
    return /^\d{2}9\d{8}$/.test(d);
  }
  if (d.length === 10) {
    // Fixo: 10 dígitos, começa com 2-8
    return /^\d{2}[2-8]\d{7}$/.test(d);
  }
  return false;
}
function validatePassword(pw) {
  if (!pw) return true; // optional
  return pw.length >= 6;
}

document.getElementById("editar-responsavel").addEventListener("click", () => {
  // Formatação ao digitar telefone do responsável
  setTimeout(() => {
    const telInput = document.getElementById('telefoneResponsavel-editar');
    if (telInput) {
      telInput.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
      });
      telInput.value = maskPhone(telInput.value);
    }
  }, 100);
  const dados = window.dadosOng;

  modalTitulo.textContent = "Editar Informações do Responsável";
  formEdicao.innerHTML = `
    <label>Nome:</label>
    <input type="text" id="nomeResponsavel-editar" value="${dados.nome_responsavel_ong || ""}" required>

    <label>CPF:</label>
    <input type="text" id="cpfResponsavel-editar" value="${dados.cpf_responsavel_ong || ""}" required>

    <label>Cargo:</label>
    <input type="text" id="cargoResponsavel-editar" value="${dados.cargo_responsavel_ong || ""}" required>

    <label>Email:</label>
    <input type="email" id="emailResponsavel-editar" value="${dados.email_responsavel_ong || ""}" required>

    <label>Telefone:</label>
    <input type="text" id="telefoneResponsavel-editar" value="${dados.telefone_responsavel_ong || ""}" required>
  `;

  modal.style.display = "flex";
  // Attach masks and CEP autocomplete
  const cepInpO = document.getElementById('cepOng-editar');
  const telInpO = document.getElementById('telefoneOng-editar');
  if (cepInpO) cepInpO.addEventListener('input', () => { cepInpO.value = maskCEP(cepInpO.value); });
  if (telInpO) telInpO.addEventListener('input', () => { telInpO.value = maskPhone(telInpO.value); });

  async function buscarCepOng(cepRaw) {
  const cep = onlyDigits(cepRaw);
    if (cep.length !== 8) return;
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if (data && !data.erro) {
        if (document.getElementById('logradouroOng-editar')) document.getElementById('logradouroOng-editar').value = data.logradouro || '';
        if (document.getElementById('bairroOng-editar')) document.getElementById('bairroOng-editar').value = data.bairro || '';
        if (document.getElementById('cidadeOng-editar')) document.getElementById('cidadeOng-editar').value = data.localidade || '';
        if (document.getElementById('estadoOng-editar')) document.getElementById('estadoOng-editar').value = data.uf || '';
      }
    } catch (e) {
      console.error('Erro ao buscar CEP (ONG):', e);
    }
  }
  if (cepInpO) cepInpO.addEventListener('blur', () => buscarCepOng(cepInpO.value));

  // Salvar alterações
  btnSalvar.onclick = async () => {
    const nomeEl = document.getElementById("nomeResponsavel-editar");
    const cpfEl = document.getElementById("cpfResponsavel-editar");
    const cargoEl = document.getElementById("cargoResponsavel-editar");
    const emailEl = document.getElementById("emailResponsavel-editar");
    const telEl = document.getElementById("telefoneResponsavel-editar");
    const payload = {
      nome_responsavel_ong: nomeEl ? nomeEl.value : "",
      cpf_responsavel_ong: cpfEl ? cpfEl.value : "",
      cargo_responsavel_ong: cargoEl ? cargoEl.value : "",
      email_responsavel_ong: emailEl ? emailEl.value : "",
      telefone_responsavel_ong: telEl ? telEl.value : ""
    };

    // validações básicas
    if (!validateEmail(payload.email_responsavel_ong)) {
      alert('E-mail do responsável inválido.');
      return;
    }
    if (!validatePhone(payload.telefone_responsavel_ong)) {
      alert('Telefone do responsável inválido. Use o padrão brasileiro: (XX)XXXXX-XXXX para celular ou (XX)XXXX-XXXX para fixo.');
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
    <input type="password" id="senha-atual-ong" required>

    <label>Nova senha:</label>
    <input type="password" id="nova-senha-ong" required>

    <label>Confirme nova senha:</label>
    <input type="password" id="confirma-nova-senha-ong" required>
  `;
  modal.style.display = 'flex';

  btnSalvar.onclick = async () => {
    const atual = document.getElementById('senha-atual-ong').value;
    const nova = document.getElementById('nova-senha-ong').value;
    const conf = document.getElementById('confirma-nova-senha-ong').value;
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
      console.error('Erro ao alterar senha (ONG):', e);
      alert('Erro ao alterar senha.');
    }
  };
});


document.getElementById("atualizar-dados-ong").addEventListener("click", () => {
  // Formatação ao digitar telefone
  setTimeout(() => {
    const telInput = document.getElementById('telefoneOng-editar');
    if (telInput) {
      telInput.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
      });
      telInput.value = maskPhone(telInput.value);
    }
  }, 100);
  const dados = window.dadosOng;

  modalTitulo.textContent = "Atualizar Dados da ONG";
  formEdicao.innerHTML = `
    <label>Nome da ONG:</label>
    <input type="text" id="nomeOng-editar" value="${dados.nome || ""}" required>

    <label>CNPJ:</label>
    <input type="text" id="cnpjOng-editar" value="${dados.cnpj || ""}" required>

  <!-- Campo área de atuação removido -->

    <label>CEP:</label>
    <input type="text" id="cepOng-editar" value="${(dados.endereco && dados.endereco.cep) || ""}">

    <label>Logradouro:</label>
    <input type="text" id="logradouroOng-editar" value="${(dados.endereco && dados.endereco.logradouro) || ""}">

    <label>Número:</label>
    <input type="text" id="numeroOng-editar" value="${(dados.endereco && dados.endereco.numero) || ""}">

    <label>Complemento:</label>
    <input type="text" id="complementoOng-editar" value="${(dados.endereco && dados.endereco.complemento) || ""}">

    <label>Bairro:</label>
    <input type="text" id="bairroOng-editar" value="${(dados.endereco && dados.endereco.bairro) || ""}">

    <label>Cidade:</label>
    <input type="text" id="cidadeOng-editar" value="${(dados.endereco && dados.endereco.cidade) || ""}">

    <label>Estado:</label>
    <input type="text" id="estadoOng-editar" value="${(dados.endereco && dados.endereco.estado) || ""}">

    <label>E-mail de Contato:</label>
    <input type="email" id="emailOng-editar" value="${dados.email || ""}" required>

    <label>Telefone de Contato:</label>
    <input type="text" id="telefoneOng-editar" value="${dados.telefone || ""}" required>

  `;

  modal.style.display = "flex";

  // Salvar alterações
  btnSalvar.onclick = async () => {
    const nomeEl = document.getElementById("nomeOng-editar");
    const cnpjEl = document.getElementById("cnpjOng-editar");
    const cepEl = document.getElementById("cepOng-editar");
    const logradouroEl = document.getElementById("logradouroOng-editar");
    const numeroEl = document.getElementById("numeroOng-editar");
    const complementoEl = document.getElementById("complementoOng-editar");
    const bairroEl = document.getElementById("bairroOng-editar");
    const cidadeEl = document.getElementById("cidadeOng-editar");
    const estadoEl = document.getElementById("estadoOng-editar");
    const emailEl = document.getElementById("emailOng-editar");
    const telefoneEl = document.getElementById("telefoneOng-editar");
    const senhaEl = document.getElementById("senhaOng-editar");

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

    // Attach masks (in case user typed) and validations
    const cepInput = document.getElementById('cepOng-editar');
    const telInput = document.getElementById('telefoneOng-editar');
    if (cepInput) cepInput.value = maskCEP(cepInput.value);
    if (telInput) telInput.value = maskPhone(telInput.value);

    if (!validateEmail(payload.email)) {
      alert('E-mail inválido.');
      return;
    }
    if (enderecoObj.cep && !validateCEP(enderecoObj.cep)) {
      alert('CEP inválido. Informe 8 dígitos.');
      return;
    }
    if (!validatePhone(payload.telefone)) {
      alert('Telefone inválido. Informe DDD + número (10 ou 11 dígitos).');
      return;
    }
    if (!validatePassword(novaSenha)) {
      alert('Senha muito curta. Use ao menos 6 caracteres.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ong", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resposta = await res.json();

      if (resposta.success) {
        alert("Dados da ONG atualizados com sucesso!");
        modal.style.display = "none";
        location.reload();
      } else {
        alert("Erro ao atualizar: " + resposta.message);
      }
    } catch (erro) {
      console.error("Erro ao atualizar dados da ONG:", erro);
      alert("Erro ao atualizar dados da ONG.");
    }
  };
});

// --- Excluir conta (ONG) ---
const btnExcluirOng = document.getElementById('excluir-conta');
if (btnExcluirOng) {
  btnExcluirOng.addEventListener('click', async () => {
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
