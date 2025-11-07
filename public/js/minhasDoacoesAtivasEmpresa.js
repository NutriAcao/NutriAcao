// public/js/minhasDoacoesAtivasEmpresa.js

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let excedentesDisponiveis = []; // Excedentes que a Empresa criou, status 'disponível'
let itensReservados = [];      // Itens que a Empresa criou OU reservou, status 'reservado'
const itemsPerPage = 10;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadDadosAtivos(); // Função que carrega as duas listas
    setupModalListeners();
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

async function loadDadosAtivos() {
    try {
        // --- 1. Carregar Excedentes Disponíveis (Tabela 1) ---
        const resDisp = await fetch('/api/meus-excedentes-disponiveis');
        if (!resDisp.ok) throw new Error('Falha ao carregar excedentes disponíveis.');
        excedentesDisponiveis = await resDisp.json();
        renderizarTabelaExcedentes(excedentesDisponiveis);

        // --- 2. Carregar Itens Reservados (Tabela 2) ---
        const resReserva = await fetch('/api/meus-itens-reservados');
        if (!resReserva.ok) throw new Error('Falha ao carregar itens reservados.');
        itensReservados = await resReserva.json();
        renderizarTabelaReservados(itensReservados);
        
    } catch (error) {
        console.error('Erro ao carregar dados ativos:', error);
        alert('Falha ao carregar suas doações ativas. Tente novamente.');
    }
}

// === RENDERIZAÇÃO DAS DUAS TABELAS ===

function renderizarTabelaExcedentes(doacoes) {
    const tbody = document.getElementById('excedentesTableBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (doacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum excedente cadastrado e disponível.</td></tr>';
        document.getElementById('totalExcedentes').textContent = 0;
        return;
    }
    
    doacoes.forEach(doacao => {
        const dataValidade = new Date(doacao.data_validade).toLocaleDateString('pt-BR');
        
        const row = `
            <tr>
                <td>${doacao.id}</td>
                <td>${doacao.nome_alimento}</td>
                <td>${doacao.quantidade}</td> 
                <td>${dataValidade}</td>
                <td>${doacao.cep_retirada}</td>
                <td><span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span></td>
                <td><button onclick="openModal(${doacao.id}, 'excedente')">Ver</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    document.getElementById('totalExcedentes').textContent = doacoes.length;
}

function renderizarTabelaReservados(itens) {
    const tbody = document.getElementById('reservadosTableBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum item reservado no momento.</td></tr>';
        document.getElementById('totalReservados').textContent = 0;
        return;
    }

    itens.forEach(item => {
        // Identifica se o item é uma Doação (que eu criei e foi reservada) ou um Pedido (que eu reservei)
        const isDoacao = item.id_empresa; 
        const nomeParceiro = isDoacao ? item.nome_ong_reserva : (item.nomeONG || 'ONG Desconhecida');
        const acaoPrincipal = isDoacao ? 'Concluir Doação' : 'Concluir Pedido';
        
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome_alimento}</td>
                <td>${item.quantidade}</td> 
                <td>${nomeParceiro}</td>
                <td>${isDoacao ? 'Doação' : 'Pedido'}</td>
                <td><span class="status ${String(item.status).toLowerCase()}">${item.status}</span></td>
                <td><button onclick="openModal(${item.id}, '${isDoacao ? 'doacaoReservada' : 'pedidoReservado'}')">${acaoPrincipal}</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    document.getElementById('totalReservados').textContent = itens.length;
}

// === MODAL E AÇÕES ===

function setupModalListeners() {
    const modal = document.getElementById('activeItemModal'); // Usando um ID diferente para o modal
    if (!modal) return;
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
}

function openModal(itemId, tipo) {
    const modal = document.getElementById('activeItemModal');
    if (!modal) return;
    
    // Encontra o item na lista correta
    const item = (tipo === 'excedente') 
        ? excedentesDisponiveis.find(i => i.id == itemId)
        : itensReservados.find(i => i.id == itemId);

    if (!item) return;

    // --- 1. PREENCHER INFORMAÇÕES BÁSICAS ---
    // (Lógica de preenchimento do modal deve ser implementada aqui)

    // --- 2. CONTROLAR BOTÕES DE AÇÃO ---
    const actionButton = document.getElementById('actionButton');
    const secondaryButton = document.getElementById('secondaryActionButton');
    
    actionButton.style.display = 'inline-block';
    secondaryButton.style.display = 'inline-block';

    if (tipo === 'excedente') {
        // Excedente Disponível: Ação de Cancelar (Retirar da lista, se necessário)
        actionButton.textContent = 'Editar/Remover Doação';
        secondaryButton.style.display = 'none';
        actionButton.onclick = () => alert('Funcionalidade de Edição/Remoção deve ser implementada.');

    } else if (tipo === 'doacaoReservada') {
        // Doação que EU (Empresa) criei e foi reservada por uma ONG
        actionButton.textContent = 'Concluir Doação';
        secondaryButton.textContent = 'Cancelar Reserva';
        
        actionButton.onclick = () => handleAction(item.id, 'concluir-doacao');
        secondaryButton.onclick = () => handleAction(item.id, 'cancelar-reserva'); // Esta rota precisa ser criada no backend!

    } else if (tipo === 'pedidoReservado') {
        // Pedido que EU (Empresa) reservei (de uma ONG)
        actionButton.textContent = 'Concluir Pedido';
        secondaryButton.textContent = 'Cancelar Reserva';

        actionButton.onclick = () => handleAction(item.id, 'concluir-pedido');
        secondaryButton.onclick = () => handleAction(item.id, 'cancelar-reserva'); // Esta rota precisa ser criada no backend!

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
    
    if (actionType.includes('concluir')) {
        endpoint = (actionType === 'concluir-doacao') ? '/api/concluir-doacao' : '/api/concluir-pedido';
        body = (actionType === 'concluir-doacao') ? { doacao_id: itemId } : { pedido_id: itemId };
    } else if (actionType === 'cancelar-reserva') {
        // NOTA: A rota '/api/cancelar-reserva' precisa ser implementada no backend (próximo passo)
        endpoint = '/api/cancelar-reserva'; 
        // O corpo da requisição de cancelamento deve informar a tabela e o ID
        body = { 
            item_id: itemId, 
            tipo_item: itemId_tipo(itemId) // Função auxiliar para determinar se é 'doacao' ou 'pedido'
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
            loadDadosAtivos(); 
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// Função auxiliar para determinar o tipo de item
function itemId_tipo(itemId) {
    // Verifica se o item é um dos meus excedentes (doacoesDisponiveis)
    if (excedentesDisponiveis.some(i => i.id == itemId)) return 'doacao'; 
    
    // Verifica se o item está na lista de reservados
    const item = itensReservados.find(i => i.id == itemId);
    if (!item) return null;
    
    // Se ele tem id_empresa, é um item da tabela doacoesDisponiveis
    if (item.id_empresa) return 'doacao'; 
    
    // Se ele tem id_ong, é um item da tabela doacoesSolicitadas
    if (item.id_ong) return 'pedido'; 
    
    return null;
}