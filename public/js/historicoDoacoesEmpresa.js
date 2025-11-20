// public/js/historicoDoacoesEmpresa.js

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let historicoCompleto = []; 
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadHistorico(); 
    setupSearch();
    setupPaginationListeners();
});

async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarioToken');
        if (!res.ok) throw new Error('Falha ao buscar usuário');
        dadosUsuario = await res.json();
        document.getElementById('textNomeUsuario').innerHTML = dadosUsuario.nome || 'Usuário';
        document.getElementById('textNomeInstituicao').innerHTML = dadosUsuario.nomeInstituicao || 'Empresa';
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
    }
}

// === CARREGAMENTO DE DADOS (BACKEND) ===
async function loadHistorico() {
    try {
        // Rota unificada para buscar histórico (Concluído e Cancelado)
        const response = await fetch('/api/meu-historico'); 
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        historicoCompleto = await response.json();
        renderizarTabela(historicoCompleto);
        setupPagination(historicoCompleto.length);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        alert('Falha ao carregar seu histórico de doações. Tente novamente.');
    }
}

function renderizarTabela(historico) {
    const tbody = document.getElementById('historicoTableBody'); 
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (historico.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum registro no histórico.</td></tr>';
        return;
    }
    
    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const historicoPaginado = historico.slice(startIndex, endIndex);

    historicoPaginado.forEach(item => {
        // O campo 'tipo' deve vir do backend: 'doacao' (Empresa criou) ou 'pedido' (Empresa reservou)
        const tipoItem = item.tipo_item === 'doacao' ? 'Doação' : 'Pedido';
        // O campo de parceiro deve ser adaptado dependendo do item
        const nomeParceiro = item.nome_parceiro || item.nomeONG || item.nome_ong_reserva || 'N/A';
        
        const dataConclusao = item.data_conclusao ? new Date(item.data_conclusao).toLocaleDateString('pt-BR') : 'N/A';
        
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td> 
                <td>${nomeParceiro}</td> 
                <td>${tipoItem}</td>
                <td><span class="status ${String(item.status).toLowerCase()}">${item.status}</span></td>
                <td>${dataConclusao}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(historico.length);
    updateCurrentPageDisplay();
}

// === PESQUISA E PAGINAÇÃO ===
function updateItemCount(total) {
    const el = document.getElementById('totalItens');
    if (el) el.textContent = total;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        const historicoFiltrado = historicoCompleto.filter(item => 
            (item.nome_alimento && item.nome_alimento.toLowerCase().includes(searchText)) ||
            (item.nome_parceiro && item.nome_parceiro.toLowerCase().includes(searchText)) ||
            (item.nomeONG && item.nomeONG.toLowerCase().includes(searchText))
        );
        
        currentPage = 1; 
        renderizarTabela(historicoFiltrado);
        setupPagination(historicoFiltrado.length);
    });
}

function setupPagination(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const el = document.getElementById('totalPaginas');
    if (el) el.textContent = totalPaginas;
    
    // Guarda o total de itens para o controle de página
    document.body.dataset.totalItems = totalItems; 
}

function updateCurrentPageDisplay() {
    const el = document.getElementById('paginaAtual');
    if (el) el.textContent = currentPage;
}

function setupPaginationListeners() {
    const totalItems = parseInt(document.body.dataset.totalItems) || 0;
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);

    document.getElementById('btnAnterior').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadHistorico(); // Recarrega/re-renderiza a tabela
        }
    });

    document.getElementById('btnProximo').addEventListener('click', () => {
        if (currentPage < totalPaginas) {
            currentPage++;
            loadHistorico(); // Recarrega/re-renderiza a tabela
        }
    });
}