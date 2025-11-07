/* arquivo: public/js/visualizacaoDoacoes.js - script do frontend: funcionalidades relacionadas a visualizacaodoacoes - funções/constantes: statusSelect, row, endIndex, doacao, updateItemCount */

let dadosUsuario = {};
let doacoesReais = [];
const itemsPerPage = 10;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", function () {
  carregarUsuario();
  loadDoacoesDisponiveis();
  setupSearch();
});

async function carregarUsuario() {
  try {
    const res = await fetch("/api/usuarioToken");
    if (!res.ok) throw new Error("Falha ao buscar usuário");
    dadosUsuario = await res.json();
    document.getElementById("textNomeUsuario").innerHTML =
      dadosUsuario.nome || "Usuário";
    document.getElementById("textNomeInstituicao").innerHTML =
      dadosUsuario.nomeInstituicao || "ONG";
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
}

async function loadDoacoesDisponiveis() {
  try {
    const response = await fetch("/api/doacoes-disponiveis-ong");
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Erro no servidor: ${response.status}`);
    }
    doacoesReais = await response.json();
    renderizarTabela(doacoesReais);
    setupPagination(doacoesReais.length);
  } catch (error) {
    console.error("Erro ao carregar doações:", error);
    alert("Falha ao carregar doações disponíveis. Tente novamente.");
  }
}

function renderizarTabela(doacoes) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  if (doacoes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7">Nenhuma doação disponível no momento.</td></tr>';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const doacoesPaginadas = doacoes.slice(startIndex, endIndex);

  doacoesPaginadas.forEach((doacao) => {
    const dataValidadeFormatada = new Date(
      doacao.data_validade,
    ).toLocaleDateString("pt-BR");

    const row = `
            <tr>
                <td>${doacao.id}</td>
                <td>${doacao.nome_alimento}</td>
                <td>${doacao.quantidade}</td> 
                <td>${doacao.nome_empresa}</td> 
                <td>${dataValidadeFormatada}</td>
                <td><span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span></td>
                <td><button onclick="openModal(${doacao.id})">Ver</button></td>
            </tr>
        `;
    tbody.innerHTML += row;
  });

  updateItemCount(doacoes.length);
}

function openModal(doacaoId) {
  const modal = document.getElementById("orderModal");
  const doacao = doacoesReais.find((d) => d.id == doacaoId);

  if (!doacao) return;

  modal.querySelector(".modal-header h3").textContent =
    `Detalhes da Doação #${doacao.id}`;
  document.getElementById("orderId").textContent = doacao.id;
  document.getElementById("orderDate").textContent = new Date(
    doacao.data_validade,
  ).toLocaleDateString("pt-BR");
  document.getElementById("institution").textContent = doacao.nome_empresa;
  document.getElementById("contact").textContent = doacao.telefone_contato;
  document.getElementById("address").textContent = doacao.cep_retirada;

  const statusElement = document.getElementById("orderStatus");
  statusElement.innerHTML = `<span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span>`;

  const itemsList = document.getElementById("itemsList");
  itemsList.innerHTML = `
        <tr>
            <td>${doacao.nome_alimento}</td>
            <td>${doacao.quantidade}</td>
            <td>Kg</td> <td>-</td>
        </tr>
    `;

  const actionButton = document.getElementById("actionButton");
  const statusUpdateSection = document.getElementById("statusUpdateSection");
  const statusSelect = document.getElementById("statusSelect");
  const updateStatusButton = document.getElementById("updateStatusButton");

  statusUpdateSection.style.display = "none";
  statusSelect.innerHTML = "";

  const status = String(doacao.status).toLowerCase();
  const tipoDoacao = "excedente";

  if (status === "disponível") {
    actionButton.textContent = "Reservar Doação";
    actionButton.style.backgroundColor = "#3498db";
    actionButton.style.display = "inline-block";
    actionButton.onclick = () =>
      handleAction(doacao.id, tipoDoacao, "reservar");
  } else if (status === "reservado") {
    actionButton.textContent = "Cancelar Reserva";
    actionButton.style.backgroundColor = "#e74c3c";
    actionButton.style.display = "inline-block";
    actionButton.onclick = () =>
      handleAction(doacao.id, tipoDoacao, "cancelar");

    statusUpdateSection.style.display = "block";
    statusSelect.innerHTML =
      '<option value="em andamento">Mover para "Em Andamento"</option>';
    updateStatusButton.onclick = () => updateStatus(doacao.id, tipoDoacao);
  } else if (status === "em andamento") {
    actionButton.style.display = "none";

    statusUpdateSection.style.display = "block";
    statusSelect.innerHTML =
      '<option value="concluido">Mover para "Concluído"</option>';
    updateStatusButton.onclick = () => updateStatus(doacao.id, tipoDoacao);
  } else if (status === "concluido") {
    actionButton.style.display = "none";
    statusUpdateSection.style.display = "none";
  }

  modal.showModal();
}

function closeModal() {
  document.getElementById("orderModal").close();
}

async function handleAction(doacaoId, tipoDoacao, actionType) {
  const endpoint =
    actionType === "reservar"
      ? "/api/reservar-doacao"
      : "/api/cancelar-reserva-e-devolver-estoque";

  closeModal();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doacaoId: doacaoId, tipoDoacao: tipoDoacao }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      loadDoacoesDisponiveis();
    } else {
      alert(`Falha: ${result.message}`);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Erro de rede. Tente novamente.");
  }
}

async function updateStatus(id, tipoDoacao) {
  const statusSelect = document.getElementById("statusSelect");
  const novoStatus = statusSelect.value;

  if (!novoStatus) {
    alert("Nenhum novo status selecionado.");
    return;
  }

  const endpoint = "/api/update-status";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        tipo: tipoDoacao,
        status: novoStatus,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      closeModal();
      loadDoacoesDisponiveis();
    } else {
      alert(`Falha: ${result.message}`);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Erro de rede. Tente novamente.");
  }
}

function updateItemCount(total) {
  document.getElementById("totalItens").textContent = total;
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();

    const doacoesFiltradas = doacoesReais.filter(
      (doacao) =>
        doacao.nome_alimento.toLowerCase().includes(searchText) ||
        doacao.nome_empresa.toLowerCase().includes(searchText),
    );

    currentPage = 1;
    renderizarTabela(doacoesFiltradas);
    setupPagination(doacoesFiltradas.length);
  });
}

function setupPagination(totalItems) {
  const totalPaginas = Math.ceil(totalItems / itemsPerPage);
  document.getElementById("totalPaginas").textContent = totalPaginas;
}

document
  .getElementById("orderModal")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      closeModal();
    }
  });
