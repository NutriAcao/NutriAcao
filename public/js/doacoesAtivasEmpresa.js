// Arquivo: doacoesAtivasEmpresa.js (VERSÃO ATUALIZADA COMPLETA)

document.addEventListener('DOMContentLoaded', function() {

    let nomeUsuario = document.getElementById('textNomeUsuario');
    let nomeInstituicao = document.getElementById('textNomeInstituicao');
    
    // --- Armazena o ID do usuário globalmente ---
    let ID_USUARIO_LOGADO = null;

    async function carregarUsuario() {
        try {
            const res = await fetch('/api/usuarioToken');
            const dados = await res.json();

            nomeUsuario.innerHTML = dados.nome;
            nomeInstituicao.innerHTML = dados.nomeInstituicao;
            
            // --- Salva o ID do usuário ---
            ID_USUARIO_LOGADO = dados.id;

            //Importa os dados em forma de lista para popular as tabelas
            const excedentesCadastrados = await ExcedentesCadastradosEmpresa(ID_USUARIO_LOGADO);
            const listaExcedentesAndamentoEmpresa = await excedentesAndamentoEmpresa(ID_USUARIO_LOGADO);
            const listaSolicitacoesAndamentoEmpresa = await solicitacoesAndamentoEmpresa(ID_USUARIO_LOGADO);
        
            // ... (IDs das tabelas, inputs, etc.) ...
            const tableIdExcedentesCadastrados = 'doacoesCadastradasTableEmpresa';
            const searchInputIdExcedentesCadastrados ='searchInputEmpresaExcedentesCadastrados';
            const totalItensIdExcedentesCadastrados ='totalItensEmpresaExcedentesCadastrados';
            const totalPaginasIdExcedentesCadastrados = 'totalPaginasEmpresaExcedentesCadastrados';
            const paginationControlsIdExcedentesCadastrados = 'paginationControlsEmpresaExcedentesCadastrados';
            const tableIdPedidosAndamento = 'doacoesTableEmpresaPedidosAndamento';
            const searchInputIdPedidosAndamento ='searchInputEmpresaPedidosAndamento';
            const totalItensIdPedidosAndamento ='totalItensEmpresaPedidosAndamento';
            const totalPaginasIdPedidosAndamento = 'totalPaginasEmpresaPedidosAndamento';
            const paginationControlsIdPedidosAndamento = 'paginationControlsEmpresaPedidosAndamento';
            const tableIdExcedentesAndamento = 'excedentesAndamentoTableEmpresa';
            const searchInputIdExcedentesAndamento ='searchInputEmpresaExcedentesAndamento';
            const totalItensIdExcedentesAndamento ='totalItensEmpresaExcedentesAndamento';
            const totalPaginasIdExcedentesAndamento = 'totalPaginasEmpresaExcedentesAndamento';
            const paginationControlsIdExcedentesAndamento = 'paginationControlsEmpresaExcedentesAndamento';

            document.getElementById(tableIdExcedentesCadastrados).style.display = 'table'; 
            document.getElementById(tableIdPedidosAndamento).style.display = 'table'; 
            document.getElementById(tableIdExcedentesAndamento).style.display = 'table'; 

            // Preenche as 3 tabelas
            preencherTabelaComDoacoesEmpresa(excedentesCadastrados, tableIdExcedentesCadastrados);
            preencherTabelaComSolicitacoesAndamentoEmpresa(listaSolicitacoesAndamentoEmpresa, tableIdPedidosAndamento);
            preencherTabelaComExcedentesAndamentoEmpresa(listaExcedentesAndamentoEmpresa, tableIdExcedentesAndamento);

            // Configura paginação/busca para as 3 tabelas
            setupTable(searchInputIdExcedentesCadastrados, tableIdExcedentesCadastrados, totalItensIdExcedentesCadastrados, totalPaginasIdExcedentesCadastrados, paginationControlsIdExcedentesCadastrados);
            setupTable(searchInputIdPedidosAndamento, tableIdPedidosAndamento, totalItensIdPedidosAndamento, totalPaginasIdPedidosAndamento, paginationControlsIdPedidosAndamento);
            setupTable(searchInputIdExcedentesAndamento, tableIdExcedentesAndamento, totalItensIdExcedentesAndamento, totalPaginasIdExcedentesAndamento, paginationControlsIdExcedentesAndamento );

        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro);
        }
    }

    // --- Funções de Fetch de Dados (sem alteração) ---
    async function ExcedentesCadastradosEmpresa(id) {
        try {
            let res = await fetch(`/doacoesConcluidasEmpresa/doacoesEmpresa?id=${encodeURIComponent(id)}`);
            const doacoes = await res.json();
            return doacoes; 
        } catch (erro) {
            console.error('Erro ao carregar doações disponíveis:', erro);
            return []; 
        }
    }

    async function solicitacoesAndamentoEmpresa(id) {
        try {
            const res = await fetch(`/doacoesConcluidasEmpresa/doacoesSolicitadasEmpresa?id=${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
            const dados = await res.json();
            return dados;
        } catch (erro) {
            console.error('Erro ao buscar pedidos em andamento da empresa:', erro);
            return []; 
        }
    }


    async function excedentesAndamentoEmpresa(id) {
        try {
            const res = await fetch(`/doacoesConcluidasEmpresa/excedentesReservadosEmpresa1?id=${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
            const dados = await res.json();
            return dados;
        } catch (erro) {
            console.error('Erro ao buscar excedentes reservados:', erro);
            return []; 
        }
    }

    // --- Funções de Preenchimento de Tabela (ATUALIZADAS com botões azuis) ---

    function preencherTabelaComDoacoesEmpresa(doacoes, tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = ''; 
        if (!doacoes.length) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhum excedente cadastrado no momento.</td></tr>';
            return;
        }
        doacoes.forEach(item => {
            const tr = document.createElement('tr');
            const statusClass = item.status === 'disponível' ? 'disponivel' : 'reservado';
            const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
            
            tr.innerHTML = `
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-visualizar-pedido" onclick="abrirDetalhesModal(${item.id}, 'excedente-disponivel')">
                        Visualizar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function preencherTabelaComSolicitacoesAndamentoEmpresa(doacoes, tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = ''; 
        if (!doacoes.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma solicitação em andamento no momento.</td></tr>';
            return;
        }
        doacoes.forEach(item => {
            const tr = document.createElement('tr');
            let data = item.dataCadastroSolicitacao.split('-').reverse().join('/');
            tr.innerHTML = `
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td>
                <td>${data}</td>
                <td>${item.nomeONG}</td>
                <td>
                    <button class="btn-visualizar-pedido" onclick="abrirDetalhesModal(${item.id}, 'pedido-reservado')">
                        Visualizar Pedido
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function preencherTabelaComExcedentesAndamentoEmpresa(doacoes, tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = ''; 
        if (!doacoes.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum excedente em andamento no momento.</td></tr>';
            return;
        }
        doacoes.forEach(item => {
            const tr = document.createElement('tr');
            let data = item.data_validade.split('-').reverse().join('/');
            console.log(item)
            tr.innerHTML = `
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td>
                <td>${data}</td>
                <td>${item.ong?.nome || 'ONG não identificada'}</td>
                <td>
                    <button class="btn-visualizar-pedido" onclick="abrirDetalhesModal(${item.id}, 'excedente-reservado')">
                        Visualizar Pedido
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- (Função de Paginação/Busca - Sem alteração) ---
    function setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId) {
        // ... (seu código original de setupTable - sem mudanças)
        const searchInput = document.getElementById(searchInputId);
        const table = document.getElementById(tableId);
        const totalItens = document.getElementById(totalItensId);
        const totalPaginas = document.getElementById(totalPaginasId);
        const paginationControls = document.getElementById(paginationControlsId);

        let currentPage = 1;
        const itemsPerPage = 10;
        
        const searchInputElements = document.querySelectorAll(`#${searchInputId}`);
        const currentSearchInput = searchInputElements.length > 1 ? Array.from(searchInputElements).find(input => input.closest('.card').querySelector(`#${tableId}`)) : searchInputElements[0];
        
        if (!table || !currentSearchInput) return; 

        function getRows() {
            return Array.from(table.querySelectorAll('tbody tr'));
        }

        function renderTable() {
            const rows = getRows().filter(row => row.children.length > 1);
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

// ===================================================
// LÓGICA DO MODAL
// ===================================================

// --- Funções Auxiliares de Modal ---
const orderModal = document.getElementById('orderModal');
const confirmModal = document.getElementById('confirmModal');

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.showModal();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.close();
}

// --- Função Principal de Abertura ---
async function abrirDetalhesModal(id, tipo) {
    console.log('abriu')
    // Define o endpoint de busca de detalhes (depende das rotas que criamos acima)
    let endpoint = '';
    if (tipo === 'excedente-disponivel' || tipo === 'excedente-reservado') {
        endpoint = `/doacoesConcluidasEmpresa/detalhes/excedente/${id}`;
    } else if (tipo === 'pedido-reservado') {
        endpoint = `/doacoesConcluidasEmpresa/detalhes/solicitacao/${id}`;
    } else {
        alert('Tipo de item desconhecido!');
        return;
    }

    // Seleciona os elementos do modal
    const modalTitle = document.getElementById('modalTitle');
    const orderIdSpan = document.getElementById('orderId');
    const modalDetails = document.getElementById('modalDetails');
    const itemsList = document.getElementById('itemsList');
    const btnConcluir = document.getElementById('btnConcluir');
    const btnCancelar = document.getElementById('btnCancelar');


    //PROCURANDO AMERDA DO ERRO
    if (!orderModal || !modalTitle || !orderIdSpan || !modalDetails) {
        console.error("Erro: Elementos essenciais do modal não encontrados. Verifique os IDs no HTML.");
        return; // Impede a execução do resto do código que causaria o erro null.
    }
    
    // Limpa o modal e mostra "carregando"
   modalTitle.firstChild.textContent = 'Carregando Detalhes... '; 
    orderIdSpan.textContent = `#${id}`; 
    modalDetails.innerHTML = '<p>Carregando...</p>';
    itemsList.innerHTML = '';
    btnConcluir.style.display = 'none';
    btnCancelar.style.display = 'none';

    // Abre o modal
    openModal('orderModal'); // A abertura do modal é feita no início para o usuário ver o carregamento

    try {
        const res = await fetch(endpoint);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Falha ao buscar detalhes.');
        }
        
        const data = await res.json();
        console.log("Detalhes recebidos:", data); // Verifique no console do navegador se os dados estão completos

        // Popula o modal com os detalhes
        // O objeto 'data' agora deve incluir um campo 'ong' com nome, email e telefone se for reservado
        const ong = data.ong || { 
            nome: data.NomeEmpresa || data.nomeONG || 'N/A', 
            telefone: data.telefone_contato || 'N/A', 
            email: data.email_contato || 'N/A' 
        };
        const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1);
        
        modalTitle.firstChild.textContent = 'Detalhes '; // Altera SÓ o texto
        orderIdSpan.textContent = `#${id}`; 
        // Ponto de Correção: Preenchendo o HTML DENTRO de modalDetails
        modalDetails.innerHTML = `
            <p><strong>Instituição:</strong> <span>${ong.nome || 'N/A'}</span></p>
            <p><strong>Status:</strong> <span class="status ${data.status}">${statusText}</span></p>
            <p><strong>Data Cadastro:</strong> <span>${new Date(data.data_cadastro || data.dataCadastroSolicitacao || data.dataCadastroDoacao).toLocaleDateString('pt-BR')}</span></p>
            <p><strong>Contato:</strong> <span>${ong.telefone || 'N/A'}</span></p>
            <p><strong>Email:</strong> <span>${ong.email || 'N/A'}</span></p>
        `;
        
        // Ponto de Correção: Preenchendo a lista de itens
        itemsList.innerHTML = `
            <tr>
                <td>${data.nome_alimento}</td>
                <td>${data.quantidade}</td>
                <td>Kg</td>
                <td>${data.observacoes || '-'}</td>
            </tr>
        `;

        // Controla quais botões de ação aparecem e suas funções
        if (tipo === 'excedente-disponivel') {
            // Tabela 1: Excedente Disponível -> Nenhuma ação.
            
        } else if (tipo === 'pedido-reservado') {
            // Tabela 2: Pedido de ONG que EU reservei -> Ações: Concluir e Cancelar
            btnConcluir.style.display = 'inline-block';
            btnCancelar.style.display = 'inline-block';
            btnConcluir.textContent = 'Concluir Pedido';
            
            // Note que aqui o TIPO é 'pedido' para o backend
            btnConcluir.onclick = () => {
                confirmarAcao('concluir-pedido', id, 'pedido', 'concluir este pedido');
            };
            btnCancelar.onclick = () => {
                confirmarAcao('cancelar-reserva', id, 'pedido', 'cancelar esta reserva');
            };

        } else if (tipo === 'excedente-reservado') {
            // Tabela 3: Meu Excedente que uma ONG reservou -> Ações: Concluir e Cancelar
            btnConcluir.style.display = 'inline-block';
            btnCancelar.style.display = 'inline-block';
            btnConcluir.textContent = 'Concluir Doação';

            // Note que aqui o TIPO é 'doacao' para o backend
            btnConcluir.onclick = () => {
                confirmarAcao('concluir-doacao', id, 'doacao', 'concluir esta doação');
            };
            btnCancelar.onclick = () => {
                confirmarAcao('cancelar-reserva', id, 'doacao', 'cancelar esta reserva');
            };
        }

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
        modalDetails.innerHTML = `<p style="color: red;">Erro ao carregar detalhes: ${erro.message}. Verifique as rotas da API no backend.</p>`;
    }
}

function confirmarAcao(acao, id, tipo, mensagem) {
    // 1. Fecha o modal de detalhes
    closeModal('orderModal');
    
    // 2. Prepara o modal de confirmação
    const btnConfirmar = document.getElementById('btnConfirmarAcao');
    document.getElementById('confirmMessage').innerHTML = `Tem certeza que deseja **${mensagem}**?`;
    
    // Atualiza o texto do botão de confirmação
    btnConfirmar.textContent = acao.includes('cancelar') ? 'Sim, Cancelar' : 'Sim, Concluir';
    
    // 3. Define o que o botão "Sim" fará
    btnConfirmar.onclick = () => {
        executarAcao(acao, id, tipo);
    };
    
    // 4. Abre o modal de confirmação
    openModal('confirmModal');
}

async function executarAcao(acao, id, tipo) {
    // 1. Fecha o modal de confirmação
    closeModal('confirmModal');
    
    // 2. Define o endpoint e o body da requisição
    // (Chama as rotas em reservaRoutes.js)
    const endpoint = `/api/${acao}`; // Ex: /api/concluir-doacao ou /api/cancelar-reserva
    
    const bodyData = {
        doacao_id: tipo === 'doacao' ? id : undefined,
        pedido_id: tipo === 'pedido' ? id : undefined,
        item_id: id, 
        tipo_item: tipo // 'doacao' ou 'pedido'
    };
    
    try {
        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
                // O cookie de token é enviado automaticamente
            },
            body: JSON.stringify(bodyData)
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || `Ação realizada com sucesso!`);
            window.location.reload(); // Recarrega a página para atualizar as tabelas
        } else {
            alert(`Falha ao realizar ação: ${data.message || 'Erro desconhecido.'}`);
        }

    } catch (error) {
        console.error(`Erro na requisição de ${acao}:`, error);
        alert(`Erro de comunicação com o servidor. Tente novamente.`);
    }
}

// --- Expõe as funções para o HTML ---
window.abrirDetalhesModal = abrirDetalhesModal;
window.openModal = openModal;
window.closeModal = closeModal;