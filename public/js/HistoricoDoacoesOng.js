document.addEventListener('DOMContentLoaded', function() {
    let dadosUsuario = null;

    async function carregarUsuario() {
        try {
            const res = await fetch('/api/usuarioToken');
            if (!res.ok) throw new Error('Falha ao buscar usuário');
            
            dadosUsuario = await res.json();
            console.log('Dados do usuário:', dadosUsuario);

            // Atualiza a interface
            const nomeUsuarioElement = document.getElementById('textNomeUsuario');
            const nomeInstituicaoElement = document.getElementById('textNomeInstituicao');
            
            if (nomeUsuarioElement) {
                nomeUsuarioElement.innerHTML = dadosUsuario.nome || 'Usuário';
            }
            
            if (nomeInstituicaoElement) {
                nomeInstituicaoElement.innerHTML = dadosUsuario.nomeInstituicao || 'Instituição';
            }

            // Agora carrega as doações com o ID do usuário
            if (dadosUsuario && dadosUsuario.id) {
                await carregarDoacoesEExcedentes(dadosUsuario.id);
            } else {
                console.error('ID do usuário não encontrado');
            }

        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro);
        }
    }

    async function carregarDoacoesEExcedentes(idUsuario) {
        try {
            const solicitacoes = await carregarDoacoesUsuario(idUsuario);
            const excedentes = await carregarExcedentesUsuario(idUsuario);

            // Configura as tabelas
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

            // Exibe as tabelas
            const tableElement = document.getElementById(tableId);
            const tableExcedenteElement = document.getElementById(tableIdExcedente);
            
            if (tableElement) tableElement.style.display = 'table';
            if (tableExcedenteElement) tableExcedenteElement.style.display = 'table';

            // Preenche as tabelas
            preencherTabelaComDoacoesConcluidas(solicitacoes, tableId);
            preencherTabelaComExcedentesConcluidos(excedentes, tableIdExcedente);

            // Configura a paginação apenas se os elementos existirem
            if (document.getElementById(searchInputId)) {
                setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId);
            }
            
            if (document.getElementById(searchInputIdExcedente)) {
                setupTable(searchInputIdExcedente, tableIdExcedente, totalItensIdExcedente, totalPaginasIdExcedente, paginationControlsIdExcedente);
            }

        } catch (erro) {
            console.error('Erro ao carregar doações:', erro);
        }
    }

    async function carregarDoacoesUsuario(id) {
        try {
            const res = await fetch(`/doacoesConcluidasONG/solicitacoesConcluidasONG?id=${encodeURIComponent(id)}`);
            
            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`);
            }
            
            const doacoes = await res.json();
            console.log('Solicitações concluídas:', doacoes);
            return doacoes;
        } catch (erro) {
            console.error('Erro ao carregar doações do usuário:', erro);
            return [];
        }
    }

    async function carregarExcedentesUsuario(id) {
        try {
            const res = await fetch(`/doacoesConcluidasONG/excedentesConcluidosONG?id=${encodeURIComponent(id)}`);
            
            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`);
            }
            
            const doacoes = await res.json();
            console.log('Excedentes concluídos:', doacoes);
            return doacoes;
        } catch (erro) {
            console.error('Erro ao carregar excedentes do usuário:', erro);
            return [];
        }
    }

 function preencherTabelaComDoacoesConcluidas(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) {
    console.error(`Tabela com ID ${tableId} não encontrada`);
    return;
  }
  
  tbody.innerHTML = '';

  if (doacoes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">Nenhuma solicitação concluída encontrada.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    const dataConclusao = item.data_conclusao ? new Date(item.data_conclusao).toLocaleDateString('pt-BR') : 'N/A';
    
    tr.innerHTML = `
      <td>${item.nome_alimento || 'N/A'}</td>
      <td>${item.quantidade || 'N/A'}</td>
      <td>${item.empresa_nome || 'N/A'}</td>
      <td>${dataConclusao}</td>
    `;
    tbody.appendChild(tr);
  });
}

function preencherTabelaComExcedentesConcluidos(doacoes, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) {
    console.error(`Tabela com ID ${tableId} não encontrada`);
    return;
  }
  
  tbody.innerHTML = '';

  if (doacoes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">Nenhum excedente concluído encontrado.</td></tr>`;
    return;
  }

  doacoes.forEach(item => {
    const tr = document.createElement('tr');
    const dataConclusao = item.data_conclusao ? new Date(item.data_conclusao).toLocaleDateString('pt-BR') : 'N/A';
    
    tr.innerHTML = `
      <td>${item.nome_alimento || 'N/A'}</td>
      <td>${item.quantidade || 'N/A'}</td>
      <td>${item.nomeempresa || 'N/A'}</td>
      <td>${dataConclusao}</td>
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
            console.error('Elementos da tabela não encontrados:', {
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
    
    // Inicia o carregamento
    carregarUsuario();
});