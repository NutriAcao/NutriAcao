// public/js/minhasSolicitacoes.js

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let pedidosDisponiveisOng = []; 
let meusPedidosReservados = [];    
let doacoesReservadas = [];
const itemsPerPage = 10;

// --- Funções Auxiliares de Modal ---
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
    window.abrirDetalhesModal = abrirDetalhesModal;
    window.openModal = openModal;
    window.closeModal = closeModal;
    
    carregarDadosUsuario();
    loadMinhasSolicitacoes(); 
});

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
            atualizarElementoUI('textNomeUsuario', dados.nome || 'Usuário');
            const nomeInstituicao = dados.nome_ong || dados.nome_fantasia || dados.razao_social || 'Instituição';
            atualizarElementoUI('textNomeInstituicao', nomeInstituicao);
            
            console.log('>>> Dados carregados:', {
                nome: dados.nome,
                instituicao: nomeInstituicao
            });
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
    } else {
        console.warn(`Elemento com ID '${elementId}' não encontrado`);
    }
}

async function loadMinhasSolicitacoes() {
    try {
        console.log("🔄 Carregando minhas solicitações...");
        
        const responseDisponiveis = await fetch('/api/meus-pedidos-disponiveis');
        if (!responseDisponiveis.ok) {
            throw new Error('Falha ao carregar meus pedidos disponíveis.');
        }
        const solicitacoesDisponiveis = await responseDisponiveis.json();
        
        const responseReservados = await fetch('/api/meus-pedidos-reservados');
        if (!responseReservados.ok) {
            throw new Error('Falha ao carregar meus pedidos reservados.');
        }
        const solicitacoesReservadas = await responseReservados.json();
        
        const responseDoacoes = await fetch('/api/doacoes-reservadas-ong');
        if (!responseDoacoes.ok) {
            throw new Error('Falha ao carregar doações reservadas.');
        }
        const doacoesReservadas = await responseDoacoes.json();

        console.log("✅ Dados carregados:", {
            disponiveis: solicitacoesDisponiveis,
            reservadas: solicitacoesReservadas, 
            doacoes: doacoesReservadas
        });

        // CORREÇÃO: Salva os dados globalmente para usar no modal
        window.pedidosDisponiveisOng = solicitacoesDisponiveis;
        window.meusPedidosReservados = solicitacoesReservadas;
        window.doacoesReservadas = doacoesReservadas;

        renderizarTabelaMeusPedidos(solicitacoesDisponiveis, 'doacoesTableOng', 'pedido-disponivel');
        renderizarTabelaMeusPedidos(solicitacoesReservadas, 'doacoesTableSolicitacaoOng', 'pedido-reservado');
        renderizarTabelaMeusPedidos(doacoesReservadas, 'doacoesTableExcedenteOng', 'doacao-reservada');

    } catch (error) {
        console.error('❌ Erro ao carregar dados da ONG:', error);
        alert(error.message);
    }
}

// CORREÇÃO: Função de renderização com campos corretos
function renderizarTabelaMeusPedidos(data, tableId, tipo) {
    console.log(`🔄 Renderizando tabela ${tableId} com tipo ${tipo}`, data);
    
    let tableBody;
    if (tableId === 'doacoesTableOng') {
        tableBody = document.getElementById('tableBodyDisponiveis');
    } else if (tableId === 'doacoesTableSolicitacaoOng') {
        tableBody = document.getElementById('tableBodyReservados');
    } else if (tableId === 'doacoesTableExcedenteOng') {
        tableBody = document.getElementById('tableBodyDoacoes');
    }
    
    if (!tableBody) {
        console.error(`❌ Elemento tbody não encontrado para tabela '${tableId}'`);
        return;
    }
    
    tableBody.innerHTML = ''; 

    if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="no-data">Nenhum item encontrado.</td></tr>`;
        console.log(`ℹ️  Nenhum dado para tabela ${tableId}`);
        return;
    }

    console.log(`✅ Renderizando ${data.length} itens na tabela ${tableId}`);

    data.forEach(item => {
        const row = tableBody.insertRow();
        
        // CORREÇÃO: Usa os campos corretos da API
        let nomeAlimento = item.titulo || item.nome_alimento || 'N/A';
        
        // CORREÇÃO: Usa quantidade_desejada para pedidos, quantidade para doações
        let quantidade = '';
        if (tipo === 'pedido-disponivel' || tipo === 'pedido-reservado') {
            quantidade = item.quantidade_desejada ? `${item.quantidade_desejada} Kg/L` : 'N/A';
        } else {
            quantidade = item.quantidade ? `${item.quantidade} Kg/L` : 'N/A';
        }
        
        // CORREÇÃO: Nome da empresa corrigido
        let nomeParceiro = 'N/A';
        if (tipo === 'pedido-disponivel') {
            nomeParceiro = 'Aguardando empresa';
        } else if (tipo === 'pedido-reservado') {
            // Para pedidos reservados, mostra a empresa que reservou
            nomeParceiro = item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || item.nome_empresa || 'Empresa Parceira';
        } else if (tipo === 'doacao-reservada') {
            // Para doações reservadas, mostra a empresa que criou a doação
            nomeParceiro = item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || item.nome_empresa || 'Empresa Doadora';
        }
        
        let status = item.status || 'desconhecido';
        let statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        let acoesHtml = `<button class="btn-details btn-secondary" onclick="abrirDetalhesModal('${item.id}', '${tipo}')">Visualizar</button>`;
        
        row.innerHTML = `
            <td>${nomeAlimento}</td>
            <td>${quantidade}</td>
            <td>${nomeParceiro}</td>
            <td><span class="status ${status}">${statusText}</span></td>
            <td class="actions">${acoesHtml}</td>
        `;
    });
    
    console.log(`✅ Tabela ${tableId} renderizada com sucesso`);
}

// CORREÇÃO: Função do modal com campos corretos
async function abrirDetalhesModal(id, tipo) {
    console.log(`🔍 Abrindo modal para ${tipo} ID: ${id}`);
    
    // Busca o item nos dados já carregados globalmente
    let itemData = null;
    
    if (tipo === 'pedido-disponivel') {
        itemData = window.pedidosDisponiveisOng.find(item => item.id == id);
    } else if (tipo === 'pedido-reservado') {
        itemData = window.meusPedidosReservados.find(item => item.id == id);
    } else if (tipo === 'doacao-reservada') {
        itemData = window.doacoesReservadas.find(item => item.id == id);
    }

    console.log("📦 Dados encontrados para o modal:", itemData);

    if (!itemData) {
        console.error('❌ Item não encontrado nos dados carregados');
        alert('Não foi possível carregar os detalhes deste item.');
        return;
    }

    const modal = document.getElementById('orderModal');
    const modalTitle = document.getElementById('modalTitle');
    const orderIdSpan = document.getElementById('orderId');
    const modalDetails = document.getElementById('modalDetails');
    const itemsList = document.getElementById('itemsList');
    const btnConcluir = document.getElementById('btnConcluir');
    const btnCancelar = document.getElementById('btnCancelar');

    if (!modal || !modalTitle || !orderIdSpan || !modalDetails) {
        console.error("Erro: Elementos essenciais do modal não encontrados.");
        return; 
    }
    
    // Limpa o modal
    modalTitle.innerHTML = 'Carregando Detalhes... <span id="orderId"></span>';
    orderIdSpan.textContent = `#${id}`; 
    modalDetails.innerHTML = '<p>Carregando...</p>';
    
    if (itemsList) itemsList.innerHTML = '';
    if (btnConcluir) btnConcluir.style.display = 'none';
    if (btnCancelar) btnCancelar.style.display = 'none';

    openModal('orderModal');

    try {
        // CORREÇÃO: Popula o modal com os campos corretos da API
        const statusText = itemData.status ? itemData.status.charAt(0).toUpperCase() + itemData.status.slice(1) : 'Desconhecido';
        
        // CORREÇÃO: Usa os campos corretos baseados na estrutura real da API
        const nomeAlimento = itemData.titulo || itemData.nome_alimento || 'N/A';
        const descricao = itemData.descricao || itemData.observacoes || '-';
        const quantidade = itemData.quantidade_desejada || itemData.quantidade || 'N/A';
        
        // CORREÇÃO: Data de publicação correta
        const dataPublicacao = itemData.data_publicacao || itemData.data_criacao || itemData.data_cadastro || itemData.dataCadastroSolicitacao || itemData.dataCadastroDoacao;
        
        // CORREÇÃO: Informações da empresa
        const empresaNome = itemData.empresa?.nome_fantasia || itemData.empresa?.razao_social || 'N/A';
        const empresaEmail = itemData.empresa?.email_institucional || itemData.empresa?.email || 'N/A';
        const empresaTelefone = itemData.empresa?.telefone || itemData.telefone_contato || 'N/A';
        
        modalTitle.innerHTML = `Detalhes <span id="orderId">#${id}</span>`;
        orderIdSpan.textContent = `#${id}`;

        // CORREÇÃO: HTML do modal com campos corretos
        modalDetails.innerHTML = `
            <p><strong>Item:</strong> <span>${nomeAlimento}</span></p>
            <p><strong>Descrição:</strong> <span>${descricao}</span></p>
            <p><strong>Status:</strong> <span class="status ${itemData.status || ''}">${statusText}</span></p>
            <p><strong>Quantidade:</strong> <span>${quantidade} Kg/L</span></p>
            <p><strong>Data de Publicação:</strong> <span>${formatarData(dataPublicacao)}</span></p>
            <p><strong>Empresa:</strong> <span>${empresaNome}</span></p>
            <p><strong>Email:</strong> <span>${empresaEmail}</span></p>
            <p><strong>Telefone:</strong> <span>${empresaTelefone}</span></p>
            ${itemData.categoria ? `<p><strong>Categoria:</strong> <span>${itemData.categoria.nome || itemData.categoria}</span></p>` : ''}
            ${itemData.data_validade ? `<p><strong>Data de Validade:</strong> <span>${formatarData(itemData.data_validade)}</span></p>` : ''}
        `;
        
        if (itemsList) {
            itemsList.innerHTML = `
                <tr>
                    <td>${nomeAlimento}</td>
                    <td>${quantidade}</td>
                    <td>Kg/L</td>
                    <td>${descricao}</td>
                </tr>
            `;
        }

        // Configura botões de ação
        if (btnConcluir && btnCancelar) {
            if (tipo === 'pedido-disponivel') {
                btnConcluir.style.display = 'none';
                btnCancelar.style.display = 'none';
            } else if (tipo === 'pedido-reservado') {
                btnConcluir.style.display = 'inline-block';
                btnCancelar.style.display = 'inline-block';
                btnConcluir.textContent = 'Concluir Pedido Recebido';
                btnConcluir.onclick = () => confirmarAcao('concluir-pedido', id, 'pedido', 'concluir este pedido');
                btnCancelar.onclick = () => confirmarAcao('cancelar-reserva', id, 'pedido', 'cancelar esta reserva');
            } else if (tipo === 'doacao-reservada') {
                btnConcluir.style.display = 'inline-block';
                btnCancelar.style.display = 'inline-block';
                btnConcluir.textContent = 'Concluir Doação Recebida';
                btnConcluir.onclick = () => confirmarAcao('concluir-doacao', id, 'doacao', 'concluir esta doação');
                btnCancelar.onclick = () => confirmarAcao('cancelar-reserva', id, 'doacao', 'cancelar esta reserva');
            }
        }

    } catch (erro) {
        console.error("❌ Erro ao carregar detalhes:", erro);
        modalTitle.innerHTML = 'Erro <span id="orderId"></span>';
        orderIdSpan.textContent = '';
        modalDetails.innerHTML = `<p style="color: red;">${erro.message}</p>`;
    }
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        return new Date(dataString).toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

function confirmarAcao(acao, id, tipo, mensagem) {
    closeModal('orderModal');
    
    const btnConfirmar = document.getElementById('btnConfirmarAcao');
    const confirmMessage = document.getElementById('confirmMessage');
    
    if (!btnConfirmar || !confirmMessage) {
        console.error('Elementos do modal de confirmação não encontrados');
        return;
    }
    
    confirmMessage.innerHTML = `Tem certeza que deseja <strong>${mensagem}</strong>?`;
    
    btnConfirmar.textContent = acao.includes('cancelar') ? 'Sim, Cancelar' : 'Sim, Concluir';
    
    btnConfirmar.onclick = () => {
        executarAcao(acao, id, tipo);
    };
    
    openModal('confirmModal');
}
    // Rota para concluir doação (ONG marca doação como recebida)
router.put('/concluir-doacao', verificarToken, async (req, res) => {
    try {
        const { item_id, tipo_item } = req.body;

        if (!item_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID do item é obrigatório' 
            });
        }

        console.log(`🔄 Concluindo doação ID: ${item_id}, Tipo: ${tipo_item}`);

        // Buscar a doação reservada
        const { data: doacaoReservada, error: errorBusca } = await supabase
            .from('doacoes_reservadas')
            .select('*')
            .eq('id', item_id)
            .single();

        if (errorBusca) {
            console.error('Erro ao buscar doação reservada:', errorBusca);
            return res.status(404).json({ 
                success: false, 
                message: 'Doação não encontrada' 
            });
        }

        if (!doacaoReservada) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doação não encontrada' 
            });
        }

        // Inserir na tabela de doações concluídas
        const { data: doacaoConcluida, error: errorConcluir } = await supabase
            .from('doacoes_concluidas')
            .insert({
                empresa_id: doacaoReservada.empresa_id,
                ong_id: doacaoReservada.ong_id,
                excedente_id: doacaoReservada.excedente_id,
                titulo: doacaoReservada.titulo,
                descricao: doacaoReservada.descricao,
                quantidade: doacaoReservada.quantidade,
                data_validade: doacaoReservada.data_validade,
                status: 'concluída',
                data_publicacao: new Date()
            })
            .select()
            .single();

        if (errorConcluir) {
            console.error('Erro ao concluir doação:', errorConcluir);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao concluir doação' 
            });
        }

        // Remover da tabela de doações reservadas
        const { error: errorRemover } = await supabase
            .from('doacoes_reservadas')
            .delete()
            .eq('id', item_id);

        if (errorRemover) {
            console.error('Erro ao remover doação reservada:', errorRemover);
            // Mesmo com erro na remoção, a doação já foi concluída
        }

        console.log('✅ Doação concluída com sucesso:', doacaoConcluida.id);

        res.json({
            success: true,
            message: 'Doação concluída com sucesso!',
            data: doacaoConcluida
        });

    } catch (err) {
        console.error('Erro na rota /concluir-doacao:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

async function executarAcao(acao, id, tipo) {
    closeModal('confirmModal');
    
    let endpoint = '';
    if (acao === 'concluir-pedido') {
        endpoint = '/api/concluir-pedido';
    } else if (acao === 'concluir-doacao') {
        endpoint = '/api/concluir-doacao';
    } else if (acao === 'cancelar-reserva') {
        endpoint = '/api/cancelar-reserva';
    }
    
    const bodyData = {
        item_id: id, 
        tipo_item: tipo
    };
    
    try {
        console.log(`🚀 Executando ação: ${acao} para ${tipo} ID: ${id}`);
        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        const data = await res.json();

        if (res.ok && data.success) {
            alert(data.message || `Ação realizada com sucesso!`);
            window.location.reload(); 
        } else {
            alert(`Falha ao realizar ação: ${data.message || 'Erro desconhecido.'}`);
        }

    } catch (error) {
        console.error(`❌ Erro na requisição de ${acao}:`, error);
        alert(`Erro de comunicação com o servidor. Tente novamente.`);
    }
}