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
    carregarDadosUsuario();
    loadDoacoesDisponiveis(); 
    setupSearch(); 
    setupModalListeners();
});

// FUNÇÃO CARREGAR DADOS DO USUÁRIO - CORRIGIDA
async function carregarDadosUsuario() {
    try {
        console.log('>>> Carregando dados do usuário...');
        
        const res = await fetch('/api/usuarioToken');
        
        // A variável dados contém as seguintes informações do usuário logado
        // id, email, tipo (ong ou empresa), nome, nomeInstituicao 
        const dados = await res.json();
        
        // Salva os dados globalmente
        dadosUsuario = dados;
        
        // Atualiza a interface do usuário
        let txtnomeUsuario = document.getElementById('textNomeUsuario');
        let txtnomeInstituicao = document.getElementById('textNomeInstituicao');
        
        if (txtnomeUsuario) {
            txtnomeUsuario.innerText = dados.nome || 'Usuário';
        }
        
        if (txtnomeInstituicao) {
            txtnomeInstituicao.innerText = dados.nomeInstituicao || 'Instituição';
        }
        
        console.log('>>> Dados do usuário carregados:', {
            nome: dados.nome,
            instituicao: dados.nomeInstituicao
        });

    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
        // Fallback em caso de erro
        let txtnomeUsuario = document.getElementById('textNomeUsuario');
        let txtnomeInstituicao = document.getElementById('textNomeInstituicao');
        
        if (txtnomeUsuario) txtnomeUsuario.innerText = 'Usuário';
        if (txtnomeInstituicao) txtnomeInstituicao.innerText = 'Instituição';
    }
}

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
                <td>${doacao.nome_empresa}</td> 
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
    
    const doacao = doacoesReais.find(d => d.id == doacaoId); 

    if (!doacao) return;

    // Preencher Informações Básicas
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

    // Controlar Ações
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
        actionButton.onclick = () => handleAction(doacao.id, 'reservar-doacao'); 
    } else {
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
 */
async function handleAction(doacaoId, actionType) {
    let endpoint = '';
    const method = 'PUT';
    let body = { doacao_id: doacaoId }; 

    switch (actionType) {
        case 'reservar-doacao':
            endpoint = '/api/reservar-doacao';
            break;
        case 'cancelar-doacao':
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
            loadDoacoesDisponiveis(); 
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