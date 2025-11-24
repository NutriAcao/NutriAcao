// public/js/visualizacaoOngs.js
// VERSÃO ATUALIZADA com fluxo padronizado: Empresa reserva Pedido de ONG
console.log(">>> ARQUIVO visualizacaoOngs.js CARREGADO COM SUCESSO! <<<");

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let pedidosReais = []; 
const itemsPerPage = 10;
let currentPage = 1;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    carregarDadosUsuario();
    loadPedidosDisponiveis(); 
    setupSearch();

    // Adiciona listener para fechar modal
    const modal = document.getElementById('orderModal');
    if (modal) {
        // Fecha clicando no botão "Fechar" (X)
        const closeButton = modal.querySelector('.close-button'); // Assumindo que você tenha um .close-button
        if (closeButton) {
            closeButton.onclick = () => closeModal();
        }
        
        // Fecha clicando no botão "Cancelar" (se existir)
        const cancelButton = modal.querySelector('.cancel-button'); // Assumindo que você tenha um .cancel-button
        if (cancelButton) {
            cancelButton.onclick = () => closeModal();
        }
        
        // Fecha clicando fora
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal();
            }
        });
    }
});

// FUNÇÃO CARREGAR DADOS DO USUÁRIO - CORRIGIDA
async function carregarDadosUsuario() {
    try {
        console.log('>>> Carregando dados do usuário...');
        
        const response = await fetch('/api/usuario');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('>>> Resposta completa:', resultado);
        
        if (resultado.success && resultado.data) {
            const dados = resultado.data;
            
            // Salva os dados globalmente
            dadosUsuario = dados;
            
            // CORREÇÃO: Usando a estrutura correta da sua API
            let txtnomeUsuario = document.getElementById('textNomeUsuario');
            let txtnomeInstituicao = document.getElementById('textNomeInstituicao');
            
            if (txtnomeUsuario) {
                txtnomeUsuario.innerText = dados.nome || 'Usuário';
            }
            
            if (txtnomeInstituicao) {
                // Para empresa, usa nome_fantasia; para ONG, usaria nome_ong
                const nomeInstituicao = dados.nome_fantasia || dados.nome_ong || dados.razao_social || 'Instituição';
                txtnomeInstituicao.innerText = nomeInstituicao;
            }
            
            console.log('>>> Dados do usuário carregados:', {
                nome: dados.nome,
                instituicao: dados.nome_fantasia || dados.nome_ong || dados.razao_social,
                id: dados.id // Importante para a lógica de redirecionamento
            });

        } else {
            throw new Error(resultado.message || 'Erro na resposta da API');
        }

    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
        // Fallback em caso de erro
        let txtnomeUsuario = document.getElementById('textNomeUsuario');
        let txtnomeInstituicao = document.getElementById('textNomeInstituicao');
        
        if (txtnomeUsuario) txtnomeUsuario.innerText = 'Usuário';
        if (txtnomeInstituicao) txtnomeInstituicao.innerText = 'Instituição';
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
        console.log(pedidosReais); // Para ver os dados no console
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
        // Certifica-se de que a data é válida antes de formatar
        const dataValida = pedido.data_solicitacao || pedido.dataCadastroSolicitacao;
        const dataFormatada = dataValida ? new Date(dataValida).toLocaleDateString('pt-BR') : 'N/A';
        
        const row = `
            <tr>
                <td>${pedido.id}</td>
                <td>${pedido.nome_alimento}</td>
                <td>${pedido.quantidade}</td> 
                <td>${pedido.nome_ong || pedido.nomeONG}</td>
                <td>${dataFormatada}</td>
                <td><span class="status ${String(pedido.status).toLowerCase()}">${pedido.status}</span></td>
                <td><button onclick="openModal(${pedido.id})" class="btn-visualizar-pedido">Visualizar Pedido</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateItemCount(pedidos.length);
}

// === MODAL E AÇÕES (LÓGICA REATORADA) ===

// Função auxiliar para preencher o conteúdo do modal com segurança
const fillElement = (id, content) => {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = content;
    } else {
        console.error(`AVISO: Elemento com ID '${id}' não encontrado no modal!`);
    }
};

function openModal(pedidoId) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;

    if (!pedidosReais || pedidosReais.length === 0) return;

    const pedido = pedidosReais.find(p => p.id == pedidoId);
    
    if (!pedido) return;
    console.log("📋 Pedido encontrado:", pedido);

    // --- 1. PREENCHER INFORMAÇÕES BÁSICAS ---
    modal.querySelector('.modal-header h3').textContent = `Detalhes do Pedido #${pedido.id}`;
    
    const dataValida = pedido.data_solicitacao || pedido.dataCadastroSolicitacao;
    const dataFormatada = dataValida ? new Date(dataValida).toLocaleDateString('pt-BR') : 'N/A';

    fillElement('orderId', pedido.id);
    fillElement('orderDate', dataFormatada);
    fillElement('institution', pedido.nome_ong || pedido.nomeONG);
    fillElement('contact', pedido.telefone_contato || pedido.telefoneContato); 
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
                <td>kg</td>
                <td>-</td>
            </tr>
        `;
    }

    // --- 2. CONTROLAR AÇÕES ---
    const actionButton = document.getElementById('actionButton');
    const successMessage = document.getElementById('reservationSuccessMessage');

    // Esconder mensagem de sucesso e resetar botão
    if (successMessage) successMessage.style.display = 'none';
    actionButton.style.display = 'none';
    actionButton.disabled = false;
    
    const status = String(pedido.status).toLowerCase();

    if (status === 'disponível' || status === 'disponivel') {
        // MOSTRAR BOTÃO DE RESERVA
        actionButton.textContent = '📋 Reservar Pedido';
        actionButton.style.backgroundColor = '#3498db';
        actionButton.style.display = 'inline-block';
        
        // Configurar clique do botão
        actionButton.onclick = async () => {
            actionButton.disabled = true;
            actionButton.textContent = 'Reservando...';
            
            try {
                console.log(`🔄 Reservando pedido ${pedido.id}...`);
                
                const response = await fetch('/api/reservar-pedido', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        pedido_id: pedido.id
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    // SUCESSO: Mostrar mensagem e atualizar status
                    if (successMessage) successMessage.style.display = 'block';
                    actionButton.style.display = 'none';
                    
                    // Atualizar status no modal
                    if (statusElement) {
                        statusElement.innerHTML = `<span class="status reservado">reservado</span>`;
                    }
                    
                    // Recarregar a lista após 2 segundos
                    setTimeout(() => {
                        closeModal();
                        loadPedidosDisponiveis();
                    }, 2000);
                    
                } else {
                    alert(`❌ Erro: ${result.message}`);
                    actionButton.disabled = false;
                    actionButton.textContent = '📋 Reservar Pedido';
                }
            } catch (error) {
                console.error('Erro de rede:', error);
                alert('Erro de rede. Tente novamente.');
                actionButton.disabled = false;
                actionButton.textContent = '📋 Reservar Pedido';
            }
        };

    } else {
        // Status não é disponível - esconder botão
        actionButton.style.display = 'none';
    }
    
    // --- 3. Abrir o Modal ---
    modal.showModal();
}
// Fecha a modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.close();
    }
}

/**
 * Função ÚNICA para lidar com todas as ações (Reservar, Concluir)
 * @param {number} pedidoId - O ID do pedido (da tabela doacoesSolicitadas)
 * @param {string} actionType - A ação a ser executada ('reservar-pedido', 'concluir-pedido')
 */
async function handleAction(pedidoId, actionType) {
    let endpoint = '';
    const method = 'PUT'; // Usamos PUT para atualizações de status
    let body = { pedido_id: pedidoId }; // O corpo da requisição
    const actionButton = document.getElementById('actionButton');
    const modalBody = document.querySelector('#orderModal .modal-body');

    // Define o endpoint com base no tipo de ação
    switch (actionType) {
        case 'reservar-pedido':
            endpoint = '/api/reservar-pedido';
            body = { pedido_id: pedidoId };
        case 'concluir-pedido':
            // *** NOVO CÓDIGO: BLOQUEIA A CONCLUSÃO NESTA PÁGINA ***
            alert('A conclusão de pedidos deve ser realizada apenas na página "Minhas Doações Ativas".');
            closeModal();
            return;
            // *** FIM NOVO CÓDIGO ***
        default:
            alert('Ação desconhecida.');
            return;
    }
    
    // Mantemos o modal aberto para mostrar a mensagem de sucesso da reserva
    console.log(`Enviando ${method} para ${endpoint} com ID: ${pedidoId}`);

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                // Importante: Enviar o token de autenticação
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (response.ok) {
            
            // *** NOVA LÓGICA DE SUCESSO PÓS-RESERVA (PADRÃO ONG) ***
            if (actionType === 'reservar-pedido') {
                const statusElement = document.getElementById('orderStatus');
                if (statusElement) {
                    // Atualiza o status visual no modal
                    statusElement.innerHTML = `<span class="status reservado">reservado</span>`;
                }

                // 1. Remove o botão de ação (Reservar)
                actionButton.style.display = 'none';

                // 2. Adiciona/Atualiza a mensagem de sucesso no modal
                let successMessage = document.getElementById('reservationSuccessMessage');
                if (!successMessage) {
                    successMessage = document.createElement('p');
                    successMessage.id = 'reservationSuccessMessage';
                    // Adicionei um ícone para melhor feedback visual (assumindo Font Awesome)
                    successMessage.innerHTML = '<strong><i class="fas fa-check-circle"></i> Pedido Reservado com Sucesso!</strong> Por favor, utilize o contato acima para negociar a entrega. Você pode acompanhar o processo e concluir o pedido na página **Minhas Doações Ativas**.';
                    // Estilos de feedback visual
                    successMessage.style.cssText = 'color: #155724; margin-top: 15px; padding: 10px; border: 1px solid #c3e6cb; background-color: #d4edda; border-radius: 5px;';
                    
                    // Insere logo abaixo dos detalhes básicos
                    const detailsSection = modalBody.querySelector('.modal-details');
                    if (detailsSection) {
                         detailsSection.after(successMessage);
                    } else {
                        modalBody.prepend(successMessage);
                    }
                } else {
                    successMessage.style.display = 'block'; // Garante que a mensagem apareça se já existir
                }
            }
            
            // 3. Recarrega a lista para que o item reservado suma da lista de "disponíveis"
            loadPedidosDisponiveis(); 

        } else {
            alert(`Falha: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('Erro de rede. Tente novamente.');
    } finally {
        actionButton.disabled = false; // Reabilita o botão
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
        
        const pedidosFiltrados = pedidosReais.filter(pedido => 
            (pedido.nome_alimento && pedido.nome_alimento.toLowerCase().includes(searchText)) ||
            (pedido.nome_ong && pedido.nome_ong.toLowerCase().includes(searchText)) ||
            (pedido.nomeONG && pedido.nomeONG.toLowerCase().includes(searchText))
        );
        
        currentPage = 1; 
        renderizarTabela(pedidosFiltrados);
        setupPagination(pedidosFiltrados.length);
    });
}

function setupPagination(totalItems) {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const el = document.getElementById('totalPaginas');
    if (el) el.textContent = totalPaginas;
    // Aqui você também pode adicionar lógica para botões "próximo/anterior"
}