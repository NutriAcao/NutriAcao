document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/usuario", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const resposta = await res.json();
    console.log("Resposta completa:", resposta);

    if (!resposta.success) {
      alert("Erro: " + resposta.message);
      return;
    }

    const dados = resposta.data;

    // Preenche os dados na tela
    document.getElementById("email").textContent = dados.email;
    document.getElementById("nome").textContent = dados.nome_responsavel_empresa || "Não informado";
    document.getElementById("cpf").textContent = dados.cpf_responsavel_empresa || "Não informado";
    document.getElementById("cargo").textContent = dados.cargo_responsavel_empresa || "Não informado";
    document.getElementById("emailResp").textContent = dados.email_responsavel_empresa || "Não informado";
    document.getElementById("telefone").textContent = dados.telefone_responsavel_empresa || "Não informado";

    window.dadosEmpresa = dados;
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
});

// Elementos principais do modal
const modal = document.getElementById("modal-edicao");
const modalTitulo = document.getElementById("modal-titulo");
const formEdicao = document.getElementById("form-edicao");
const btnFechar = document.querySelector(".close");
const btnCancelar = document.getElementById("cancelar-edicao");
const btnSalvar = document.getElementById("salvar-edicao");

// Abrir modal ao clicar no botão
document.getElementById("editar-informacoes").addEventListener("click", () => {
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
});

// Fechar modal
btnFechar.addEventListener("click", () => modal.style.display = "none");
btnCancelar.addEventListener("click", () => modal.style.display = "none");

// Salvar alterações
btnSalvar.addEventListener("click", async () => {
  const payload = {
    nome_responsavel_empresa: document.getElementById("nome-editar").value,
    cpf_responsavel_empresa: document.getElementById("cpf-editar").value,
    cargo_responsavel_empresa: document.getElementById("cargo-editar").value,
    email_responsavel_empresa: document.getElementById("emailResp-editar").value,
    telefone_responsavel_empresa: document.getElementById("telefone-editar").value
  };

  try {
    const res = await fetch("/api/usuario", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resposta = await res.json();

    if (resposta.success) {
      alert("Informações atualizadas com sucesso!");
      modal.style.display = "none";
      location.reload();
    } else {
      alert("Erro ao atualizar: " + resposta.message);
    }
  } catch (erro) {
    console.error("Erro ao salvar alterações:", erro);
  }
});
