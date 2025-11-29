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
    
  // Buscar dados completos do usuário (inclui empresa_id quando for empresa)
  const userRes = await fetch('/api/usuario');
  const userData = await userRes.json();
  console.log('>>> Dados completos:', userData);

  if (!userData || !userData.success || !userData.data) {
    throw new Error('Falha ao obter dados do usuário');
  }

  const dados = userData.data;

  console.log('>>> Dados do usuário (usados):', dados);

  // Preencher nome e instituição
  if (nomeUsuario) {
    nomeUsuario.innerHTML = dados.nome || dados.nome_fantasia || 'Usuário';
  }

  if (nomeInstituicao) {
    nomeInstituicao.innerHTML = dados.nome_fantasia || dados.razao_social || 'Instituição';
  }

  // Usar empresa_id retornado pelo endpoint /api/usuario
  const id_empresa = dados.empresa_id;
    console.log('>>> ID da empresa (usado):', id_empresa);

    if (!id_empresa) {
      console.warn('Usuário não associado a uma empresa (nenhum empresa_id disponível). Mostrando tabelas vazias.');
      preencherTabelaComExcedentes([], 'doacoesTableEmpresa');
      preencherTabelaComSolicitacoes([], 'doacoesTableEmpresaSolicitacoes');
      return;
    }

    const excedentesEmpresa = await carregarExcedentesEmpresa(id_empresa);
    const solicitacoesEmpresa = await carregarSolicitacoesEmpresa(id_empresa);
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
    
    // USA APENAS A ROTA QUE ESTÁ FUNCIONANDO
    const res = await fetch(`/doacoesConcluidasEmpresa/doacoesSolicitadasConcluidasEmpresa?id=${encodeURIComponent(id)}`);

    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

    const doacoes = await res.json();
    console.log('✅ Solicitações concluídas recebidas:', doacoes);
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
    const colCount = table ? table.querySelector('thead tr').cells.length : 3;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Nenhum excedente doado encontrado.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    
    // Verifica a estrutura dos dados
    console.log('Item excedente:', item);
    
    tr.innerHTML = `
      <td>${item.titulo || 'N/A'}</td>
      <td>${item.quantidade || 'N/A'}</td>
      <td>${item.ong?.nome_ong || item.nome_ong || 'N/A'}</td>
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

  console.log('🎯 Dados recebidos para solicitações:', doacoes);

  if (!doacoes || !doacoes.length) {
    // Conta as colunas dinamicamente para o colspan
    const table = document.getElementById(tableId);
    const colCount = table ? table.querySelector('thead tr').cells.length : 3;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Nenhuma solicitação concluída encontrada.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    
    // DEBUG: Verifica a estrutura completa do item
    console.log('🔍 Item solicitação completo:', item);
    
    // Tenta diferentes formas de acessar os dados
    const titulo = item.titulo || 'N/A';
    const quantidade = item.quantidade_desejada || item.quantidade || 'N/A';
    
    // Diferentes formas de acessar o nome da ONG
    let nomeOng = 'N/A';
    if (item.ong && item.ong.nome_ong) {
      nomeOng = item.ong.nome_ong;
    } else if (item.nome_ong) {
      nomeOng = item.nome_ong;
    } else if (item.ong_nome) {
      nomeOng = item.ong_nome;
    }
    
    console.log(`📊 Dados extraídos: "${titulo}", "${quantidade}", "${nomeOng}"`);
    
    tr.innerHTML = `
      <td>${titulo}</td>
      <td>${quantidade}</td>
      <td>${nomeOng}</td>
    `;
    tbody.appendChild(tr);
  });
  
  console.log(`✅ Tabela ${tableId} preenchida com ${doacoes.length} itens`);
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