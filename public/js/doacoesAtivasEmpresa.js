// Arquivo: doacoesAtivasEmpresa.js (Atualizado para carregar duas tabelas ativas com Status e Ações)

document.addEventListener('DOMContentLoaded', function() {

    let nomeUsuario = document.getElementById('textNomeUsuario');
    let nomeInstituicao = document.getElementById('textNomeInstituicao');

    async function carregarUsuario() {
        try {
            const res = await fetch('/api/usuarioToken');
            const dados = await res.json();

            nomeUsuario.innerHTML = dados.nome;
            nomeInstituicao.innerHTML = dados.nomeInstituicao;

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
// Arquivo: doacoesAtivasEmpresa.js (Funções atualizadas)

function preencherTabelaComDoacoesEmpresa(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela

  //Cria os elementos da tabela
  if (!doacoes.length) {
    
        // ATUALIZADO: Colspan corrigido de 7 para 4
        tbody.innerHTML = '<tr><td colspan="4">Nenhum excedente cadastrado no momento.</td></tr>';
        return;
    
  } else {
  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      
      <td>${item.status}</td>
      
      <td>
        <button class="btn-visualizar-pedido" onclick="visualizarExcedente(${item.id_doacao})">
            Visualizar
        </button>
      </td>
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
    
        // ATUALIZADO: Colspan corrigido de 7 para 5
        tbody.innerHTML = '<tr><td colspan="5">Nenhuma solicitação em andamento no momento.</td></tr>';
        return;
    
  } else {
  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    let data = item.dataCadastroSolicitacao.split('-').reverse().join('/');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${data}</td>
      <td>${item.nomeONG}</td>

      <td>
        <button class="btn-visualizar-pedido" onclick="visualizarPedido(${item.id_solicitacao})">
            Visualizar Pedido
        </button>
      </td>
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
    
        // ATUALIZADO: Colspan corrigido de 7 para 5
        tbody.innerHTML = '<tr><td colspan="5">Nenhum excedente em andamento no momento.</td></tr>';
        return;
    
  } else {
  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    let data = item.data_validade.split('-').reverse().join('/');
    tr.innerHTML = `
      
      <td>${item.nome_alimento}</td>
      <td>${item.quantidade}</td>
      <td>${data}</td>
      <td>${item.ong?.nome || 'ONG não identificada'}</td>

      <td>
        <button class="btn-visualizar-pedido" onclick="visualizarReserva(${item.id_reserva})">
            Visualizar Pedido
        </button>
      </td>
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
        
        // Garante que o input de busca seja selecionado corretamente
        const searchInputElements = document.querySelectorAll(`#${searchInputId}`);
        const currentSearchInput = searchInputElements.length > 1 ? Array.from(searchInputElements).find(input => input.closest('.card').querySelector(`#${tableId}`)) : searchInputElements[0];
        
        if (!table || !currentSearchInput) return; // Se a tabela ou a busca não existirem, para a execução.

        function getRows() {
            return Array.from(table.querySelectorAll('tbody tr'));
        }

        function renderTable() {
            const rows = getRows().filter(row => row.children.length > 1); // Ignora a linha de "tabela vazia"
            const searchTerm = currentSearchInput.value.toLowerCase();
            const filteredRows = rows.filter(row =>
                row.textContent.toLowerCase().includes(searchTerm)
            );
            
            if (totalItens) totalItens.textContent = filteredRows.length;
            
            const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
            if (totalPaginas) totalPaginas.textContent = totalPages;

            rows.forEach(row => row.style.display = 'none');
            filteredRows
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .forEach(row => row.style.display = '');

            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            if (!paginationControls) return;
            paginationControls.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                btn.className = 'page-btn ' + (i === currentPage ? 'active' : '');
                btn.addEventListener('click', () => {
                    currentPage = i;
                    renderTable();
                });
                paginationControls.appendChild(btn);
            }
        }

        currentSearchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });

        // Adiciona um observer para renderizar a tabela quando o tbody for preenchido (no preencherTabela)
        const observer = new MutationObserver((mutationsList, observer) => {
            if (mutationsList.length > 0) {
                currentPage = 1;
                renderTable();
                observer.disconnect(); // Desconecta após a primeira carga
            }
        });

        const tbody = table.querySelector('tbody');
        if (tbody) {
             // Inicia a observação do tbody
            observer.observe(tbody, { childList: true });
        } else {
            // Caso de fallback se o observer não for necessário
            renderTable();
        }
    }
    
    carregarUsuario();
});