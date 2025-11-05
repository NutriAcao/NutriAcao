// public/js/visualizacaoDoacoes.js
// CÓDIGO FINAL DO PAINEL DA ONG (para ver Excedentes da Empresa)

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let doacoesReais = []; // Armazena os dados reais vindos do backend
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuario();
    loadDoacoesDisponiveis(); // Carrega os dados reais do backend

    // Se você tiver filtros e pesquisa (como no seu código anterior),
    // você precisará reativar e adaptar estas funções.
    // setupSearch(); 
    // setupPaginationListeners(); 
});

// Carrega dados do usuário logado (ONG)
async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarioToken');
        if (!res.ok) throw new Error('Falha ao buscar usuário');
        
        dadosUsuario = await res.json();
        
        // Atualiza o nome do usuário/instituição no canto superior
        document.getElementById('textNomeUsuario').innerHTML = dadosUsuario.nome || 'Usuário';
        document.getElementById('textNomeInstituicao').innerHTML = dadosUsuario.nomeInstituicao || 'ONG';
        
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
    }
}

// === CARREGAMENTO DE DADOS (BACKEND) ===
// Busca os Excedentes das Empresas no backend (Rota 1 do dbRoutes.js)
async function loadDoacoesDisponiveis() {
    try {
        const response = await fetch('/api/doacoes-disponiveis-ong'); 
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `Erro no servidor: ${response.status}`);
        }
        
        const doacoes = await response.json();
        doacoesReais = doacoes; // Salva os dados globalmente
        
        renderizarTabela(doacoes); // Desenha a tabela com dados reais
        // setupPagination(doacoes.length); 
        
    } catch (error) {
        console.error('Erro ao carregar doações:', error);
        alert('Falha ao carregar doações disponíveis. Tente novamente.');
    }
}

// Desenha a tabela no HTML
function renderizarTabela(doacoes) {
    // Usando '#doacoesTable tbody' ou '#tableBody'. Vou usar tableBody pois estava no seu código
    const tbody = document.getElementById('tableBody'); 
    tbody.innerHTML = ''; 

    if (doacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Nenhuma doação disponível no momento.</td></tr>';
        return;
    }
    
    // Filtra para paginação (simplificado)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const doacoesPaginadas = doacoes.slice(startIndex, endIndex);

    doacoesPaginadas.forEach(doacao => {
        // Use os nomes de coluna do ALIAS do SQL (Rota 1)
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

    // Você precisará adaptar a atualização de contagem, se necessário.
    // document.getElementById('totalItens').textContent = doacoes.length;
}

// === MODAL E AÇÕES (RESERVAR / CANCELAR) ===

// Abre a modal com dados REAIS
function openModal(doacaoId) {
    const modal = document.getElementById('orderModal'); // Ajuste o ID se for diferente no HTML da ONG
    const doacao = doacoesReais.find(d => d.id === doacaoId);
    
    if (doacao) {
        // Preenche a modal
        document.getElementById('orderId').textContent = doacao.id;
        document.getElementById('orderDate').textContent = new Date(doacao.data_validade).toLocaleDateString('pt-BR');
        document.getElementById('institution').textContent = doacao.nome_empresa;
        document.getElementById('contact').textContent = doacao.telefone_contato;
        document.getElementById('address').textContent = doacao.cep_retirada; // Usando CEP de retirada

        // Status
        const statusElement = document.getElementById('orderStatus');
        statusElement.innerHTML = `<span class="status ${String(doacao.status).toLowerCase()}">${doacao.status}</span>`;

        // Itens
        const itemsList = document.getElementById('itemsList'); // Ajuste o ID se for diferente
        itemsList.innerHTML = `
            <tr>
                <td>${doacao.nome_alimento}</td>
                <td>${doacao.quantidade}</td>
                <td>Kg</td> <td>-</td>
            </tr>
        `;

        // Botão de Ação
        const actionButton = document.getElementById('actionButton'); // Ajuste o ID se for diferente
        if (String(doacao.status).toLowerCase() === 'reservado') {
            actionButton.textContent = 'Cancelar Reserva';
            actionButton.style.backgroundColor = '#e74c3c';
            // Chama handleAction com tipo 'excedente' (para reservar da tabela doacoesDisponiveis)
            actionButton.onclick = () => handleAction(doacao.id, 'excedente', 'cancelar'); 
        } else {
            actionButton.textContent = 'Reservar Doação';
            actionButton.style.backgroundColor = '#3498db';
            actionButton.onclick = () => handleAction(doacao.id, 'excedente', 'reservar'); 
        }
        
        modal.showModal();
    }
}

// Fecha a modal (Ajuste o ID se for diferente no HTML da ONG)
function closeModal() {
    document.getElementById('orderModal').close();
}

// Função de Ação (Reserva/Cancela)
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
            loadDoacoesDisponiveis(); // Recarrega os dados da tabela
        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    }
}

// Fechar modal clicando fora
document.getElementById('orderModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});