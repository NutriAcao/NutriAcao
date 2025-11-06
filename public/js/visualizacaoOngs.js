// public/js/visualizacaoOngs.js
// VERSÃO COM MODAL DE MÚLTIPLOS STATUS (FINALMENTE CORRIGIDA)
console.log(">>> ARQUIVO visualizacaoOngs.js CARREGADO COM SUCESSO! <<<");

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let pedidosReais = []; 
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadPedidosDisponiveis(); 
    setupSearch();
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

async function loadPedidosDisponiveis() {
    try {
        const response = await fetch('/api/pedidos-disponiveis-empresa'); 
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        pedidosReais = await response.json();
        renderizarTabela(pedidosReais); 
        setupPagination(pedidosReais.length); 
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        alert('Falha ao carregar pedidos de doação. Tente novamente.');
    }
}

function renderizarTabela(pedidos) {
    const tbody = document.querySelector('#doacoesTable tbody');
    tbody.innerHTML = ''; 

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum pedido de doação disponível no momento.</td></tr>';
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pedidosPaginados = pedidos.slice(startIndex, endIndex);

    pedidosPaginados.forEach(pedido => {
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

// === MODAL E AÇÕES (LÓGICA CORRIGIDA E COMPLETADA) ===

// Função auxiliar para preencher o conteúdo do modal com segurança
const fillElement = (id, content) => {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = content;
    } else {
        // Agora que o modal está abrindo, este erro serve apenas como aviso!
        console.error(`AVISO: Elemento com ID '${id}' não encontrado no modal!`);
    }
};

function openModal(pedidoId) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;

    if (!pedidosReais || pedidosReais.length === 0) return;

    // CORREÇÃO: Usando == para igualar String e Number
    const pedido = pedidosReais.find(p => p.id == pedidoId);
    
    if (!pedido) return;
    console.log("DEBUG 4: Pedido encontrado!", pedido);

    // --- 1. PREENCHER INFORMAÇÕES BÁSICAS ---
    modal.querySelector('.modal-header h3').textContent = `Detalhes do Pedido #${pedido.id}`;

    fillElement('orderId', pedido.id);
    fillElement('orderDate', new Date(pedido.data_solicitacao).toLocaleDateString('pt-BR'));
    fillElement('institution', pedido.nome_ong);
    fillElement('contact', pedido.telefone_contato); 
    fillElement('address', 'Entrar em contato com a ONG');

    const statusElement = document.getElementById('orderStatus');
    if (statusElement) {
        statusElement.innerHTML = `<span class="status ${String(pedido.status).toLowerCase()}">${pedido.status}</span>`;
    }

    const itemsList = document.getElementById('itemsList');
    if (itemsList) {
        itemsList.innerHTML = `
            <tr>
                <td>${pedido.nome_alimento}</td>
                <td>${pedido.quantidade}</td>
                <td>N/A</td> <td>-</td>
            </tr>
        `;
    }
    // ----------------------------------------
    
    // --- 2. CONTROLAR AÇÕES COM BASE NO STATUS ---
    const status = String(pedido.status).toLowerCase();
    const actionButton = document.getElementById('actionButton');
    const statusUpdateSection = document.getElementById('statusUpdateSection');
    const statusSelect = document.getElementById('statusSelect');
    const updateStatusButton = document.getElementById('updateStatusButton');
    const tipoDoacao = 'solicitacao'; 

    // Resetar visibilidade
    actionButton.style.display = 'none';
    statusUpdateSection.style.display = 'none';
    statusSelect.innerHTML = '';


    // LÓGICA DE STATUS
    if (status === 'disponivel') {
        // ESTA É A LÓGICA FALTANDO NO SEU MODAL ATUAL
        actionButton.textContent = 'Reservar Pedido';
        actionButton.style.backgroundColor = '#3498db';
        actionButton.style.display = 'inline-block';
        actionButton.onclick = () => handleAction(pedido.id, tipoDoacao, 'reservar'); 
        statusUpdateSection.style.display = 'none'; // Garantir que a seção de status está escondida

    } else if (status === 'reservado') {
        actionButton.textContent = 'Cancelar Reserva';
        actionButton.style.backgroundColor = '#e74c3c';
        actionButton.style.display = 'inline-block';
        actionButton.onclick = () => handleAction(pedido.id, tipoDoacao, 'cancelar'); 
        
        statusUpdateSection.style.display = 'block';
        statusSelect.innerHTML = '<option value="em andamento">Mover para "Em Andamento"</option>';
        updateStatusButton.onclick = () => updateStatus(pedido.id, tipoDoacao);

    } else if (status === 'em andamento') {
        actionButton.style.display = 'none';

        statusUpdateSection.style.display = 'block';
        statusSelect.innerHTML = '<option value="concluido">Mover para "Concluído"</option>';
        updateStatusButton.onclick = () => updateStatus(pedido.id, tipoDoacao);

    } else if (status === 'concluido') {
        actionButton.style.display = 'none';
        statusUpdateSection.style.display = 'none';
    }
    
    // --- 3. Abrir o Modal ---
    modal.showModal();
    console.log("DEBUG 7: Modal aberto com SUCESSO. ---");
}

// Fecha a modal
function closeModal() {
    document.getElementById('orderModal').close();
}

// Função de Ação (Reserva/Cancela) 
async function handleAction(pedidoId, tipoDoacao, actionType) {
    const endpoint = actionType === 'reservar' 
        ? '/api/reservar-doacao' 
        : '/api/cancelar-reserva-e-devolver-estoque';
    
    closeModal(); 

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doacaoId: pedidoId, tipoDoacao: tipoDoacao }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            loadPedidosDisponiveis(); 
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// Atualiza o status para "em andamento" ou "concluído"
async function updateStatus(id, tipoDoacao) {
    const statusSelect = document.getElementById('statusSelect');
    const novoStatus = statusSelect.value;

    if (!novoStatus) {
        alert('Nenhum novo status selecionado.');
        return;
    }

    const endpoint = '/api/update-status'; 
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                tipo: tipoDoacao,
                status: novoStatus
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closeModal();
            loadPedidosDisponiveis();
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// === PESQUISA E PAGINAÇÃO ===
function updateItemCount(total) {
    document.getElementById('totalItens').textContent = total;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
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
}

// Fechar modal clicando fora
document.getElementById('orderModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});