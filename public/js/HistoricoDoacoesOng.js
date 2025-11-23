document.addEventListener('DOMContentLoaded', function() {

let nomeUsuario = document.getElementById('textNomeUsuario')
let nomeInstituicao = document.getElementById('textNomeInstituicao')

async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuario');
    const resultado = await res.json();

    if (resultado.success && resultado.data) {
        const dados = resultado.data;
        
        // CORREÇÃO: Acessa os dados corretamente
        nomeUsuario.innerHTML = dados.nome || 'Usuário';
        
        // CORREÇÃO: Para ONG, usa nome_ong; para empresa, usa nome_fantasia
        const nomeInstituicaoValor = dados.nome_ong || dados.nome_fantasia || dados.razao_social || 'Instituição';
        nomeInstituicao.innerHTML = nomeInstituicaoValor;

        let id_usuario = dados.id;
    

        const solicitacoes = await carregarDoacoesUsuario(id_usuario);
        const excedentes = await carregarExcedentesUsuario(id_usuario);

    // define os IDs com base no tipo
        const tableId = 'doacoesTableOng';
        const searchInputId = 'searchInputOng';
        const totalItensId = 'totalItensOng';
        const totalPaginasId = 'totalPaginasOng';
        const paginationControlsId = 'paginationControlsOng';

        const tableIdExcedente = 'doacoesTableOngExcedente';
        const searchInputIdExcedente = 'searchInputOngExcedente';
        const totalItensIdExcedente = 'totalItensOngExcedente';
        const totalPaginasIdExcedente = 'totalPaginasOngExcedente';
        const paginationControlsIdExcedente = 'paginationControlsOngExcedente';

        // exibe apenas a tabela correspondente
        document.getElementById(tableId).style.display = 'table';
        document.getElementById(tableIdExcedente).style.display = 'table';

        preencherTabelaComDoacoesConcluidas(solicitacoes, tableId);
        preencherTabelaComExcedentesConcluidos(excedentes, tableIdExcedente);

        setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId);
        setupTable(searchInputIdExcedente, tableIdExcedente, totalItensIdExcedente, totalPaginasIdExcedente, paginationControlsIdExcedente);

    } else {
        throw new Error(resultado.message || 'Erro na resposta da API');
    }

  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    // Fallback em caso de erro
    nomeUsuario.innerHTML = 'Usuário';
    nomeInstituicao.innerHTML = 'Instituição';
  }
}

async function carregarDoacoesUsuario(id) {
  try {
 
     const res = await fetch(`/doacoesConcluidasONG/solicitacoesConcluidasONG?id=${encodeURIComponent(id)}`);

    const doacoes = await res.json();

    console.log('Solicitações concluídas:', doacoes);
    return doacoes; // ← Aqui está certo!
  } catch (erro) {
    console.error('Erro ao carregar doações do usuário:', erro);
    return []; // ← retorna array vazio em caso de erro
  }
}

async function carregarExcedentesUsuario(id) {
  try {
 
     const res = await fetch(`/doacoesConcluidasONG/excedentesConcluidosONG?id=${encodeURIComponent(id)}`);

    const doacoes = await res.json();

    console.log('Excedentes concluídos:', doacoes);
    return doacoes; // ← Aqui está certo!
  } catch (erro) {
    console.error('Erro ao carregar doações do usuário:', erro);
    return []; // ← retorna array vazio em caso de erro
  }
}

function preencherTabelaComDoacoesConcluidas(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  // CORREÇÃO: Definir colspan ou usar mensagem simples
  if (doacoes.length === 0) {
    // Conta quantas colunas a tabela tem
    const table = document.getElementById(tableId);
    const colCount = table.querySelector('thead tr').cells.length;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Nenhuma solicitação ativa encontrada.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${item.empresa.nome}</td>
    `;
    tbody.appendChild(tr);
  });
}

function preencherTabelaComExcedentesConcluidos(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  // CORREÇÃO: Definir colspan ou usar mensagem simples
  if (doacoes.length === 0) {
    // Conta quantas colunas a tabela tem
    const table = document.getElementById(tableId);
    const colCount = table.querySelector('thead tr').cells.length;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Nenhuma solicitação ativa encontrada.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${item.NomeEmpresa}</td>
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