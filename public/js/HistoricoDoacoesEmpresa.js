// public/js/historicoDoacoesEmpresa.js

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let historicoCompleto = []; 
const itemsPerPage = 10;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function() {

let nomeUsuario = document.getElementById('textNomeUsuario')
let nomeInstituicao = document.getElementById('textNomeInstituicao')

async function carregarUsuario() {
  try {
    console.log('>>> Iniciando carregarUsuario...');
    
    // PRIMEIRO: Buscar dados básicos do token
    const tokenRes = await fetch('/api/usuarioToken');
    const tokenData = await tokenRes.json();
    console.log('>>> Dados do token:', tokenData);

    // SEGUNDO: Buscar dados completos do usuário
    const userRes = await fetch('/api/usuario');
    const userData = await userRes.json();
    console.log('>>> Dados completos:', userData);

    // Combina os dados
    const dados = {
      ...tokenData,
      ...userData.data // Dados completos da API /api/usuario
    };

    console.log('>>> Dados combinados:', dados);
    
    // CORREÇÃO: Usar os dados corretos da API
    if (nomeUsuario) {
        nomeUsuario.innerHTML = dados.nome || dados.nome_fantasia || 'Usuário';
    }
    
    if (nomeInstituicao) {
        nomeInstituicao.innerHTML = dados.nome_fantasia || dados.razao_social || 'Instituição';
    }

    let id_usuario = dados.id;
    console.log('>>> ID do usuário:', id_usuario);

    const excedentesEmpresa = await carregarExcedentesEmpresa(id_usuario);
    const solicitacoesEmpresa = await carregarSolicitacoesEmpresa(id_usuario);

    // define os IDs com base no tipo
    const tableId ='doacoesTableEmpresa';
    const searchInputId = 'searchInputEmpresa';
    const totalItensId ='totalItensEmpresa';
    const totalPaginasId = 'totalPaginasEmpresa';
    const paginationControlsId = 'paginationControlsEmpresa';

    const tableIdSolicitacoes ='doacoesTableEmpresaSolicitacoes';
    const searchInputIdSolicitacoes = 'searchInputEmpresaSolicitacoes';
    const totalItensIdSolicitacoes ='totalItensEmpresaSolicitacoes';
    const totalPaginasIdSolicitacoes = 'totalPaginasEmpresaSolicitacoes';
    const paginationControlsIdSolicitacoes = 'paginationControlsEmpresaSolicitacoes';

    // exibe apenas a tabela correspondente
    document.getElementById(tableId).style.display = 'table';
    document.getElementById(tableIdSolicitacoes).style.display = 'table';

    preencherTabelaComExcedentes(excedentesEmpresa, tableId);
    preencherTabelaComSolicitacoes(solicitacoesEmpresa, tableIdSolicitacoes);

    setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId);
    setupTable(searchInputIdSolicitacoes, tableIdSolicitacoes, totalItensIdSolicitacoes, totalPaginasIdSolicitacoes, paginationControlsIdSolicitacoes);

  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    // Fallback em caso de erro
    if (nomeUsuario) nomeUsuario.innerHTML = 'Usuário';
    if (nomeInstituicao) nomeInstituicao.innerHTML = 'Instituição';
  }
}

async function carregarExcedentesEmpresa(id) {
  try {
    console.log('>>> Carregando excedentes para empresa ID:', id);
    
    const res = await fetch(`/doacoesConcluidasEmpresa/excedentesConcluidosEmpresa?id=${encodeURIComponent(id)}`);

    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

    const doacoes = await res.json();
    console.log('Excedentes concluídos:', doacoes);
    return doacoes;
  } catch (erro) {
    console.error('Erro ao carregar excedentes da empresa:', erro);
    return [];
  }
}

async function carregarSolicitacoesEmpresa(id) {
  try {
    console.log('>>> Carregando solicitações para empresa ID:', id);
    
    const res = await fetch(`/doacoesConcluidasEmpresa/doacoesSolicitadasConcluidasEmpresa?id=${encodeURIComponent(id)}`);

    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

    const doacoes = await res.json();
    console.log('Solicitações concluídas:', doacoes);
    return doacoes;
  } catch (erro) {
    console.error('Erro ao carregar solicitações da empresa:', erro);
    return [];
  }
}

function preencherTabelaComExcedentes(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) {
    console.error('Tbody não encontrado para:', tableId);
    return;
  }
  
  tbody.innerHTML = ''; // Limpa a tabela

  if (!doacoes || !doacoes.length) {
    // Conta as colunas dinamicamente para o colspan
    const table = document.getElementById(tableId);
    const colCount = table ? table.querySelector('thead tr').cells.length : 7;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Nenhum excedente concluído encontrado.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome_alimento || 'N/A'}</td>
      <td>${item.quantidade || 'N/A'}</td>
      <td>${item.ong?.nome || item.nomeONG || 'ONG não identificada'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function preencherTabelaComSolicitacoes(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) {
    console.error('Tbody não encontrado para:', tableId);
    return;
  }
  
  tbody.innerHTML = ''; // Limpa a tabela

  if (!doacoes || !doacoes.length) {
    // Conta as colunas dinamicamente para o colspan
    const table = document.getElementById(tableId);
    const colCount = table ? table.querySelector('thead tr').cells.length : 7;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Nenhuma solicitação concluída encontrada.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome_alimento || 'N/A'}</td>
      <td>${item.quantidade || 'N/A'}</td>
      <td>${item.nomeONG || 'ONG não identificada'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId) {
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    const totalItens = document.getElementById(totalItensId);
    const totalPaginas = document.getElementById(totalPaginasId);
    const paginationControls = document.getElementById(paginationControlsId);

    // Verifica se todos os elementos existem
    if (!searchInput || !table || !totalItens || !totalPaginas || !paginationControls) {
        console.warn('Elementos não encontrados para setupTable:', {
            searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId
        });
        return;
    }

    let currentPage = 1;
    const itemsPerPage = 10;

    function getRows() {
        return Array.from(table.querySelectorAll('tbody tr'));
    }

    function renderTable() {
        const rows = getRows();
        const searchTerm = searchInput.value.toLowerCase();
        const filteredRows = rows.filter(row =>
            row.textContent.toLowerCase().includes(searchTerm)
        );
        totalItens.textContent = filteredRows.length;
        const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
        totalPaginas.textContent = totalPages;

        rows.forEach(row => row.style.display = 'none');
        filteredRows
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .forEach(row => row.style.display = '');

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        paginationControls.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = (i === currentPage) ? 'active' : '';
            btn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            paginationControls.appendChild(btn);
        }
    }

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderTable();
    });

    renderTable();
}

carregarUsuario();
});
    carregarUsuario();
    loadHistorico(); 
    setupSearch();
    setupPaginationListeners();

async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarioToken');
        if (!res.ok) throw new Error('Falha ao buscar usuário');
        dadosUsuario = await res.json();
        document.getElementById('textNomeUsuario').innerHTML = dadosUsuario.nome || 'Usuário';
        document.getElementById('textNomeInstituicao').innerHTML = dadosUsuario.nomeInstituicao || 'Empresa';
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
    }
}

// === CARREGAMENTO DE DADOS (BACKEND) ===
async function loadHistorico() {
    try {
        // Rota unificada para buscar histórico (Concluído e Cancelado)
        const response = await fetch('/api/meu-historico'); 
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        historicoCompleto = await response.json();
        renderizarTabela(historicoCompleto);
        setupPagination(historicoCompleto.length);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        alert('Falha ao carregar seu histórico de doações. Tente novamente.');
    }
}

function renderizarTabela(historico) {
    const tbody = document.getElementById('historicoTableBody'); 
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (historico.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum registro no histórico.</td></tr>';
        return;
    }
    
    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const historicoPaginado = historico.slice(startIndex, endIndex);

    historicoPaginado.forEach(item => {
        // O campo 'tipo' deve vir do backend: 'doacao' (Empresa criou) ou 'pedido' (Empresa reservou)
        const tipoItem = item.tipo_item === 'doacao' ? 'Doação' : 'Pedido';
        // O campo de parceiro deve ser adaptado dependendo do item
        const nomeParceiro = item.nome_parceiro || item.nomeONG || item.nome_ong_reserva || 'N/A';
        
        const dataConclusao = item.data_conclusao ? new Date(item.data_conclusao).toLocaleDateString('pt-BR') : 'N/A';
        
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td> 
                <td>${nomeParceiro}</td> 
                <td>${tipoItem}</td>
                <td><span class="status ${String(item.status).toLowerCase()}">${item.status}</span></td>
                <td>${dataConclusao}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(historico.length);
    updateCurrentPageDisplay();
}

// === PESQUISA E PAGINAÇÃO ===
function updateItemCount(total) {
    const el = document.getElementById('totalItens');
    if (el) el.textContent = total;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        const historicoFiltrado = historicoCompleto.filter(item => 
            (item.nome_alimento && item.nome_alimento.toLowerCase().includes(searchText)) ||
            (item.nome_parceiro && item.nome_parceiro.toLowerCase().includes(searchText)) ||
            (item.nomeONG && item.nomeONG.toLowerCase().includes(searchText))
        );
        
        currentPage = 1; 
        renderizarTabela(historicoFiltrado);
        setupPagination(historicoFiltrado.length);
    });
}

function setupPagination(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const el = document.getElementById('totalPaginas');
    if (el) el.textContent = totalPaginas;
    
    // Guarda o total de itens para o controle de página
    document.body.dataset.totalItems = totalItems; 
}

function updateCurrentPageDisplay() {
    const el = document.getElementById('paginaAtual');
    if (el) el.textContent = currentPage;
}

function setupPaginationListeners() {
    const totalItems = parseInt(document.body.dataset.totalItems) || 0;
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);

    document.getElementById('btnAnterior').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadHistorico(); // Recarrega/re-renderiza a tabela
        }
    });

    document.getElementById('btnProximo').addEventListener('click', () => {
        if (currentPage < totalPaginas) {
            currentPage++;
            loadHistorico(); // Recarrega/re-renderiza a tabela
        }
    });
}
