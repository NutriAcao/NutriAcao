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

//Importa os dados em forma de lista para popular as tabelas
    const excedentesCadastrados = await ExcedentesCadastradosEmpresa(id_usuario);
    const listaExcedentesAndamentoEmpresa = await excedentesAndamentoEmpresa(id_usuario);
    const listaSolicitacoesAndamentoEmpresa = await solicitacoesAndamentoEmpresa(id_usuario);
   
    


  // Importa os dados da tabela de Excedentes Cadastrados
    const tableIdExcedentesCadastrados = 'doacoesCadastradasTableEmpresa';
    const searchInputIdExcedentesCadastrados ='searchInputEmpresaExcedentesCadastrados';
    const totalItensIdExcedentesCadastrados ='totalItensEmpresaExcedentesCadastrados';
    const totalPaginasIdExcedentesCadastrados = 'totalPaginasEmpresaExcedentesCadastrados';
    const paginationControlsIdExcedentesCadastrados = 'paginationControlsEmpresaExcedentesCadastrados';

  // Importa os dados da tabela de Pedidos Andamento
    const tableIdPedidosAndamento = 'doacoesTableEmpresaPedidosAndamento';
    const searchInputIdPedidosAndamento ='searchInputEmpresaPedidosAndamento';
    const totalItensIdPedidosAndamento ='totalItensEmpresaPedidosAndamento';
    const totalPaginasIdPedidosAndamento = 'totalPaginasEmpresaPedidosAndamento';
    const paginationControlsIdPedidosAndamento = 'paginationControlsEmpresaPedidosAndamento';

  // Importa os dados da tabela de Excedentes Andamento
    const tableIdExcedentesAndamento = 'excedentesAndamentoTableEmpresa';
    const searchInputIdExcedentesAndamento ='searchInputEmpresaExcedentesAndamento';
    const totalItensIdExcedentesAndamento ='totalItensEmpresaExcedentesAndamento';
    const totalPaginasIdExcedentesAndamento = 'totalPaginasEmpresaExcedentesAndamento';
    const paginationControlsIdExcedentesAndamento = 'paginationControlsEmpresaExcedentesAndamento';





    
    document.getElementById(tableIdExcedentesCadastrados).style.display = 'table'; //Tabela Excedentes disponíveis
    document.getElementById(tableIdPedidosAndamento).style.display = 'table'; //Tabela Solicitações em andamento
    document.getElementById(tableIdExcedentesAndamento).style.display = 'table'; //Tabela Excedentes em andamento

    preencherTabelaComDoacoesEmpresa(excedentesCadastrados, tableIdExcedentesCadastrados);
    preencherTabelaComSolicitacoesAndamentoEmpresa(listaSolicitacoesAndamentoEmpresa, tableIdPedidosAndamento);
    preencherTabelaComExcedentesAndamentoEmpresa(listaExcedentesAndamentoEmpresa, tableIdExcedentesAndamento);


    setupTable(searchInputIdExcedentesCadastrados, tableIdExcedentesCadastrados, totalItensIdExcedentesCadastrados, totalPaginasIdExcedentesCadastrados, paginationControlsIdExcedentesCadastrados);
    setupTable(searchInputIdPedidosAndamento, tableIdPedidosAndamento, totalItensIdPedidosAndamento, totalPaginasIdPedidosAndamento, paginationControlsIdPedidosAndamento);
    setupTable(searchInputIdExcedentesAndamento, tableIdExcedentesAndamento, totalItensIdExcedentesAndamento, totalPaginasIdExcedentesAndamento, paginationControlsIdExcedentesAndamento );

  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

async function ExcedentesCadastradosEmpresa(id) {
  try {
    
     let res = await fetch(`/doacoesConcluidasEmpresa/doacoesEmpresa?id=${encodeURIComponent(id)}`);
    

    const doacoes = await res.json();

    console.log('Doações disponíveis:', doacoes);
    return doacoes; // ← Aqui está certo!
  } catch (erro) {
    console.error('Erro ao carregar doações do usuário:', erro);
    return []; // ← retorna array vazio em caso de erro
  }
}

async function solicitacoesAndamentoEmpresa(id) {
  try {
    const res = await fetch(`/doacoesConcluidasEmpresa/doacoesSolicitadasEmpresa?id=${encodeURIComponent(id)}`);

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
    }

    const dados = await res.json();
    return dados;
  } catch (erro) {
    console.error('Erro ao buscar pedidos em andamento da empresa:', erro);
    return []; // Retorna array vazio para evitar falhas no consumo
  }
}


async function excedentesAndamentoEmpresa(id) {
  try {
    const res = await fetch(`/doacoesConcluidasEmpresa/excedentesReservadosEmpresa?id=${encodeURIComponent(id)}`);
    
    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
    }

    const dados = await res.json();
    return dados;
  } catch (erro) {
    console.error('Erro ao buscar excedentes reservados:', erro);
    return []; // Retorna array vazio para evitar quebra no frontend
  }
}


function preencherTabelaComDoacoesEmpresa(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  //Cria os elementos da tabela
  if (!doacoes.length) {
    
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    
  } else {
  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      
      <td>${item.status}</td>
    `;
    tbody.appendChild(tr);
  });
}
}

function preencherTabelaComSolicitacoesAndamentoEmpresa(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  //Cria os elementos da tabela
  if (!doacoes.length) {
    
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    
  } else {
  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${item.dataCadastroSolicitacao}</td>
      <td>${item.nomeONG}</td>
    `;
    tbody.appendChild(tr);
  });
}
}

function preencherTabelaComExcedentesAndamentoEmpresa(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  //Cria os elementos da tabela
  if (!doacoes.length) {
    
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    
  } else {
  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${item.data_validade}</td>
      <td>${item.ong?.nome || 'ONG não identificada'}</td>
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

