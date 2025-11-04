// public/js/visualizacaoOngs.js
// VERSÃO FINAL CORRIGIDA

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let pedidosReais = []; // Armazena os dados reais vindos do backend
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadPedidosDisponiveis(); // Carrega os dados reais do backend

    // Configura os listeners de pesquisa e paginação
    setupSearch();
    // setupPaginationListeners(); // Você precisa implementar a lógica completa de paginação
});

// Carrega dados do usuário logado (Empresa)
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
// Busca os pedidos das ONGs no backend
async function loadPedidosDisponiveis() {
    try {
        // Rota que criamos no dbRoutes.js para a Empresa ver pedidos de ONGs
        const response = await fetch('/api/pedidos-disponiveis-empresa'); 
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        
        const pedidos = await response.json();
        pedidosReais = pedidos; // Salva os dados globalmente
        
        renderizarTabela(pedidos); // Desenha a tabela com dados reais
        setupPagination(pedidos.length); // Configura a paginação com base nos dados reais
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        alert('Falha ao carregar pedidos de doação. Tente novamente.');
    }
}

// Desenha a tabela no HTML
function renderizarTabela(pedidos) {
    const tbody = document.querySelector('#doacoesTable tbody');
    tbody.innerHTML = ''; // Limpa a tabela (remove os dados fictícios do HTML)

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    }
    
    // Filtra os pedidos para a página atual (Simplificado)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pedidosPaginados = pedidos.slice(startIndex, endIndex);

    pedidosPaginados.forEach(pedido => {
        // Usando os nomes de coluna corrigidos que vêm do ALIAS do SQL
        const dataFormatada = new Date(pedido.data_solicitacao).toLocaleDateString('pt-BR');
        
        const row = `
            <tr>
                <td>${pedido.id}</td>
                <td>${pedido.nome_alimento}</td>
                <td>${pedido.quantidade}</td> 
                <td>${pedido.nome_ong}</td>
                <td>${dataFormatada}</td>
                <td><span class="status ${String(pedido.status).toLowerCase()}">${pedido.status}</span></td>
                <td><button onclick="openModal(${pedido.id})">Visualizar Pedido</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(pedidos.length);
}

// === MODAL E AÇÕES (RESERVAR / CANCELAR) ===

// Abre a modal com dados REAIS
function openModal(pedidoId) {
    const modal = document.getElementById('orderModal');
    const pedido = pedidosReais.find(p => p.id === pedidoId);
    
    if (pedido) {
        // Preenche a modal
        document.getElementById('orderId').textContent = pedido.id;
        document.getElementById('orderDate').textContent = new Date(pedido.data_solicitacao).toLocaleDateString('pt-BR');
        document.getElementById('institution').textContent = pedido.nome_ong;
        document.getElementById('contact').textContent = pedido.telefone_contato; // Usando o ALIAS
        document.getElementById('address').textContent = 'Entrar em contato com a ONG';
        
        // Status
        const statusElement = document.getElementById('orderStatus');
        statusElement.innerHTML = `<span class="status ${String(pedido.status).toLowerCase()}">${pedido.status}</span>`;

        // Itens
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = `
            <tr>
                <td>${pedido.nome_alimento}</td>
                <td>${pedido.quantidade}</td>
                <td>N/A</td>
                <td>-</td>
            </tr>
        `;

        // Botão de Ação
        const actionButton = document.getElementById('actionButton');
        if (String(pedido.status).toLowerCase() === 'reservado') {
            actionButton.textContent = 'Cancelar Pedido';
            actionButton.style.backgroundColor = '#e74c3c';
            // Chama handleAction com tipo 'solicitacao' (definido no dbRoutes.js)
            actionButton.onclick = () => handleAction(pedido.id, 'solicitacao', 'cancelar'); 
        } else {
            actionButton.textContent = 'Reservar Pedido';
            actionButton.style.backgroundColor = '#3498db';
            actionButton.onclick = () => handleAction(pedido.id, 'solicitacao', 'reservar'); 
        }
        
        modal.showModal();
    }
}

// Fecha a modal
function closeModal() {
    document.getElementById('orderModal').close();
}

// Função de Ação (Reserva/Cancela) que chama o BACKEND
async function handleAction(pedidoId, tipoDoacao, actionType) {
    const endpoint = actionType === 'reservar' 
        ? '/api/reservar-doacao' 
        : '/api/cancelar-reserva-e-devolver-estoque';
    
    closeModal(); // Fecha a modal

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doacaoId: pedidoId, tipoDoacao: tipoDoacao }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Exibe "Item reservado com sucesso!"
            loadPedidosDisponiveis(); // Recarrega os dados da tabela
        } else {
            alert(`Falha: ${result.message}`); // Exibe "Não foi possível reservar..."
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// === PESQUISA E PAGINAÇÃO (Lógica existente) ===

function updateItemCount(total) {
    document.getElementById('totalItens').textContent = total;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        const pedidosFiltrados = pedidosReais.filter(pedido => 
            pedido.nome_alimento.toLowerCase().includes(searchText) ||
            pedido.nome_ong.toLowerCase().includes(searchText)
        );
        
        currentPage = 1; 
        renderizarTabela(pedidosFiltrados);
        setupPagination(pedidosFiltrados.length);
    });
}

function setupPagination(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('totalPaginas').textContent = totalPaginas;
    // (A lógica de paginação avançada precisa ser implementada se necessário)
}

// Fechar modal clicando fora
document.getElementById('orderModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});