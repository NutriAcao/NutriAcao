// public/js/visualizacaoDoacoes.js
// VERSÃO CORRIGIDA PARA O FLUXO SIMPLIFICADO: Disponível -> Reservado -> Concluído
console.log(">>> ARQUIVO visualizacaoDoacoes.js CARREGADO COM SUCESSO! <<<");

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let doacoesReais = []; 
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadDoacoesDisponiveis(); 
    setupSearch(); 
    setupModalListeners(); // Novo setup para fechar modal
});

function setupModalListeners() {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
}

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
        // A rota deve retornar APENAS doações com status 'disponível'
        const response = await fetch('/api/doacoes-disponiveis-ong'); 
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        doacoesReais = await response.json();
        renderizarTabela(doacoesReais);
        setupPagination(doacoesReais.length);
    } catch (error) {
        console.error('Erro ao carregar doações:', error);
        alert('Falha ao carregar doações disponíveis. Tente novamente.');
    }
}

function renderizarTabela(doacoes) {
    const tbody = document.getElementById('tableBody'); 
    tbody.innerHTML = ''; 

    if (doacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma doação disponível no momento.</td></tr>'; 
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
                <td>${doacao.nomeEmpresa}</td> 
                <td>${dataValidadeFormatada}</td>
                <td><span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span></td>
                <td><button onclick="openModal(${doacao.id})">Ver</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(doacoes.length);
}

// === MODAL E AÇÕES (LÓGICA CORRIGIDA) ===

// Função auxiliar para preencher o conteúdo do modal com segurança
const fillElement = (id, content) => {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
};

function openModal(doacaoId) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    // CORREÇÃO: Usando a chave correta (id_empresa)
    const doacao = doacoesReais.find(d => d.id == doacaoId); 

    if (!doacao) return;

    // --- 1. Preencher Informações Básicas ---
    modal.querySelector('.modal-header h3').textContent = `Detalhes da Doação #${doacao.id}`;
    fillElement('orderId', doacao.id);
    fillElement('orderDate', new Date(doacao.data_validade).toLocaleDateString('pt-BR'));
    fillElement('institution', doacao.nomeEmpresa || doacao.NomeEmpresa);
    fillElement('contact', doacao.telefone_contato);
    fillElement('address', doacao.cep_retirada); 

    const statusElement = document.getElementById('orderStatus');
    if (statusElement) {
        statusElement.innerHTML = `<span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span>`;
    }

    const itemsList = document.getElementById('itemsList');
    if (itemsList) {
        itemsList.innerHTML = `
            <tr>
                <td>${doacao.nome_alimento}</td>
                <td>${doacao.quantidade}</td>
                <td>Kg</td> <td>-</td>
            </tr>
        `;
    }

    // --- 2. Controlar Ações (REMOVIDO FLUXO 'EM ANDAMENTO') ---
    const actionButton = document.getElementById('actionButton');
    const statusUpdateSection = document.getElementById('statusUpdateSection');

    // Reseta/Esconde tudo por padrão
    actionButton.style.display = 'none';
    if(statusUpdateSection) {
        statusUpdateSection.style.display = 'none'; 
    }
    
    const status = String(doacao.status).toLowerCase();

    if (status === 'disponível') {
        actionButton.textContent = 'Reservar Doação';
        actionButton.style.backgroundColor = '#3498db';
        actionButton.style.display = 'inline-block';
        // Chama a ação 'reservar' no novo sistema
        actionButton.onclick = () => handleAction(doacao.id, 'reservar-doacao'); 

    } else if (status === 'reservado') {
        // Se a ONG vê um item reservado NESTA tela,
        // só deve ver o botão de Cancelar (se o item foi ela quem reservou, que não é o caso aqui,
        // pois esta tela deve filtrar para APENAS 'disponível'.
        // O item reservado deve sumir desta lista e ir para "Minhas Doações Ativas" da ONG.
        // Assim, este bloco só serve para debug/cache.
        actionButton.style.display = 'none'; // Não deve haver ações nesta tela para status reservado/concluído.
    } else {
        // Concluído, etc.
        actionButton.style.display = 'none';
    }
    
    modal.showModal();
}

function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.close();
    }
}

/**
 * Função ÚNICA para lidar com Reservar
 * @param {number} doacaoId - O ID da doação (da tabela doacoesDisponiveis)
 * @param {string} actionType - A ação a ser executada ('reservar-doacao')
 */
async function handleAction(doacaoId, actionType) {
    let endpoint = '';
    const method = 'PUT'; // Usamos PUT para atualizações de status
    let body = { doacao_id: doacaoId }; 

    // Define o endpoint com base no tipo de ação
    switch (actionType) {
        case 'reservar-doacao':
            endpoint = '/api/reservar-doacao';
            break;
        case 'cancelar-doacao':
            // Rota de cancelamento (Se fosse implementada, seria aqui)
            alert('Ação de Cancelar deve ser feita na página de Itens Reservados.');
            return;
        default:
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
            // O item reservado deve sumir desta lista (pois o loadDoacoesDisponiveis filtra por 'disponível')
            loadDoacoesDisponiveis(); 
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// REMOVIDA A FUNÇÃO 'updateStatus' (Obsoleta no novo fluxo)


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
        
        const doacoesFiltradas = doacoesReais.filter(doacao => 
            (doacao.nome_alimento && doacao.nome_alimento.toLowerCase().includes(searchText)) ||
            (doacao.nomeEmpresa && doacao.nomeEmpresa.toLowerCase().includes(searchText)) ||
            (doacao.NomeEmpresa && doacao.NomeEmpresa.toLowerCase().includes(searchText))
        );
        
        currentPage = 1; 
        renderizarTabela(doacoesFiltradas);
        setupPagination(doacoesFiltradas.length);
    });
}

function setupPagination(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const el = document.getElementById('totalPaginas');
    if (el) el.textContent = totalPaginas;
}