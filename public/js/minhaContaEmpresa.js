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

document.getElementById("atualizar-contato").addEventListener("click", async () => {
  const modal = document.getElementById("modal-edicao");
  const form = document.getElementById("form-edicao");
  const titulo = document.getElementById("modal-titulo");

  // muda o título
  titulo.textContent = "Atualizar Dados de Contato da Empresa";

  // conteúdo do formulário
  form.innerHTML = `
    <div class="form-group">
      <label for="email_responsavel_empresa">E-mail corporativo:</label>
      <input type="email" id="email_responsavel_empresa" name="email_responsavel_empresa" required>
    </div>
    <div class="form-group">
      <label for="telefone_responsavel_empresa">Telefone:</label>
      <input type="text" id="telefone_responsavel_empresa" name="telefone_responsavel_empresa" required>
    </div>
  `;

  // exibe o modal
  modal.style.display = "block";

  // fecha o modal
  document.querySelector(".close").onclick = () => modal.style.display = "none";
  document.getElementById("cancelar-edicao").onclick = () => modal.style.display = "none";

  // evento do botão "Salvar"
  document.getElementById("salvar-edicao").onclick = async (event) => {
    event.preventDefault();

    const email = document.getElementById("email_responsavel_empresa").value;
    const telefone = document.getElementById("telefone_responsavel_empresa").value;

    if (!email || !telefone) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch("/api/empresa/contato", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email_responsavel_empresa: email,
          telefone_responsavel_empresa: telefone
        })
      });

      const dados = await resposta.json();

      if (dados.success) {
        alert("Dados de contato atualizados com sucesso!");
        modal.style.display = "none";
        location.reload();
      } else {
        alert("Erro: " + dados.message);
      }

    } catch (erro) {
      console.error("Erro ao atualizar contato:", erro);
      alert("Erro ao atualizar contato da empresa.");
    }
  };
});
