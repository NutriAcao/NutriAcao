/* arquivo: public/js/minhaContaEmpresa.js - script do frontend: funcionalidades relacionadas a minhacontaempresa - funções/constantes: res, modalTitulo, token, btnCancelar, resposta */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/usuario", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const resposta = await res.json();

    if (!resposta.success) {
      alert("Erro: " + resposta.message);
      return;
    }

    const dados = resposta.data;
    window.dadosEmpresa = dados;

    document.getElementById("nome").textContent =
      dados.nome_responsavel_empresa || "Não informado";
    document.getElementById("cargo").textContent =
      dados.cargo_responsavel_empresa || "Não informado";
    document.getElementById("cpf").textContent =
      dados.cpf_responsavel_empresa || "Não informado";
    document.getElementById("emailResp").textContent =
      dados.email_responsavel_empresa || "Não informado";
    document.getElementById("telefone").textContent =
      dados.telefone_responsavel_empresa || "Não informado";

    document.getElementById("nomeEmpresa").textContent =
      dados.nome || "Não informado";
    document.getElementById("cnpj").textContent = dados.cnpj || "Não informado";
    document.getElementById("enderecoEmpresa").textContent =
      dados.endereco || "Não informado";
    document.getElementById("emailContato").textContent =
      dados.email || "Não informado";
    document.getElementById("telefoneComercial").textContent =
      dados.telefone || "Não informado";

    document.getElementById("email").textContent =
      dados.email || "Não informado";
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
});

const modal = document.getElementById("modal-edicao");
const modalTitulo = document.getElementById("modal-titulo");
const formEdicao = document.getElementById("form-edicao");
const btnFechar = document.querySelector(".close");
const btnCancelar = document.getElementById("cancelar-edicao");
const btnSalvar = document.getElementById("salvar-edicao");

btnFechar.addEventListener("click", () => (modal.style.display = "none"));
btnCancelar.addEventListener("click", () => (modal.style.display = "none"));

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

  btnSalvar.onclick = async () => {
    const payload = {
      nome_responsavel_empresa: document.getElementById("nome-editar").value,
      cpf_responsavel_empresa: document.getElementById("cpf-editar").value,
      cargo_responsavel_empresa: document.getElementById("cargo-editar").value,
      email_responsavel_empresa:
        document.getElementById("emailResp-editar").value,
      telefone_responsavel_empresa:
        document.getElementById("telefone-editar").value,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/usuario", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

document.getElementById("atualizar-contato").addEventListener("click", () => {
  const dados = window.dadosEmpresa;

  modalTitulo.textContent = "Atualizar Dados de Contato da Empresa";
  formEdicao.innerHTML = `
    <label>Nome da Empresa:</label>
    <input type="text" id="nomeEmpresa-editar" value="${dados.nome || ""}" required>

    <label>CNPJ:</label>
    <input type="text" id="cnpj-editar" value="${dados.cnpj || ""}" required>

    <label>Endereço:</label>
    <input type="text" id="endereco-editar" value="${dados.endereco || ""}" required>

    <label>E-mail de Contato:</label>
    <input type="email" id="emailContato-editar" value="${dados.email || ""}" required>

    <label>Telefone Comercial:</label>
    <input type="text" id="telefoneComercial-editar" value="${dados.telefone || ""}" required>
  `;

  modal.style.display = "flex";

  btnSalvar.onclick = async () => {
    const payload = {
      nome: document.getElementById("nomeEmpresa-editar").value,
      cnpj: document.getElementById("cnpj-editar").value,
      endereco: document.getElementById("endereco-editar").value,
      email: document.getElementById("emailContato-editar").value,
      telefone: document.getElementById("telefoneComercial-editar").value,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
