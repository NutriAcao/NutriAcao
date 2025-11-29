import { showPopup } from './modal.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Doações Ativas...');

    // Inicializa os listeners de modal
    setupModalButtons();

    let nomeUsuario = document.getElementById('textNomeUsuario');
    let nomeInstituicao = document.getElementById('textNomeInstituicao');
    let ID_USUARIO = null;
    let ID_EMPRESA = null;

    async function carregarUsuario() {
        try {
            const res = await fetch('/api/usuario');
            const resultado = await res.json();

            if (!resultado || !resultado.success || !resultado.data) {
                throw new Error('Falha ao obter dados do usuário');
            }

            const dados = resultado.data;

            nomeUsuario.innerHTML = dados.nome || 'Usuário';
            nomeInstituicao.innerHTML = dados.nome_fantasia || dados.nome_ong || dados.razao_social || 'Instituição';

            // IDs do usuário e da empresa (obtidos do endpoint /api/usuario)
            ID_USUARIO = dados.id;
            ID_EMPRESA = dados.empresa_id;

            await carregarTodasTabelas();

        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro);
        }
    }

    async function carregarTodasTabelas() {
        try {
            const [
                excedentesCadastrados,
                solicitacoesAndamento,
                excedentesAndamento
            ] = await Promise.all([
                ExcedentesCadastradosEmpresa(ID_EMPRESA),
                SolicitacoesAndamentoEmpresa(ID_EMPRESA),
                ExcedentesAndamentoEmpresa(ID_EMPRESA)
            ]);

            console.log('Excedentes cadastrados:', excedentesCadastrados);
            console.log('Solicitações andamento:', solicitacoesAndamento);
            console.log('Excedentes andamento:', excedentesAndamento);

            preencherTabelaExcedentesCadastrados(excedentesCadastrados);
            preencherTabelaSolicitacoesAndamento(solicitacoesAndamento);
            preencherTabelaExcedentesAndamento(excedentesAndamento);

            configurarPaginacao();

        } catch (erro) {
            console.error('Erro ao carregar tabelas:', erro);
        }
    }

    // --- Funções de Fetch de Dados ---
    async function ExcedentesCadastradosEmpresa(empresaId) {
        try {
            let res = await fetch(`/api/doacoes-ativas/excedentes-cadastrados/${empresaId}`);
            if (!res.ok) throw new Error(`Erro: ${res.status}`);
            return await res.json();
        } catch (erro) {
            console.error('Erro ao carregar excedentes cadastrados:', erro);
            return [];
        }
    }

    async function SolicitacoesAndamentoEmpresa(empresaId) {
        try {
            const res = await fetch(`/api/doacoes-ativas/solicitacoes-andamento/${empresaId}`);
            if (!res.ok) throw new Error(`Erro: ${res.status}`);
            return await res.json();
        } catch (erro) {
            console.error('Erro ao buscar solicitações em andamento:', erro);
            return [];
        }
    }

    async function ExcedentesAndamentoEmpresa(empresaId) {
        try {
            const res = await fetch(`/api/doacoes-ativas/excedentes-andamento/${empresaId}`);
            if (!res.ok) throw new Error(`Erro: ${res.status}`);
            return await res.json();
        } catch (erro) {
            console.error('Erro ao buscar excedentes em andamento:', erro);
            return [];
        }
    }
    function preencherTabelaExcedentesCadastrados(excedentes) {
        const tbody = document.querySelector('#doacoesCadastradasTableEmpresa tbody');
        tbody.innerHTML = '';

        console.log('📦 Excedentes para tabela 1:', excedentes);

        if (!excedentes || !excedentes.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum excedente cadastrado no momento.</td></tr>';
            return;
        }

        excedentes.forEach(item => {
            console.log('📝 Item da tabela 1:', item);
            const tr = document.createElement('tr');
            const statusClass = item.status === 'disponível' ? 'disponivel' :
                item.status === 'reservado' ? 'reservado' : 'concluido';
            const statusText = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A';
            const dataValidade = formatarData(item.data_validade);

            tr.innerHTML = `
            <td>${item.nome_alimento || item.titulo || 'N/A'}</td>
            <td>${item.quantidade || 'N/A'}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>${dataValidade}</td>
            <td>
                <button class="btn-visualizar-pedido" onclick="abrirDetalhesModal(${item.id}, 'excedente-disponivel')">
                    Visualizar
                </button>
            </td>
        `;
            tbody.appendChild(tr);
        });
    }

    function preencherTabelaSolicitacoesAndamento(solicitacoes) {
        const tbody = document.querySelector('#doacoesTableEmpresaPedidosAndamento tbody');
        tbody.innerHTML = '';

        console.log('📋 Solicitações para tabela 2:', solicitacoes);

        if (!solicitacoes || !solicitacoes.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma solicitação em andamento no momento.</td></tr>';
            return;
        }

        solicitacoes.forEach(item => {
            console.log('📝 Item da tabela 2:', item);
            const tr = document.createElement('tr');
            const dataCadastro = formatarData(item.data_cadastro || item.data_criacao);

            tr.innerHTML = `
            <td>${item.nome_alimento || item.titulo || 'N/A'}</td>
            <td>${item.quantidade || item.quantidade_desejada || 'N/A'}</td>
            <td>${dataCadastro}</td>
            <td>${item.nome_ong || item.nomeONG || 'N/A'}</td>
            <td>
                <button class="btn-visualizar-pedido" onclick="abrirDetalhesModal(${item.id}, 'pedido-reservado')">
                    Visualizar Pedido
                </button>
            </td>
        `;
            tbody.appendChild(tr);
            console.log('Item ID:', item.id);
        });
    }

    function preencherTabelaExcedentesAndamento(excedentes) {
        const tbody = document.querySelector('#excedentesAndamentoTableEmpresa tbody');
        tbody.innerHTML = '';

        console.log('🔄 Excedentes para tabela 3:', excedentes);

        if (!excedentes || !excedentes.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum excedente em andamento no momento.</td></tr>';
            return;
        }

        excedentes.forEach(item => {
            console.log('📝 Item da tabela 3:', item);
            const tr = document.createElement('tr');
            const dataValidade = formatarData(item.data_validade);

            tr.innerHTML = `
            <td>${item.nome_alimento || item.titulo || 'N/A'}</td>
            <td>${item.quantidade || 'N/A'}</td>
            <td>${dataValidade}</td>
            <td>${item.nome_ong || 'N/A'}</td>
            <td>
                <button class="btn-visualizar-pedido" onclick="abrirDetalhesModal(${item.id}, 'excedente-reservado')">
                    Visualizar Pedido
                </button>
            </td>
        `;
            tbody.appendChild(tr);
        });
    }
    function formatarData(data) {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    }

    function configurarPaginacao() {
        // Sua lógica de paginação existente
        const tables = [
            {
                searchId: 'searchInputEmpresaExcedentesCadastrados',
                tableId: 'doacoesCadastradasTableEmpresa',
                totalItensId: 'totalItensEmpresaExcedentesCadastrados',
                totalPaginasId: 'totalPaginasEmpresaExcedentesCadastrados',
                paginationId: 'paginationControlsEmpresaExcedentesCadastrados'
            },
            {
                searchId: 'searchInputEmpresaPedidosAndamento',
                tableId: 'doacoesTableEmpresaPedidosAndamento',
                totalItensId: 'totalItensEmpresaPedidosAndamento',
                totalPaginasId: 'totalPaginasEmpresaPedidosAndamento',
                paginationId: 'paginationControlsEmpresaPedidosAndamento'
            },
            {
                searchId: 'searchInputEmpresaExcedentesAndamento',
                tableId: 'excedentesAndamentoTableEmpresa',
                totalItensId: 'totalItensEmpresaExcedentesAndamento',
                totalPaginasId: 'totalPaginasEmpresaExcedentesAndamento',
                paginationId: 'paginationControlsEmpresaExcedentesAndamento'
            }
        ];

        tables.forEach(config => {
            setupTable(config.searchId, config.tableId, config.totalItensId, config.totalPaginasId, config.paginationId);
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
// --- Funções de Modal Melhoradas ---
function openModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal && typeof modal.showModal === 'function') {
            modal.showModal();
            console.log(`✅ Modal ${modalId} aberto`);
        } else {
            console.error(`❌ Modal ${modalId} não encontrado ou showModal não é função`);
        }
    } catch (error) {
        console.error(`❌ Erro ao abrir modal ${modalId}:`, error);
    }
}

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal && typeof modal.close === 'function') {
            modal.close();
            console.log(`✅ Modal ${modalId} fechado`);
        } else {
            console.error(`❌ Modal ${modalId} não encontrado ou close não é função`);
        }
    } catch (error) {
        console.error(`❌ Erro ao fechar modal ${modalId}:`, error);
    }
}
// ===================================================
// LÓGICA DO MODAL - VERSÃO ATUALIZADA
// ===================================================
async function abrirDetalhesModal(id, tipo) {
    console.log(`🔍 Abrindo modal: ID ${id}, Tipo ${tipo}`);

    try {
        let endpoint = '';
        if (tipo === 'excedente-disponivel') {
            endpoint = `/api/doacoes-ativas/detalhes/excedente-disponivel/${id}`;
        } else if (tipo === 'pedido-reservado') {
            endpoint = `/api/doacoes-ativas/detalhes/solicitacao/${id}`;
        } else if (tipo === 'excedente-reservado') {
            endpoint = `/api/doacoes-ativas/detalhes/excedente/${id}`;
        } else {
            showPopup('Tipo de item desconhecido!', { title: 'Erro', type: 'error', okText: 'OK' });
            return;
        }

        console.log('📡 Endpoint:', endpoint);

        // Elementos do modal
        const modalTitle = document.getElementById('modalTitle');
        const orderIdSpan = document.getElementById('orderId');
        const modalDetails = document.getElementById('modalDetails');
        const itemsList = document.getElementById('itemsList');
        const btnConcluir = document.getElementById('btnConcluir');
        const btnCancelar = document.getElementById('btnCancelar');

        console.log('🔍 Elementos encontrados:', {
            modalTitle: !!modalTitle,
            orderIdSpan: !!orderIdSpan,
            modalDetails: !!modalDetails,
            itemsList: !!itemsList,
            btnConcluir: !!btnConcluir,
            btnCancelar: !!btnCancelar
        });

        // Limpa o modal
        modalTitle.innerHTML = `Carregando Detalhes... <span id="orderId">#${id}</span>`;
        modalDetails.innerHTML = '<p>Carregando...</p>';
        itemsList.innerHTML = '';
        btnConcluir.style.display = 'none';
        btnCancelar.style.display = 'none';

        // Abre o modal primeiro
        openModal('orderModal');

        // Busca os dados
        console.log('🔄 Fazendo requisição...');
        const res = await fetch(endpoint);
        console.log('📊 Status da resposta:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Erro na resposta:', errorText);
            throw new Error(`Erro ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('✅ Dados recebidos:', data);

        // AGORA PREENCHE O MODAL COM OS DADOS
        modalTitle.innerHTML = `Detalhes <span id="orderId">#${id}</span>`;

        // Conteúdo baseado no tipo
        if (tipo === 'excedente-disponivel') {
            modalDetails.innerHTML = `
                <p><strong>Alimento:</strong> <span>${data.nome_alimento || 'N/A'}</span></p>
                <p><strong>Quantidade:</strong> <span>${data.quantidade || 'N/A'} Kg</span></p>
                <p><strong>Data de Validade:</strong> <span>${formatarData(data.data_validade)}</span></p>
                <p><strong>Status:</strong> <span class="status ${data.status}">${data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'N/A'}</span></p>
                <p><strong>Data de Cadastro:</strong> <span>${formatarData(data.data_cadastro || data.data_publicacao)}</span></p>
                ${data.descricao ? `<p><strong>Descrição:</strong> <span>${data.descricao}</span></p>` : ''}
            `;

            btnCancelar.style.display = 'inline-block';
            btnCancelar.textContent = 'Cancelar Excedente';
            btnCancelar.onclick = () => {
                confirmarAcao('cancelar-excedente', id, 'excedente', 'cancelar este excedente');
            };

        } else if (tipo === 'pedido-reservado') {
            modalDetails.innerHTML = `
                <p><strong>ONG:</strong> <span>${data.nome_ong || 'N/A'}</span></p>
                <p><strong>Alimento Solicitado:</strong> <span>${data.nome_alimento || data.titulo || 'N/A'}</span></p>
                <p><strong>Quantidade:</strong> <span>${data.quantidade || data.quantidade_desejada || 'N/A'} Kg</span></p>
                <p><strong>Data da Solicitação:</strong> <span>${formatarData(data.data_cadastro || data.data_criacao)}</span></p>
                <p><strong>Contato da ONG:</strong> <span>${data.telefone_ong || data.telefone_contato || 'N/A'}</span></p>
                <p><strong>Email da ONG:</strong> <span>${data.email_ong || data.email_contato || 'N/A'}</span></p>
                <p><strong>Responsável:</strong> <span>${data.nome_responsavel || 'N/A'}</span></p>
                <p><strong>Status:</strong> <span class="status ${data.status}">${data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'N/A'}</span></p>
                ${data.descricao ? `<p><strong>Descrição:</strong> <span>${data.descricao}</span></p>` : ''}
            `;

            btnConcluir.style.display = 'inline-block';
            btnCancelar.style.display = 'inline-block';
            btnConcluir.textContent = 'Concluir Pedido';
            btnCancelar.textContent = 'Cancelar Pedido';

            btnConcluir.onclick = () => {
                confirmarAcao('concluir-pedido', id, 'pedido', 'concluir este pedido');
            };
            btnCancelar.onclick = () => {
                confirmarAcao('cancelar-pedido', id, 'pedido', 'cancelar este pedido');
            };

        } else if (tipo === 'excedente-reservado') {
            modalDetails.innerHTML = `
                <p><strong>ONG que Reservou:</strong> <span>${data.nome_ong || 'N/A'}</span></p>
                <p><strong>Alimento:</strong> <span>${data.nome_alimento || data.titulo || 'N/A'}</span></p>
                <p><strong>Quantidade:</strong> <span>${data.quantidade || 'N/A'} Kg</span></p>
                <p><strong>Data de Validade:</strong> <span>${formatarData(data.data_validade)}</span></p>
                <p><strong>Contato da ONG:</strong> <span>${data.telefone_ong || data.telefone_contato || 'N/A'}</span></p>
                <p><strong>Email da ONG:</strong> <span>${data.email_ong || data.email_contato || 'N/A'}</span></p>
                <p><strong>Responsável:</strong> <span>${data.nome_responsavel || 'N/A'}</span></p>
                <p><strong>Status:</strong> <span class="status ${data.status}">${data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'N/A'}</span></p>
                ${data.descricao ? `<p><strong>Descrição:</strong> <span>${data.descricao}</span></p>` : ''}
            `;

            btnConcluir.style.display = 'inline-block';
            btnCancelar.style.display = 'inline-block';
            btnConcluir.textContent = 'Concluir Doação';
            btnCancelar.textContent = 'Cancelar Doação';

            btnConcluir.onclick = () => {
                confirmarAcao('concluir-doacao', id, 'doacao', 'concluir esta doação');
            };
            btnCancelar.onclick = () => {
                confirmarAcao('cancelar-doacao', id, 'doacao', 'cancelar esta doação');
            };
        }

        // Preenche a tabela de itens
        itemsList.innerHTML = `
            <tr>
                <td>${data.nome_alimento || data.titulo || 'N/A'}</td>
                <td>${data.quantidade || data.quantidade_desejada || 'N/A'}</td>
                <td>Kg</td>
                <td>${data.descricao || data.observacoes || '-'}</td>
            </tr>
        `;

        console.log('✅ Modal preenchido com sucesso!');

    } catch (erro) {
        console.error("❌ Erro ao abrir modal:", erro);

        // Tenta mostrar o erro no modal
        try {
            const modalDetails = document.getElementById('modalDetails');
            if (modalDetails) {
                modalDetails.innerHTML = `<p style="color: red;">Erro: ${erro.message}</p>`;
            }
        } catch (e) {
            console.error('Erro ao mostrar erro no modal:', e);
        }

        showPopup(`Erro ao carregar detalhes: ${erro.message}`, { title: 'Erro', type: 'error', okText: 'OK' });
    }
}
// --- Função de Confirmação de Ação ---
function confirmarAcao(acao, id, tipo, mensagem) {
    console.log(`⚠️ Confirmando ação: ${acao} para ID ${id}`);

    // Fecha o modal de detalhes
    closeModal('orderModal');

    // Prepara o modal de confirmação
    const btnConfirmar = document.getElementById('btnConfirmarAcao');
    document.getElementById('confirmMessage').innerHTML = `Tem certeza que deseja <strong>${mensagem}</strong>?`;

    // Atualiza o texto do botão de confirmação
    const textoBotao = acao.includes('cancelar') ? 'Sim, Cancelar' : 'Sim, Concluir';
    btnConfirmar.textContent = textoBotao;
    btnConfirmar.className = acao.includes('cancelar') ? 'btn-cancel' : 'btn-success';

    // Define o que o botão "Sim" fará
    btnConfirmar.onclick = () => {
        executarAcao(acao, id, tipo);
    };

    // Abre o modal de confirmação
    openModal('confirmModal');
}

// --- Função de Execução da Ação ---
async function executarAcao(acao, id, tipo) {
    console.log(`🚀 Executando ação: ${acao} para ID ${id}`);

    // Fecha o modal de confirmação
    closeModal('confirmModal');

    // Define o endpoint baseado na ação
    const endpoint = `/api/doacoes-ativas/${acao}/${id}`;

    try {
        let method = 'PUT';
        if (acao === 'cancelar-excedente') {
            method = 'DELETE';
        }

        const res = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        if (res.ok) {
            showPopup(`✅ ${data.message || 'Ação realizada com sucesso!'}`, { title: 'Sucesso', type: 'success', okText: 'OK' });
            window.location.reload(); // Recarrega a página para atualizar as tabelas
        } else {
            showPopup(`❌ Falha ao realizar ação: ${data.message || 'Erro desconhecido.'}`, { title: 'Erro', type: 'error', okText: 'OK' });
        }

    } catch (error) {
        console.error(`❌ Erro na requisição de ${acao}:`, error);
        showPopup(`❌ Erro de comunicação com o servidor. Tente novamente.`, { title: 'Erro', type: 'error', okText: 'OK' });
    }
}

// --- Função Auxiliar para Formatar Data ---
function formatarData(data) {
    if (!data) return 'N/A';
    try {
        return new Date(data).toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}
function setupModalButtons() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-visualizar-pedido')) {
            e.preventDefault();
            e.stopPropagation();

            const button = e.target;
            const id = button.getAttribute('data-id');
            const tipo = button.getAttribute('data-tipo');

            if (id && tipo) {
                // Desabilita o botão temporariamente
                button.disabled = true;
                button.style.opacity = '0.6';

                setTimeout(() => {
                    button.disabled = false;
                    button.style.opacity = '1';
                }, 2000);

                abrirDetalhesModal(parseInt(id), tipo);
            }
        }
    });
}
// --- Expõe as funções para o HTML ---
window.abrirDetalhesModal = abrirDetalhesModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.addEventListener('error', function (e) {
    if (e.message.includes('modal') || e.message.includes('null')) {
        console.error('❌ Erro global detectado, recarregando página...', e);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
});