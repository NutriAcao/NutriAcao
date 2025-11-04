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
    window.dadosOng = dados; // Armazena os dados da ONG globalmente

    // --- Dados do responsável ---
    document.getElementById("nomeResponsavel").textContent = dados.nome_responsavel_ong || "Não informado";
    document.getElementById("cargoResponsavel").textContent = dados.cargo_responsavel_ong || "Não informado";
    document.getElementById("cpfResponsavel").textContent = dados.cpf_responsavel_ong || "Não informado";
    document.getElementById("emailResponsavel").textContent = dados.email_responsavel_ong || "Não informado";
    document.getElementById("telefoneResponsavel").textContent = dados.telefone_responsavel_ong || "Não informado";

    // --- Dados da ONG ---
    document.getElementById("nomeOng").textContent = dados.nome || "Não informado";
    document.getElementById("cnpjOng").textContent = dados.cnpj || "Não informado";
    document.getElementById("areaAtuacao").textContent = dados.area_atuacao || "Não informado";
    document.getElementById("cepOng").textContent = dados.cep || "Não informado";
    document.getElementById("enderecoOng").textContent = dados.endereco || "Não informado";
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

// ===============================
// EDITAR DADOS DO RESPONSÁVEL
// ===============================
document.getElementById("editar-responsavel").addEventListener("click", () => {
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

  // Salvar alterações
  btnSalvar.onclick = async () => {
    const payload = {
      nome_responsavel_ong: document.getElementById("nomeResponsavel-editar").value,
      cpf_responsavel_ong: document.getElementById("cpfResponsavel-editar").value,
      cargo_responsavel_ong: document.getElementById("cargoResponsavel-editar").value,
      email_responsavel_ong: document.getElementById("emailResponsavel-editar").value,
      telefone_responsavel_ong: document.getElementById("telefoneResponsavel-editar").value
    };

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


// ===============================
// ATUALIZAR DADOS DA ONG
// ===============================
document.getElementById("atualizar-dados-ong").addEventListener("click", () => {
  const dados = window.dadosOng;

  modalTitulo.textContent = "Atualizar Dados da ONG";
  formEdicao.innerHTML = `
    <label>Nome da ONG:</label>
    <input type="text" id="nomeOng-editar" value="${dados.nome || ""}" required>

    <label>CNPJ:</label>
    <input type="text" id="cnpjOng-editar" value="${dados.cnpj || ""}" required>

    <label>Área de Atuação:</label>
    <input type="text" id="areaAtuacao-editar" value="${dados.area_atuacao || ""}">

    <label>CEP:</label>
    <input type="text" id="cepOng-editar" value="${dados.cep || ""}" required>

    <label>Endereço:</label>
    <input type="text" id="enderecoOng-editar" value="${dados.endereco || ""}" required>

    <label>E-mail de Contato:</label>
    <input type="email" id="emailOng-editar" value="${dados.email || ""}" required>

    <label>Telefone de Contato:</label>
    <input type="text" id="telefoneOng-editar" value="${dados.telefone || ""}" required>
  `;

  modal.style.display = "flex";

  // Salvar alterações
  btnSalvar.onclick = async () => {
    const payload = {
      nome: document.getElementById("nomeOng-editar").value,
      cnpj: document.getElementById("cnpjOng-editar").value,
      area_atuacao: document.getElementById("areaAtuacao-editar").value,
      cep: document.getElementById("cepOng-editar").value,
      endereco: document.getElementById("enderecoOng-editar").value,
      email: document.getElementById("emailOng-editar").value,
      telefone: document.getElementById("telefoneOng-editar").value
    };

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
