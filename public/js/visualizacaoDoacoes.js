// public/js/visualizacaoDoacoes.js
// VERSÃO COM MODAL DE MÚLTIPLOS STATUS

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let doacoesReais = []; 
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadDoacoesDisponiveis(); 
    setupSearch(); // Adicionando o setup de pesquisa
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

// === CARREGAMENTO DE DADOS (BACKEND) ===
async function loadDoacoesDisponiveis() {
    try {
        const response = await fetch('/api/doacoes-disponiveis-ong'); 
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        doacoesReais = await response.json();
        renderizarTabela(doacoesReais);
        setupPagination(doacoesReais.length); // Adicionando paginação
    } catch (error) {
        console.error('Erro ao carregar doações:', error);
        alert('Falha ao carregar doações disponíveis. Tente novamente.');
    }
}

function renderizarTabela(doacoes) {
    const tbody = document.getElementById('tableBody'); 
    tbody.innerHTML = ''; 

    if (doacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma doação disponível no momento.</td></tr>'; // Ajustado colspan
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const doacoesPaginadas = doacoes.slice(startIndex, endIndex);

    doacoesPaginadas.forEach(doacao => {
        const dataValidadeFormatada = new Date(doacao.data_validade).toLocaleDateString('pt-BR');
        
        const row = `
            <tr>
                <td>${doacao.id}</td>
                <td>${doacao.nome_alimento}</td>
                <td>${doacao.quantidade}</td> 
                <td>${doacao.nome_empresa}</td> 
                <td>${dataValidadeFormatada}</td>
                <td><span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span></td>
                <td><button onclick="openModal(${doacao.id})">Ver</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(doacoes.length); // Adicionando contagem de itens
}

// === MODAL E AÇÕES (LÓGICA ATUALIZADA) ===

function openModal(doacaoId) {
    const modal = document.getElementById('orderModal');
    const doacao = doacoesReais.find(d => d.id == doacaoId);

    if (!doacao) return;

    // --- 1. Preencher Informações Básicas ---
    modal.querySelector('.modal-header h3').textContent = `Detalhes da Doação #${doacao.id}`;
    document.getElementById('orderId').textContent = doacao.id;
    document.getElementById('orderDate').textContent = new Date(doacao.data_validade).toLocaleDateString('pt-BR'); // Data de Validade
    document.getElementById('institution').textContent = doacao.nome_empresa;
    document.getElementById('contact').textContent = doacao.telefone_contato;
    document.getElementById('address').textContent = doacao.cep_retirada; 

    const statusElement = document.getElementById('orderStatus');
    statusElement.innerHTML = `<span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span>`;

    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = `
        <tr>
            <td>${doacao.nome_alimento}</td>
            <td>${doacao.quantidade}</td>
            <td>Kg</td> <td>-</td>
        </tr>
    `;

    // --- 2. Controlar Ações e Seções com Base no Status ---
    const actionButton = document.getElementById('actionButton');
    const statusUpdateSection = document.getElementById('statusUpdateSection');
    const statusSelect = document.getElementById('statusSelect');
    const updateStatusButton = document.getElementById('updateStatusButton');

    // Reseta/Esconde tudo por padrão
    statusUpdateSection.style.display = 'none';
    statusSelect.innerHTML = '';
    
    const status = String(doacao.status).toLowerCase();
    const tipoDoacao = 'excedente'; // Tipo para o backend

    if (status === 'disponível') {
        actionButton.textContent = 'Reservar Doação';
        actionButton.style.backgroundColor = '#3498db';
        actionButton.style.display = 'inline-block';
        actionButton.onclick = () => handleAction(doacao.id, tipoDoacao, 'reservar'); 

    } else if (status === 'reservado') {
        actionButton.textContent = 'Cancelar Reserva';
        actionButton.style.backgroundColor = '#e74c3c';
        actionButton.style.display = 'inline-block';
        actionButton.onclick = () => handleAction(doacao.id, tipoDoacao, 'cancelar'); 
        
        statusUpdateSection.style.display = 'block';
        statusSelect.innerHTML = '<option value="em andamento">Mover para "Em Andamento"</option>';
        updateStatusButton.onclick = () => updateStatus(doacao.id, tipoDoacao);

    } else if (status === 'em andamento') {
        actionButton.style.display = 'none';

        statusUpdateSection.style.display = 'block';
        statusSelect.innerHTML = '<option value="concluido">Mover para "Concluído"</option>';
        updateStatusButton.onclick = () => updateStatus(doacao.id, tipoDoacao);

    } else if (status === 'concluido') {
        actionButton.style.display = 'none';
        statusUpdateSection.style.display = 'none';
    }
    
    modal.showModal();
}

function closeModal() {
    document.getElementById('orderModal').close();
}

// Função de Ação (Reserva/Cancela) - Mantida
async function handleAction(doacaoId, tipoDoacao, actionType) {
    const endpoint = actionType === 'reservar' 
        ? '/api/reservar-doacao' 
        : '/api/cancelar-reserva-e-devolver-estoque';
    
    closeModal();

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doacaoId: doacaoId, tipoDoacao: tipoDoacao }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); 
            loadDoacoesDisponiveis(); 
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// *** NOVA FUNÇÃO ***
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
                id: id,            // ID da doação
                tipo: tipoDoacao,  // 'excedente'
                status: novoStatus // 'em andamento' ou 'concluido'
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closeModal();
            loadDoacoesDisponiveis(); // Recarrega os dados
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// === PESQUISA E PAGINAÇÃO (Adicionado) ===
function updateItemCount(total) {
    document.getElementById('totalItens').textContent = total;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        const doacoesFiltradas = doacoesReais.filter(doacao => 
            doacao.nome_alimento.toLowerCase().includes(searchText) ||
            doacao.nome_empresa.toLowerCase().includes(searchText)
        );
        
        currentPage = 1; 
        renderizarTabela(doacoesFiltradas);
        setupPagination(doacoesFiltradas.length);
    });
}

function setupPagination(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('totalPaginas').textContent = totalPaginas;
    // (A lógica de paginação avançada precisa ser implementada)
}

// Fechar modal clicando fora
document.getElementById('orderModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});