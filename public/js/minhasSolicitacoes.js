// public/js/minhasSolicitacoes.js
// ATENÇÃO: Se suas funções de paginação e renderização forem diferentes, você terá que integrar
// estas novas funções com as suas existentes. Este é o esqueleto funcional.

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
// Tabela 1: Pedidos que a ONG criou (status 'disponível')
let pedidosDisponiveisOng = []; 
// Tabela 2: Pedidos que a ONG criou (status 'reservado')
let meusPedidosReservados = [];    
// Tabela 3: Doações que a ONG reservou (status 'reservado')
let doacoesReservadas = [];
const itemsPerPage = 10;
const BASE_URL_ONG = '/doacoesConcluidasONG'; // Prefixos do index.js

// --- Funções Auxiliares de Modal (Reutilizadas da Empresa) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.showModal();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.close();
}

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    // Exponha as funções essenciais globalmente
    window.abrirDetalhesModal = abrirDetalhesModal;
    window.openModal = openModal;
    window.closeModal = closeModal;
    
    carregarUsuario();
    loadMinhasSolicitacoes(); 
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
        // --- 1. Tabela 1: Pedidos Disponíveis (Existente) ---
        const resPedidos = await fetch('/api/meus-pedidos-disponiveis');
        if (!resPedidos.ok) throw new Error('Falha ao carregar meus pedidos disponíveis.');
        pedidosDisponiveisOng = await resPedidos.json();
        renderizarTabelaMeusPedidos(pedidosDisponiveisOng, 'doacoesTableOng', 'pedido-disponivel');

        // --- 2. Tabela 2: Pedidos Reservados (Novo Endpoint) ---
        const resPedidosReservados = await fetch(BASE_URL_ONG + '/meusPedidosReservados');
        if (!resPedidosReservados.ok) throw new Error('Falha ao carregar meus pedidos reservados.');
        meusPedidosReservados = await resPedidosReservados.json();
        renderizarTabelaMeusPedidos(meusPedidosReservados, 'doacoesTableSolicitacaoOng', 'pedido-reservado');

        // --- 3. Tabela 3: Doações Reservadas (Novo Endpoint) ---
        const resDoacoesReservadas = await fetch(BASE_URL_ONG + '/doacoesReservadas');
        if (!resDoacoesReservadas.ok) throw new Error('Falha ao carregar doações reservadas.');
        doacoesReservadas = await resDoacoesReservadas.json();
        renderizarTabelaMeusPedidos(doacoesReservadas, 'doacoesTableExcedenteOng', 'doacao-reservada');

    } catch (error) {
        console.error('Erro ao carregar dados da ONG:', error.message);
        // Exibir erro nas tabelas se necessário
    }
}

// --- Funções de Renderização (Adapte conforme sua implementação real) ---
function renderizarTabelaMeusPedidos(data, tableId, tipo) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;
    tableBody.innerHTML = ''; 

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">Nenhum item encontrado.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const row = tableBody.insertRow();
        
        let acoesHtml = `<button class="btn-details" onclick="abrirDetalhesModal('${item.id}', '${tipo}')">Visualizar</button>`;
        
        // A lógica de renderização para cada tabela é complexa. 
        // Aqui, estou usando um HTML simplificado, ajuste com suas colunas exatas.
        row.innerHTML = `
            <td>${item.nome_alimento}</td>
            <td>${item.quantidade} Kg/L</td>
            <td>${item.NomeEmpresa || item.nomeONG || 'N/A'}</td>
            <td><span class="status ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
            <td>${acoesHtml}</td>
        `;
    });
}


// ===================================================
// LÓGICA DO MODAL E AÇÕES (Cancelamento/Conclusão)
// ===================================================

async function abrirDetalhesModal(id, tipo) {
    // 1. Define o endpoint de busca
    let endpoint = '';
    if (tipo === 'pedido-disponivel' || tipo === 'pedido-reservado') {
        // Pedido que a ONG criou
        endpoint = BASE_URL_ONG + `/detalhes/solicitacao/${id}`;
    } else if (tipo === 'doacao-reservada') {
        // Doação que a ONG reservou
        endpoint = BASE_URL_ONG + `/detalhes/excedente/${id}`;
    } else {
        alert('Tipo de item desconhecido!');
        return;
    }

    // 2. Seleciona elementos do modal
    const modal = document.getElementById('orderModal');
    const modalTitle = document.getElementById('modalTitle');
    const orderIdSpan = document.getElementById('orderId');
    const modalDetails = document.getElementById('modalDetails');
    const itemsList = document.getElementById('itemsList');
    const btnConcluir = document.getElementById('btnConcluir');
    const btnCancelar = document.getElementById('btnCancelar');

    // Verifica se os elementos essenciais existem (proteção contra o erro 'null')
    if (!modal || !modalTitle || !orderIdSpan || !modalDetails) {
        console.error("Erro: Elementos essenciais do modal não encontrados. Verifique os IDs no HTML.");
        return; 
    }
    
    // 3. Limpa e mostra "carregando" (Proteção do SPAN)
    modalTitle.firstChild.textContent = 'Carregando Detalhes... '; 
    orderIdSpan.textContent = `#${id}`; 
    modalDetails.innerHTML = '<p>Carregando...</p>';
    itemsList.innerHTML = '';
    btnConcluir.style.display = 'none';
    btnCancelar.style.display = 'none';

    openModal('orderModal');

    try {
        // 4. Faz o Fetch
        const res = await fetch(endpoint);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(errData.message || 'Falha ao buscar detalhes.');
        }
        
        const data = await res.json();
        console.log("Detalhes recebidos (ONG):", data); 

        // 5. Popula o modal
        const parceiro = data.empresa || data.ong || { 
            nome: data.NomeEmpresa || data.nomeONG || 'N/A', 
            telefone: data.telefone_contato || data.telefoneContato || 'N/A', 
            email: data.email_contato || data.emailContato || 'N/A' 
        };
        const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1);
        
        modalTitle.firstChild.textContent = 'Detalhes '; 
        orderIdSpan.textContent = `#${id}`;

        modalDetails.innerHTML = `
            <p><strong>Instituição Parceira:</strong> <span>${parceiro.nome || 'N/A'}</span></p>
            <p><strong>Status:</strong> <span class="status ${data.status}">${statusText}</span></p>
            <p><strong>Data Cadastro:</strong> <span>${new Date(data.data_cadastro || data.dataCadastroSolicitacao || data.dataCadastroDoacao).toLocaleDateString('pt-BR')}</span></p>
            <p><strong>Contato:</strong> <span>${parceiro.telefone || 'N/A'}</span></p>
            <p><strong>Email:</strong> <span>${parceiro.email || 'N/A'}</span></p>
        `;
        
        itemsList.innerHTML = `
            <tr>
                <td>${data.nome_alimento}</td>
                <td>${data.quantidade}</td>
                <td>Kg</td>
                <td>${data.observacoes || '-'}</td>
            </tr>
        `;

        // 6. Controla os botões de Ação
        if (tipo === 'pedido-disponivel') {
            // Tabela 1: Pedido que a ONG cadastrou. Não permite Concluir/Cancelar.
            // A ONG pode apenas Excluir/Editar, mas isso é feito na função renderizar
            
        } else if (tipo === 'pedido-reservado') {
            // Tabela 2: Meu Pedido que uma EMPRESA reservou -> Ações: Concluir e Cancelar
            btnConcluir.style.display = 'inline-block';
            btnCancelar.style.display = 'inline-block';
            btnConcluir.textContent = 'Concluir Pedido Recebido';
            
            // AÇÃO: A ONG conclui o próprio pedido. O item_id é do tipo 'pedido'.
            btnConcluir.onclick = () => confirmarAcao('concluir-pedido', id, 'pedido', 'concluir este pedido');
            btnCancelar.onclick = () => confirmarAcao('cancelar-reserva', id, 'pedido', 'cancelar esta reserva');

        } else if (tipo === 'doacao-reservada') {
            // Tabela 3: Doação de EMPRESA que EU (ONG) reservei -> Ações: Concluir e Cancelar
            btnConcluir.style.display = 'inline-block';
            btnCancelar.style.display = 'inline-block';
            btnConcluir.textContent = 'Concluir Doação Recebida';

            // AÇÃO: A ONG conclui a doação que reservou. O item_id é do tipo 'doacao'.
            btnConcluir.onclick = () => confirmarAcao('concluir-doacao', id, 'doacao', 'concluir esta doação');
            btnCancelar.onclick = () => confirmarAcao('cancelar-reserva', id, 'doacao', 'cancelar esta reserva');
        }

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
        modalTitle.firstChild.textContent = 'Erro ';
        orderIdSpan.textContent = '';
        modalDetails.innerHTML = `<p style="color: red;">${erro.message}</p>`;
    }
}

// --- Funções de Confirmação e Execução de Ação (Reutilizadas) ---
function confirmarAcao(acao, id, tipo, mensagem) {
    closeModal('orderModal');
    
    const btnConfirmar = document.getElementById('btnConfirmarAcao');
    document.getElementById('confirmMessage').innerHTML = `Tem certeza que deseja **${mensagem}**?`;
    
    btnConfirmar.textContent = acao.includes('cancelar') ? 'Sim, Cancelar' : 'Sim, Concluir';
    
    btnConfirmar.onclick = () => {
        executarAcao(acao, id, tipo);
    };
    
    openModal('confirmModal');
}

async function executarAcao(acao, id, tipo) {
    closeModal('confirmModal');
    
    // As rotas de ação (concluir/cancelar) são as mesmas para Empresa e ONG
    const endpoint = `/reserva/${acao}`;
    
    const bodyData = {
        item_id: id, 
        tipo_item: tipo // 'doacao' ou 'pedido'
    };
    
    try {
        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || `Ação realizada com sucesso!`);
            window.location.reload(); 
        } else {
            alert(`Falha ao realizar ação: ${data.message || 'Erro desconhecido.'}`);
        }

    } catch (error) {
        console.error(`Erro na requisição de ${acao}:`, error);
        alert(`Erro de comunicação com o servidor. Tente novamente.`);
    }
}