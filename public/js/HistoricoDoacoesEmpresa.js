document.addEventListener('DOMContentLoaded', function() {

let nomeUsuario = document.getElementById('textNomeUsuario')
let nomeInstituicao = document.getElementById('textNomeInstituicao')

async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuarioToken');
    const dados = await res.json();

    

    nomeUsuario.innerHTML = dados.nome
    nomeInstituicao.innerHTML = dados.nomeInstituicao

    let id_usuario = dados.id;
   

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
  }
}

async function carregarExcedentesEmpresa(id) {
  try {
    
     const res = await fetch(`/doacoesConcluidasEmpresa/excedentesConcluidosEmpresa?id=${encodeURIComponent(id)}`);

    const doacoes = await res.json();

    console.log('Excedentes concluídos:', doacoes);
    return doacoes; // ← Aqui está certo!
  } catch (erro) {
    console.error('Erro ao carregar doações do usuário:', erro);
    return []; // ← retorna array vazio em caso de erro
  }
}

async function carregarSolicitacoesEmpresa(id) {
  try {
    
     const res = await fetch(`/doacoesConcluidasEmpresa/doacoesSolicitadasConcluidasEmpresa?id=${encodeURIComponent(id)}`);

    const doacoes = await res.json();

    console.log('Solicitações concluídas:', doacoes);
    return doacoes; // ← Aqui está certo!
  } catch (erro) {
    console.error('Erro ao carregar doações do usuário:', erro);
    return []; // ← retorna array vazio em caso de erro
  }
}

function preencherTabelaComExcedentes(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  if (!doacoes.length) {
    
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    
  } else {
    doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${item.ong?.nome || 'ONG não identificada'}</td>
    `;
    tbody.appendChild(tr);
  });
  }
  
}

function preencherTabelaComSolicitacoes(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  if (!doacoes.length) {
    
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    
  } else {
    doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${item.nomeONG}</td>
    `;
    tbody.appendChild(tr);
  });
  }
  
}



    function setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId) {
        const searchInput = document.getElementById(searchInputId);
        const table = document.getElementById(tableId);
        const totalItens = document.getElementById(totalItensId);
        const totalPaginas = document.getElementById(totalPaginasId);
        const paginationControls = document.getElementById(paginationControlsId);

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

