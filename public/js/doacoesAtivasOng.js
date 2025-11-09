// Arquivo: doacoesAtivasOng.js (Atualizado para Minhas Solicitações Ativas com Status e Ações)

document.addEventListener('DOMContentLoaded', function() {

    let nomeUsuario = document.getElementById('textNomeUsuario');
    let nomeInstituicao = document.getElementById('textNomeInstituicao');

    async function carregarUsuario() {
        try {
            const res = await fetch('/api/usuarioToken');
            const dados = await res.json();

            nomeUsuario.innerHTML = dados.nome;
            nomeInstituicao.innerHTML = dados.nomeInstituicao;

            let email_usuario = dados.email;
            let tipo_usuario = dados.tipo;

            if (tipo_usuario === 'ong') {
                // Carrega as solicitações ativas (reservas em andamento)
                const solicitacoes = await carregarSolicitacoesAtivas(email_usuario);
                
                // Os IDs aqui são 'doacoesTableOng' e 'searchInputOng' conforme o HTML original da ONG
                const tableId = 'doacoesTableOng';
                const searchInputId = 'searchInputOng';
                const totalItensId = 'totalItensOng';
                const totalPaginasId = 'totalPaginasOng';
                const paginationControlsId = 'paginationControlsOng';

                preencherTabelaSolicitacoes(solicitacoes, tableId);
                // setupTable precisa de um elemento DOM real, vamos garantir que ele seja selecionado corretamente
                setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId);
            } else {
                // Lógica da Empresa será tratada no doacoesAtivasEmpresa.js
            }

        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro);
        }
    }

   async function carregarSolicitacoesAtivas(email) {
    try {
        // Rota para as RESERVAS/SOLICITAÇÕES que a ONG fez e estão ATIVAS
        const endpoint = `/doacoesAtivasONG/solicitacoes?email=${encodeURIComponent(email)}`;
        
        const res = await fetch(endpoint);

        if (!res.ok) {
            throw new Error(`Erro HTTP ao buscar solicitações: ${res.status}`);
        }

        const solicitacoes = await res.json();
        console.log('Solicitações ativas (reservas em andamento):', solicitacoes);
        return solicitacoes;
    } catch (erro) {
        console.error('Erro ao carregar solicitações ativas:', erro);
        return [];
    }
}

    // FUNÇÃO ATUALIZADA para preencher a tabela da ONG (Minhas Solicitações)
    function preencherTabelaSolicitacoes(solicitacoes, tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = ''; // Limpa a tabela

        // 6 colunas: ID, Doação Solicitada, Quantidade, Empresa Doadora, Status, Ações
        const colspan = 6; 

        if (solicitacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colspan}">Nenhuma solicitação ativa encontrada.</td></tr>`;
            return;
        }

        solicitacoes.forEach(item => {
            const tr = document.createElement('tr');
            
            // Cria a classe para o status (útil para estilizar via CSS)
            const statusClass = (item.status || 'pendente').toLowerCase();

            // O backend deve retornar: id_reserva, nome_alimento, quantidade_reservada, nome_empresa, status
            tr.innerHTML = `
              <td>${item.id_reserva}</td>
              <td>${item.nome_alimento}</td>
              <td>${item.quantidade_reservada}</td>
              <td>${item.nome_empresa}</td>
              <td><span class="status ${statusClass}">${item.status || 'Pendente'}</span></td>
              <td><button class="btn-acao" onclick="visualizarDetalhesSolicitacao(${item.id_reserva})">Visualizar Pedido</button></td>
            `;
            
            tbody.appendChild(tr);
        });
    }

    // Função de ação para a ONG (deve estar acessível globalmente)
    window.visualizarDetalhesSolicitacao = function(id) {
        alert('Ação: Abrir detalhes da Solicitação/Reserva ID: ' + id);
        // Implementação real: window.location.href = `/detalhesSolicitacao.html?id=${id}`;
    };


    // Função setupTable (Mantida, mas com a correção para buscar corretamente o input)
    function setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId) {
        // Usa querySelector para selecionar o input de busca (evita problemas se houver mais de um elemento com o mesmo ID em páginas diferentes)
        const searchInput = document.getElementById(searchInputId);
        const table = document.getElementById(tableId);
        const totalItens = document.getElementById(totalItensId);
        const totalPaginas = document.getElementById(totalPaginasId);
        const paginationControls = document.getElementById(paginationControlsId);

        let currentPage = 1;
        const itemsPerPage = 10;
        
        if (!table || !searchInput) return;

        function getRows() {
            return Array.from(table.querySelectorAll('tbody tr')).filter(row => row.children.length > 1);
        }

        function renderTable() {
            const rows = getRows();
            const searchTerm = searchInput.value.toLowerCase();
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
                btn.className = 'page-btn ' + (i === currentPage) ? 'active' : '';
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

        // Adiciona um observer para renderizar a tabela quando o tbody for preenchido (no preencherTabela)
        const observer = new MutationObserver((mutationsList, observer) => {
            if (mutationsList.length > 0) {
                currentPage = 1;
                renderTable();
                observer.disconnect();
            }
        });

        const tbody = table.querySelector('tbody');
        if (tbody) {
             observer.observe(tbody, { childList: true });
        } else {
            renderTable();
        }
    }
    
    carregarUsuario();
});