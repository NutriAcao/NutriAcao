// public/js/minhasSolicitacoes.js

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let pedidosDisponiveisOng = []; // Pedidos que a ONG criou, status 'disponível'
let itensReservadosOng = [];    // Itens que a ONG criou (pedidos) OU reservou (doações), status 'reservado'
const itemsPerPage = 10;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadMinhasSolicitacoes(); 
    setupModalListeners();
});

async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarioToken');
        if (!res.ok) throw new Error('Falha ao buscar usuário');
        dadosUsuario = await res.json();
        document.getElementById('textNomeUsuario').innerHTML = dadosUsuario.nome || 'Usuário';
        document.getElementById('textNomeInstituicao').innerHTML = dadosUsuario.nomeInstituicao || 'ONG';
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
    }
}

async function loadMinhasSolicitacoes() {
    try {
        // --- 1. Carregar Meus Pedidos Disponíveis (Tabela 1: Pedidos que eu criei) ---
        const resPedidos = await fetch('/api/meus-pedidos-disponiveis');
        if (!resPedidos.ok) throw new Error('Falha ao carregar meus pedidos disponíveis.');
        pedidosDisponiveisOng = await resPedidos.json();
        renderizarTabelaMeusPedidos(pedidosDisponiveisOng);

        // --- 2. Carregar Itens Reservados (Tabela 2: Tudo que está reservado) ---
        const resReserva = await fetch('/api/meus-itens-reservados-ong');
        if (!resReserva.ok) throw new Error('Falha ao carregar meus itens reservados.');
        itensReservadosOng = await resReserva.json();
        renderizarTabelaReservadosOng(itensReservadosOng);
        
    } catch (error) {
        console.error('Erro ao carregar solicitações ativas:', error);
        alert('Falha ao carregar suas solicitações ativas. Tente novamente.');
    }
}

// === RENDERIZAÇÃO DAS DUAS TABELAS ===

function renderizarTabelaMeusPedidos(pedidos) {
    const tbody = document.getElementById('pedidosTableBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum pedido de doação seu está atualmente disponível.</td></tr>';
        document.getElementById('totalPedidos').textContent = 0;
        return;
    }
    
    pedidos.forEach(pedido => {
        const dataSolicitacao = new Date(pedido.data_solicitacao).toLocaleDateString('pt-BR');
        
        const row = `
            <tr>
                <td>${pedido.id}</td>
                <td>${pedido.nome_alimento}</td>
                <td>${pedido.quantidade}</td> 
                <td>${dataSolicitacao}</td>
                <td><span class="status ${String(pedido.status).toLowerCase()}">${pedido.status}</span></td>
                <td><button onclick="openModal(${pedido.id}, 'meuPedidoDisponivel')">Ver/Editar</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    document.getElementById('totalPedidos').textContent = pedidos.length;
}

function renderizarTabelaReservadosOng(itens) {
    const tbody = document.getElementById('reservadosOngTableBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum item está reservado por você ou para você.</td></tr>';
        document.getElementById('totalReservadosOng').textContent = 0;
        return;
    }

    itens.forEach(item => {
        // Identifica: A) Doação (Eu reservei) ou B) Pedido (Uma empresa reservou meu pedido)
        const isDoacao = item.id_empresa; 
        
        // Parceiro é quem fez a ação contrária (criador da doação ou reservador do pedido)
        const nomeParceiro = isDoacao ? item.nomeEmpresa : (item.nome_empresa_reserva || 'Empresa Desconhecida');
        
        const acaoPrincipal = isDoacao ? 'Concluir Doação' : 'Aguardando Empresa';
        
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td> 
                <td>${nomeParceiro}</td>
                <td>${isDoacao ? 'Doação de Empresa' : 'Meu Pedido Reservado'}</td>
                <td><span class="status ${String(item.status).toLowerCase()}">${item.status}</span></td>
                <td><button onclick="openModal(${item.id}, '${isDoacao ? 'doacaoReservadaPorMim' : 'meuPedidoReservadoPorEmpresa'}')">${acaoPrincipal}</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    document.getElementById('totalReservadosOng').textContent = itens.length;
}

// === MODAL E AÇÕES ===

function setupModalListeners() {
    const modal = document.getElementById('activeItemModal'); 
    if (!modal) return;
    
    // Fechar modal clicando fora (Adapte o ID do seu modal aqui)
    modal.addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
}

// Função auxiliar para preencher o conteúdo do modal com segurança
const fillElement = (id, content) => {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
};

function openModal(itemId, tipo) {
    const modal = document.getElementById('activeItemModal');
    if (!modal) return;
    
    // Encontra o item na lista correta
    let item;
    if (tipo === 'meuPedidoDisponivel') {
        item = pedidosDisponiveisOng.find(i => i.id == itemId);
    } else {
        item = itensReservadosOng.find(i => i.id == itemId);
    }

    if (!item) return;

    // --- 1. PREENCHER INFORMAÇÕES BÁSICAS ---
    // Você deve implementar a lógica de preenchimento do modal aqui, usando fillElement().
    fillElement('modalTitle', `${tipo.startsWith('meuPedido') ? 'Pedido' : 'Doação'} #${item.id}`);
    
    // --- 2. CONTROLAR BOTÕES DE AÇÃO ---
    const actionButton = document.getElementById('actionButton');
    const secondaryButton = document.getElementById('secondaryActionButton');
    
    actionButton.style.display = 'inline-block';
    secondaryButton.style.display = 'inline-block';
    secondaryButton.textContent = 'Cancelar Reserva';

    if (tipo === 'meuPedidoDisponivel') {
        // Pedido que EU criei, ainda disponível (posso editar ou remover)
        actionButton.textContent = 'Editar Pedido';
        secondaryButton.textContent = 'Remover Pedido';
        
        actionButton.onclick = () => alert('Funcionalidade de Edição deve ser implementada.');
        secondaryButton.onclick = () => alert('Funcionalidade de Remoção de Pedido deve ser implementada (DELETE).'); // Requer nova rota DELETE

    } else if (tipo === 'doacaoReservadaPorMim') {
        // Doação de Empresa que EU (ONG) reservei: posso concluir ou cancelar
        actionButton.textContent = 'Concluir Doação';
        
        // Ação de Concluir (rota PUT /concluir-doacao)
        actionButton.onclick = () => handleAction(item.id, 'concluir-doacao');
        // Ação de Cancelar (rota PUT /cancelar-reserva)
        secondaryButton.onclick = () => handleAction(item.id, 'cancelar-reserva'); 

    } else if (tipo === 'meuPedidoReservadoPorEmpresa') {
        // Pedido que EU (ONG) criei e foi reservado por uma Empresa: não há ações aqui (a Empresa conclui)
        actionButton.textContent = 'Aguardando Conclusão da Empresa';
        secondaryButton.textContent = 'Cancelar Pedido';
        actionButton.style.display = 'none'; // A ONG não conclui o próprio pedido
        secondaryButton.onclick = () => handleAction(item.id, 'cancelar-reserva'); 

    } else {
        actionButton.style.display = 'none';
        secondaryButton.style.display = 'none';
    }
    
    modal.showModal();
}

function closeModal() {
    document.getElementById('activeItemModal').close();
}

/**
 * Função ÚNICA para lidar com ações de Concluir ou Cancelar
 */
async function handleAction(itemId, actionType) {
    let endpoint = '';
    const method = 'PUT'; 
    let body = {};
    
    // 1. Determina o endpoint e o corpo (body)
    if (actionType.includes('concluir')) {
        // A ONG só pode concluir UMA doação que reservou (PUT /concluir-doacao)
        if (actionType !== 'concluir-doacao') {
             alert('A ONG só pode concluir doações que reservou.');
             return;
        }
        endpoint = '/api/concluir-doacao';
        body = { doacao_id: itemId };
        
    } else if (actionType === 'cancelar-reserva') {
        // Cancelar (PUT /cancelar-reserva)
        endpoint = '/api/cancelar-reserva'; 
        body = { 
            item_id: itemId, 
            tipo_item: getItemType(itemId) // 'doacao' ou 'pedido'
        }; 
    } else {
        alert('Ação desconhecida.');
        return;
    }
    
    closeModal(); 

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            // Recarrega as duas listas para atualizar o status
            loadMinhasSolicitacoes(); 
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// Função auxiliar para determinar o tipo de item para o endpoint de Cancelamento
function getItemType(itemId) {
    const item = itensReservadosOng.find(i => i.id == itemId);
    if (!item) {
        // Se não está na lista de reservados, verifica se é um pedido disponível
        if (pedidosDisponiveisOng.some(i => i.id == itemId)) return 'pedido';
        return null;
    }
    
    // Se ele tem id_empresa, é um item da tabela doacoesDisponiveis ('doacao')
    if (item.id_empresa) return 'doacao'; 
    
    // Se ele tem id_ong, é um item da tabela doacoesSolicitadas ('pedido')
    if (item.id_ong) return 'pedido'; 
    
    return null;
}