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

            let email_usuario = dados.email;
            let tipo_usuario = dados.tipo;

            if (tipo_usuario === 'empresa') {
                // 1. Carregar Excedentes Cadastrados (Doações Ativas da Empresa)
                // Endpoint sugerido: /doacoesAtivasEmpresa/cadastradas?email=...
                const excedentes = await carregarDadosAtivos(email_usuario, 'cadastrados');
                preencherTabela(excedentes, 'doacoesTableCadastradas', 'empresa');
                setupTable('searchInputEmpresa', 'doacoesTableCadastradas', 'totalItensCadastradas', 'totalPaginasCadastradas', 'paginationControlsCadastradas'); // Ajuste os IDs conforme seu HTML

                // 2. Carregar Pedidos em Andamento (Reservas Ativas para a Empresa)
                // Endpoint sugerido: /doacoesAtivasEmpresa/reservas?email=...
                const pedidos = await carregarDadosAtivos(email_usuario, 'pedidos');
                preencherTabela(pedidos, 'doacoesTablePedidos', 'empresa');
                setupTable('searchInputEmpresa', 'doacoesTablePedidos', 'totalItensPedidos', 'totalPaginasPedidos', 'paginationControlsPedidos'); // Ajuste os IDs conforme seu HTML
            } else {
                // Se for ONG, esta lógica será tratada no doacoesAtivasOng.js
            }

        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro);
        }
    }

    async function carregarDadosAtivos(email, tipoDados) {
    try {
        let endpoint;

        if (tipoDados === 'cadastrados') {
            // Rota para os EXCEDENTES que a EMPRESA TEM ATIVOS (não concluídos/cancelados)
            endpoint = `/doacoesAtivasEmpresa/cadastradas?email=${encodeURIComponent(email)}`;
        } else if (tipoDados === 'pedidos') {
            // Rota para os PEDIDOS/RESERVAS feitos POR ONGs NAS doações desta EMPRESA
            endpoint = `/doacoesAtivasEmpresa/reservas?email=${encodeURIComponent(email)}`;
        } else {
            return [];
        }

            const res = await fetch(endpoint);

            if (!res.ok) {
                // Lança erro se a resposta HTTP não for 200 OK
                throw new Error(`Erro HTTP! Status: ${res.status}`);
            }

            const dados = await res.json();

            console.log(`Dados ativos (${tipoDados}):`, dados);
            return dados;
        } catch (erro) {
            console.error(`Erro ao carregar dados ativos (${tipoDados}):`, erro);
            return [];
        }
    }

    // FUNÇÃO ATUALIZADA para preencher a tabela com STATUS e AÇÕES
    function preencherTabela(dados, tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = ''; // Limpa a tabela

        // Define o número de colunas para o colspan em caso de tabela vazia
        const colspan = tableId === 'doacoesTablePedidos' ? 6 : 5; 

        if (dados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colspan}">Nenhum item ativo encontrado.</td></tr>`;
            return;
        }

        dados.forEach(item => {
            const tr = document.createElement('tr');
            
            // Cria a classe para o status (útil para estilizar via CSS)
            const statusClass = (item.status || 'desconhecido').toLowerCase();

            if (tableId === 'doacoesTableCadastradas') {
                // Tabela de Excedentes Cadastrados (5 colunas)
                // O backend deve retornar: id, nome_alimento, quantidade, status
                tr.innerHTML = `
                  <td>${item.id}</td>
                  <td>${item.nome_alimento}</td>
                  <td>${item.quantidade}</td>
                  <td><span class="status ${statusClass}">${item.status || 'Disponível'}</span></td>
                  <td><button class="btn-acao" onclick="visualizarDetalhesEmpresa(${item.id})">Visualizar</button></td>
                `;
            } else if (tableId === 'doacoesTablePedidos') {
                // Tabela de Pedidos em Andamento (6 colunas)
                // O backend deve retornar: id_reserva, nome_alimento, quantidade_reservada, nome_ong, status
                tr.innerHTML = `
                  <td>${item.id_reserva}</td>
                  <td>${item.nome_alimento}</td>
                  <td>${item.quantidade_reservada}</td>
                  <td>${item.nome_ong}</td>
                  <td><span class="status ${statusClass}">${item.status || 'Pendente'}</span></td>
                  <td><button class="btn-acao" onclick="visualizarDetalhesReserva(${item.id_reserva})">Visualizar Pedido</button></td>
                `;
            }
            
            tbody.appendChild(tr);
        });
    }

    // Funções de ação (devem estar acessíveis globalmente ou via event listeners)
    window.visualizarDetalhesEmpresa = function(id) {
        alert('Ação: Abrir detalhes da Doação/Excedente ID: ' + id);
        // Implementação real: window.location.href = `/detalhesExcedente.html?id=${id}`;
    };

    window.visualizarDetalhesReserva = function(id) {
        alert('Ação: Abrir detalhes do Pedido/Reserva ID: ' + id);
        // Implementação real: window.location.href = `/detalhesReserva.html?id=${id}`;
    };


    // Função setupTable (mantida, pois a lógica de filtro/paginação é genérica)
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