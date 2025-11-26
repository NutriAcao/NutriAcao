// public/js/visualizacaoDoacoes.js
console.log(">>> ARQUIVO visualizacaoDoacoes.js CARREGADO COM SUCESSO! <<<");

import { showPopup } from './modal.js';

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
    setupPaginationControls();
});

function setupModalListeners() {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    modal.addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
}

function setupPaginationControls() {
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    
    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderizarTabela(doacoesReais);
            }
        });
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(doacoesReais.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderizarTabela(doacoesReais);
            }
        });
    }
}

async function carregarDadosUsuario() {
    try {
        console.log('>>> Carregando dados do usuário...');
        
        const response = await fetch('/api/usuario');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        if (resultado.success && resultado.data) {
            const dados = resultado.data;
            
            const nomeInstituicaoValor = dados.nome_ong || dados.nome_fantasia || dados.razao_social || 'Instituição';
            
            atualizarElementoUI('textNomeUsuario', dados.nome || 'Usuário');
            atualizarElementoUI('textNomeInstituicao', nomeInstituicaoValor);
            
        } else {
            throw new Error(resultado.message || 'Erro na resposta da API');
        }
        
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        atualizarElementoUI('textNomeUsuario', 'Usuário');
        atualizarElementoUI('textNomeInstituicao', 'Instituição');
    }
}

function atualizarElementoUI(elementId, texto) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = texto;
    }
}

// === CARREGAMENTO DE DOAÇÕES DISPONÍVEIS ===
async function loadDoacoesDisponiveis() {
    try {
        console.log("🔄 Iniciando carregamento de doações disponíveis...");
        
        const response = await fetch('/api/doacoes-disponiveis-ong'); 
        
        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }
        
        doacoesReais = await response.json();
        console.log("✅ Dados carregados do banco:", doacoesReais);
        
        renderizarTabela(doacoesReais);
        setupPagination(doacoesReais.length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar doações:', error);
        showPopup('Falha ao carregar doações disponíveis. Tente novamente.', { title: 'Erro', type: 'error', okText: 'OK' });
    }
}

// CORREÇÃO: Função renderizarTabela com campos corretos
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
        // CORREÇÃO: Usa os campos corretos da API
        const dataValidadeFormatada = doacao.data_validade 
            ? new Date(doacao.data_validade).toLocaleDateString('pt-BR')
            : 'N/A';
        
        // CORREÇÃO: Campos ajustados para a estrutura real
        const nomeProduto = doacao.nome_alimento || doacao.titulo || 'Produto';
        const quantidade = doacao.quantidade || '0';
        const unidade = doacao.unidade_medida || 'un';
        const empresa = doacao.nome_empresa || doacao.empresa?.nome_fantasia || doacao.empresa?.razao_social || 'Empresa';
        const categoria = doacao.categoria || 'Não categorizado';
        const status = doacao.status || 'disponível';
        
        const row = `
            <tr>
                
                <td>${nomeProduto}</td>
                <td>${quantidade} ${unidade}</td>
                <td>${empresa}</td>
                <td>${categoria}</td>
                <td>${dataValidadeFormatada}</td>
                <td><span class="status ${String(status).toLowerCase()}">${status}</span></td>
                <td>
                    <button onclick="openModal(${doacao.id})" class="btn-visualizar">👁️ Ver</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(doacoes.length);
    document.getElementById('totalPaginas').textContent = Math.ceil(doacoes.length / itemsPerPage);
}

// CORREÇÃO: Função openModal com campos corretos
function openModal(doacaoId) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    const doacao = doacoesReais.find(d => d.id == doacaoId); 

    if (!doacao) return;

    // CORREÇÃO: Usa campos corretos da API
    const nomeProduto = doacao.nome_alimento || doacao.titulo || 'Produto';
    const empresa = doacao.nome_empresa || doacao.empresa?.nome_fantasia || doacao.empresa?.razao_social || "Empresa não informada";
    const telefone = doacao.telefone_contato || doacao.empresa?.telefone || "Não informado";
    const email = doacao.email_contato || doacao.empresa?.email_institucional || "Não informado";
    const descricao = doacao.descricao || doacao.observacoes || '-';
    const dataValidadeFormatada = doacao.data_validade 
        ? new Date(doacao.data_validade).toLocaleDateString('pt-BR')
        : 'N/A';
    const status = doacao.status || 'disponível';

    modal.querySelector('.modal-header h3').textContent = `Detalhes da Doação #${doacao.id}`;
    fillElement('orderId', doacao.id);
    fillElement('orderDate', dataValidadeFormatada);
    fillElement('institution', empresa);
    fillElement('contact', telefone + (email !== "Não informado" ? ` | ${email}` : ''));
    fillElement('address', "A combinar"); 
    
    const statusElement = document.getElementById('orderStatus');
    if (statusElement) {
        statusElement.innerHTML = `<span class="status ${String(status).toLowerCase()}">${status}</span>`;
    }

    const itemsList = document.getElementById('itemsList');
    if (itemsList) {
        itemsList.innerHTML = `
            <tr>
                <td>${nomeProduto}</td>
                <td>${doacao.quantidade || '0'}</td>
                <td>${doacao.unidade_medida || 'un'}</td>
                <td>${descricao}</td>
            </tr>
        `;
    }

    const actionButton = document.getElementById('actionButton');
    const statusUpdateSection = document.getElementById('statusUpdateSection');

    actionButton.style.display = 'none';
    if(statusUpdateSection) {
        statusUpdateSection.style.display = 'none'; 
    }
    
    const statusLower = String(status).toLowerCase();

    if (statusLower === 'disponível' || statusLower === 'disponivel') {
        actionButton.textContent = 'Reservar Doação';
        actionButton.style.backgroundColor = '#3498db';
        actionButton.style.display = 'inline-block';
        actionButton.onclick = () => handleReserva(doacao.id);
    } else {
        actionButton.style.display = 'none';
    }
    
    modal.showModal();
}

const fillElement = (id, content) => {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
};

function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.close();
    }
}

// === RESERVA DE DOAÇÃO ===
async function handleReserva(doacaoId) {
    console.log('🔄 Iniciando reserva para doação ID:', doacaoId);
    
    try {
        const response = await fetch('/api/reservar-doacao-ong', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                doacao_id: doacaoId 
            }),
        });

        const result = await response.json();
        console.log('📨 Resposta da API:', result);

        if (response.ok && result.success) {
            showPopup('✅ Doação reservada com sucesso!', { title: 'Sucesso', type: 'success', okText: 'OK' });
            closeModal();
            loadDoacoesDisponiveis(); // Recarrega a lista
        } else {
            showPopup(`❌ Falha: ${result.message || 'Erro desconhecido'}`, { title: 'Erro', type: 'error', okText: 'OK' });
        }
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        showPopup('Erro de rede. Tente novamente.', { title: 'Erro', type: 'error', okText: 'OK' });
    }
}

// === PESQUISA E PAGINAÇÃO ===
function updateItemCount(total) {
    const el = document.getElementById('totalItens');
    if (el) el.textContent = total;
}

// CORREÇÃO: Função setupSearch com campos corretos
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        const doacoesFiltradas = doacoesReais.filter(doacao => 
            (doacao.nome_alimento && doacao.nome_alimento.toLowerCase().includes(searchText)) ||
            (doacao.titulo && doacao.titulo.toLowerCase().includes(searchText)) ||
            (doacao.descricao && doacao.descricao.toLowerCase().includes(searchText)) ||
            (doacao.observacoes && doacao.observacoes.toLowerCase().includes(searchText)) ||
            (doacao.nome_empresa && doacao.nome_empresa.toLowerCase().includes(searchText)) ||
            (doacao.empresa?.nome_fantasia && doacao.empresa.nome_fantasia.toLowerCase().includes(searchText)) ||
            (doacao.empresa?.razao_social && doacao.empresa.razao_social.toLowerCase().includes(searchText)) ||
            (doacao.categoria && doacao.categoria.toLowerCase().includes(searchText))
        );
        
        currentPage = 1; 
        renderizarTabela(doacoesFiltradas);
        setupPagination(doacoesFiltradas.length);
    });
}

function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const totalPaginasEl = document.getElementById('totalPaginas');
    const totalItensEl = document.getElementById('totalItens');
    
    if (totalPaginasEl) totalPaginasEl.textContent = totalPages;
    if (totalItensEl) totalItensEl.textContent = totalItems;
}