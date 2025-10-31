document.addEventListener('DOMContentLoaded', function() {

let nomeUsuario = document.getElementById('textNomeUsuario')
let nomeInstituicao = document.getElementById('textNomeInstituicao')

async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuario');
    const dados = await res.json();

    

    nomeUsuario.innerHTML = dados.nome
    nomeInstituicao.innerHTML = dados.nomeInstituicao

    let email_usuario = dados.email;
    let tipo_usuario = dados.tipo;

    const doacoes = await carregarDoacoesUsuario(email_usuario, tipo_usuario); // ← Aguarda a execução

  // Define os IDs com base no tipo
    const tableId = tipo_usuario === 'empresa' ? 'doacoesTableEmpresa' : 'doacoesTableOng';
    const searchInputId = tipo_usuario === 'empresa' ? 'searchInputEmpresa' : 'searchInputOng';
    const totalItensId = tipo_usuario === 'empresa' ? 'totalItensEmpresa' : 'totalItensOng';
    const totalPaginasId = tipo_usuario === 'empresa' ? 'totalPaginasEmpresa' : 'totalPaginasOng';
    const paginationControlsId = tipo_usuario === 'empresa' ? 'paginationControlsEmpresa' : 'paginationControlsOng';

    // Exibe apenas a tabela correspondente
    document.getElementById(tableId).style.display = 'table';
    preencherTabelaComDoacoes(doacoes, tableId);
    setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId);

  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

async function carregarDoacoesUsuario(email, tipo) {
  try {
    let res;
    if (tipo === 'empresa') {
     res = await fetch(`/doacoesConcluidasEmpresa/doacoesEmpresa?email=${encodeURIComponent(email)}`);
    } else {
     res = await fetch(`/doacoesConcluidasONG/doacoesONG?email=${encodeURIComponent(email)}`);
    }
    


    const doacoes = await res.json();

    console.log('Doações concluídas:', doacoes);
    return doacoes; // ← Aqui está certo!
  } catch (erro) {
    console.error('Erro ao carregar doações do usuário:', erro);
    return []; // ← Retorna array vazio em caso de erro
  }
}

function preencherTabelaComDoacoes(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
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

