// public/js/relatorioImpacto.js - VERSÃO TOLERANTE COMPLETA

// === VARIÁVEIS GLOBAIS ===
let dadosUsuario = {};
let dadosOriginais = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 5;
let chartTipoAlimento, chartTemporal, chartOngs;

// === CARREGAMENTO INICIAL ===
document.addEventListener('DOMContentLoaded', function() {
    window.closeModal = closeModal;
    carregarDadosUsuario();
    inicializarComponentes();
});

// === FUNÇÕES PRINCIPAIS ===

async function carregarDadosReais() {
    try {
        console.log('🔄 Carregando dados reais do banco...');
        mostrarLoading(true);
        
        // Determinar qual endpoint usar baseado no tipo de usuário
        let endpoint;
        if (dadosUsuario.tipo === 'ong') {
            endpoint = '/api/relatorios/relatorios-consumo';
        } else {
            endpoint = '/api/relatorios/relatorios-impacto';
        }
        
        console.log('🔗 Fazendo requisição para:', endpoint, 'Tipo usuário:', dadosUsuario.tipo);
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        console.log('📡 Status da resposta:', response.status);
        
        // VERIFICAÇÃO TOLERANTE - não redireciona, só mostra mensagem
        if (response.status === 401 || response.status === 403) {
            console.log('⚠️ Acesso não autorizado para este relatório');
            mostrarMensagem('Você não tem dados disponíveis para este tipo de relatório', 'info');
            
            // Limpa dados e mostra estado vazio
            dadosOriginais = [];
            filteredData = [];
            atualizarResumo();
            renderizarTabela();
            atualizarGraficos();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('✅ Resposta da API:', resultado);
        
        if (!resultado.success) {
            throw new Error(resultado.error || 'Erro na resposta da API');
        }

        console.log('📊 Dados recebidos:', resultado.data);
        
        dadosOriginais = resultado.data || [];
        filteredData = [...dadosOriginais];
        
        // Preencher filtro de ONGs (apenas para empresas)
        if (dadosUsuario.tipo === 'empresa') {
            preencherFiltroOngs();
        } else if (dadosUsuario.tipo === 'ong') {
            preencherFiltroEmpresas();
        }
        
        // Atualizar interface
        atualizarResumo();
        renderizarTabela();
        atualizarGraficos();
        
        if (dadosOriginais.length > 0) {
            mostrarMensagem(`Carregadas ${dadosOriginais.length} doações com sucesso`, 'success');
        } else {
            mostrarMensagem('Nenhum dado encontrado para o seu perfil', 'info');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados reais:', error);
        
        // MENSAGEM TOLERANTE - não redireciona
        if (error.message.includes('401') || error.message.includes('403')) {
            mostrarMensagem('Você não tem acesso a este tipo de relatório', 'info');
        } else {
            mostrarMensagem('Erro ao carregar dados do servidor', 'error');
        }
        
        // Mostra estado vazio
        dadosOriginais = [];
        filteredData = [];
        atualizarResumo();
        renderizarTabela();
        atualizarGraficos();
    } finally {
        mostrarLoading(false);
    }
}

async function carregarDadosUsuario() {
    try {
        console.log('>>> Carregando dados do usuário...');
        
        const response = await fetch('/api/usuarioToken', {
            credentials: 'include'
        });
        
        console.log('📡 Status da resposta do usuário:', response.status);
        
        // VERIFICAÇÃO TOLERANTE - se não conseguir carregar usuário, continua mesmo assim
        if (response.status === 401) {
            console.log('⚠️ Não foi possível carregar dados do usuário, continuando...');
            dadosUsuario = { tipo: 'desconhecido' };
            atualizarElementoUI('textNomeUsuario', 'Visitante');
            atualizarElementoUI('textNomeInstituicao', 'Instituição');
            
            // Tenta carregar relatórios mesmo sem usuário
            await carregarDadosReais();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('>>> Dados do usuário:', resultado);
        
        dadosUsuario = resultado;
        
        // Usar os campos corretos do objeto usuário
        atualizarElementoUI('textNomeUsuario', dadosUsuario.nome || 'Usuário');
        
        const nomeInstituicao = dadosUsuario.nomeInstituicao || 
                               dadosUsuario.nome_fantasia || 
                               dadosUsuario.razao_social || 
                               dadosUsuario.nome_ong || 
                               'Instituição';
        atualizarElementoUI('textNomeInstituicao', nomeInstituicao);
        
        // Carregar dados dos relatórios
        await carregarDadosReais();
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error);
        
        // CONTINUA MESMO COM ERRO - não bloqueia
        dadosUsuario = { tipo: 'desconhecido' };
        atualizarElementoUI('textNomeUsuario', 'Usuário');
        atualizarElementoUI('textNomeInstituicao', 'Instituição');
        mostrarMensagem('Não foi possível carregar dados do usuário', 'info');
        
        // Tenta carregar relatórios mesmo com erro
        await carregarDadosReais();
    }
}

function inicializarComponentes() {
    // Inicializar datepickers
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#dataInicio", {
            locale: "pt",
            dateFormat: "d/m/Y",
            defaultDate: new Date(new Date().setDate(new Date().getDate() - 30))
        });
        
        flatpickr("#dataFim", {
            locale: "pt",
            dateFormat: "d/m/Y",
            defaultDate: new Date()
        });
    }
    
    // Configurar eventos
    document.getElementById('periodo').addEventListener('change', toggleCustomDate);
    document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltros);
    document.getElementById('exportarRelatorio').addEventListener('click', exportarRelatorio);
    document.getElementById('searchInput').addEventListener('input', filtrarTabela);
    document.getElementById('prevPage').addEventListener('click', () => mudarPagina(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => mudarPagina(currentPage + 1));
    document.getElementById('exportarDetalhes').addEventListener('click', exportarDetalhes);
    
    // Inicializar gráficos
    inicializarGraficos();
}

// === FUNÇÕES DE UTILIDADE ===
function atualizarElementoUI(elementId, texto) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = texto;
    }
}

function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = mostrar ? 'flex' : 'none';
    }
}

function getToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') return value;
    }
    return null;
}

function mostrarMensagem(mensagem, tipo) {
    // Remover mensagens existentes
    const mensagensExistentes = document.querySelectorAll('.mensagem');
    mensagensExistentes.forEach(msg => msg.remove());
    
    const mensagemEl = document.createElement('div');
    mensagemEl.className = `mensagem ${tipo}`;
    mensagemEl.textContent = mensagem;
    
    document.body.appendChild(mensagemEl);
    
    setTimeout(() => {
        mensagemEl.remove();
    }, 5000);
}

// === FUNÇÕES DE FILTRO ===
function toggleCustomDate() {
    const periodo = document.getElementById('periodo').value;
    const customDateFields = document.querySelectorAll('.custom-date');
    
    if (periodo === 'custom') {
        customDateFields.forEach(field => field.style.display = 'flex');
    } else {
        customDateFields.forEach(field => field.style.display = 'none');
    }
}

function aplicarFiltros() {
    try {
        const periodo = document.getElementById('periodo').value;
        const tipoAlimento = document.getElementById('tipoAlimento').value;
        const ong = document.getElementById('ong').value;
        
        aplicarFiltrosCliente(periodo, tipoAlimento, ong);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar filtros:', error);
        mostrarMensagem('Erro ao aplicar filtros', 'error');
    }
}

function aplicarFiltrosCliente(periodo, tipoAlimento, ong) {
    let dadosFiltrados = [...dadosOriginais];
    
    // Filtro de tipo de alimento
    if (tipoAlimento !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(doacao => 
            doacao.alimentos && doacao.alimentos.some(alimento => 
                alimento.categoria?.toLowerCase() === tipoAlimento.toLowerCase() ||
                alimento.nome.toLowerCase().includes(tipoAlimento.toLowerCase())
            )
        );
    }
    
    // Filtro de ONG (apenas para empresas)
    if (ong !== 'todas' && dadosUsuario.tipo === 'empresa') {
        dadosFiltrados = dadosFiltrados.filter(doacao => 
            doacao.ong && doacao.ong.toLowerCase().includes(ong.toLowerCase())
        );
    }
    
    // Filtro de Empresa (apenas para ONGs)
    if (ong !== 'todas' && dadosUsuario.tipo === 'ong') {
        // Note: usando 'ong' como parâmetro para empresa também
        dadosFiltrados = dadosFiltrados.filter(doacao => 
            doacao.empresa && doacao.empresa.toLowerCase().includes(ong.toLowerCase())
        );
    }
    
    // Filtro de período
    if (periodo !== 'todos') {
        let dataInicio, dataFim;
        
        if (periodo === 'custom') {
            const dataInicioStr = document.getElementById('dataInicio').value;
            const dataFimStr = document.getElementById('dataFim').value;
            
            if (dataInicioStr && dataFimStr) {
                dataInicio = parseDate(dataInicioStr);
                dataFim = parseDate(dataFimStr);
            }
        } else {
            const dias = parseInt(periodo);
            dataFim = new Date();
            dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - dias);
        }
        
        if (dataInicio && dataFim) {
            dadosFiltrados = dadosFiltrados.filter(doacao => {
                const dataDoacao = new Date(doacao.data);
                return dataDoacao >= dataInicio && dataDoacao <= dataFim;
            });
        }
    }

    filteredData = dadosFiltrados;
    currentPage = 1;
    
    // Atualizar interface
    atualizarResumo();
    renderizarTabela();
    atualizarGraficos();
    
    mostrarMensagem(`Filtros aplicados: ${filteredData.length} doações encontradas`, 'success');
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}

function preencherFiltroOngs() {
    const ongSelect = document.getElementById('ong');
    if (!ongSelect) return;
    
    // Coletar ONGs únicas dos dados
    const ongsUnicas = [...new Set(dadosOriginais.map(doacao => doacao.ong))].filter(ong => ong && ong !== 'ONG não especificada');
    
    ongSelect.innerHTML = '<option value="todas">Todas</option>';
    
    ongsUnicas.forEach(ong => {
        const option = document.createElement('option');
        option.value = ong;
        option.textContent = ong;
        ongSelect.appendChild(option);
    });
}

function preencherFiltroEmpresas() {
    const empresaSelect = document.getElementById('ong'); // Usando o mesmo select
    if (!empresaSelect) return;
    
    // Coletar empresas únicas dos dados
    const empresasUnicas = [...new Set(dadosOriginais.map(doacao => doacao.empresa))].filter(empresa => empresa && empresa !== 'Empresa não especificada');
    
    empresaSelect.innerHTML = '<option value="todas">Todas</option>';
    
    empresasUnicas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa;
        option.textContent = empresa;
        empresaSelect.appendChild(option);
    });
}

// === FUNÇÕES DE RENDERIZAÇÃO ===
function atualizarResumo() {
    const totalAlimentos = filteredData.reduce((sum, doacao) => sum + (doacao.totalAlimentos || 0), 0);
    const totalRefeicoes = filteredData.reduce((sum, doacao) => sum + (doacao.totalRefeicoes || 0), 0);
    const totalCO2 = filteredData.reduce((sum, doacao) => sum + (doacao.totalCO2 || 0), 0);
    
    const pessoasBeneficiadas = Math.round(totalRefeicoes / 3);

    atualizarElementoUI('totalAlimentos', `${totalAlimentos.toFixed(1)} kg`);
    atualizarElementoUI('totalRefeicoes', totalRefeicoes.toLocaleString());
    atualizarElementoUI('pessoasBeneficiadas', pessoasBeneficiadas.toLocaleString());
    atualizarElementoUI('co2Evitado', `${totalCO2.toFixed(1)} kg`);
}

function renderizarTabela() {
    const tableBody = document.getElementById('tableBody');
    const totalItens = document.getElementById('totalItens');
    const totalPaginas = document.getElementById('totalPaginas');
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    totalItens.textContent = filteredData.length;
    totalPaginas.textContent = totalPages;
    
    tableBody.innerHTML = '';
    
    if (paginatedData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">Nenhuma doação encontrada com os filtros aplicados</td>
            </tr>
        `;
        return;
    }
    
    paginatedData.forEach(doacao => {
        const row = document.createElement('tr');
        
        // Ajusta a coluna baseado no tipo de usuário
        const colunaInstituicao = dadosUsuario.tipo === 'ong' ? doacao.empresa : doacao.ong;
        
        row.innerHTML = `
            <td>${formatarData(doacao.data)}</td>
            <td>${doacao.alimentos ? doacao.alimentos.map(a => a.nome).join(', ') : 'N/A'}</td>
            <td>${(doacao.totalAlimentos || 0).toFixed(1)} kg</td>
            <td>${colunaInstituicao || 'Não especificada'}</td>
            <td>${(doacao.totalRefeicoes || 0).toLocaleString()}</td>
            <td>${(doacao.totalCO2 || 0).toFixed(1)} kg</td>
            <td><span class="status ${doacao.status}">${formatarStatus(doacao.status)}</span></td>
        `;
        
        row.addEventListener('click', () => abrirModalDoacao(doacao));
        tableBody.appendChild(row);
    });
    
    atualizarControlesPaginacao(totalPages);
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        return new Date(dataString).toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

function formatarStatus(status) {
    const statusMap = {
        'entregue': 'Entregue',
        'pendente': 'Pendente',
        'cancelado': 'Cancelado',
        'coletado': 'Coletado',
        'concluido': 'Concluído',
        'finalizado': 'Finalizado',
        'concluída': 'Concluída',
        'concluído': 'Concluído'
    };
    return statusMap[status] || status;
}

function atualizarControlesPaginacao(totalPages) {
    const paginationControls = document.querySelector('.pagination-controls');
    const pageButtons = paginationControls.querySelectorAll('.page-btn');
    
    pageButtons.forEach(btn => btn.remove());
    
    const prevBtn = document.getElementById('prevPage');
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.dataset.page = i;
        pageBtn.addEventListener('click', () => mudarPagina(i));
        prevBtn.after(pageBtn);
    }
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

function mudarPagina(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderizarTabela();
}

function filtrarTabela() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        renderizarTabela();
        return;
    }
    
    const filtered = filteredData.filter(doacao => 
        (doacao.alimentos && doacao.alimentos.some(alimento => 
            alimento.nome.toLowerCase().includes(searchTerm)
        )) ||
        (doacao.ong && doacao.ong.toLowerCase().includes(searchTerm)) ||
        (doacao.empresa && doacao.empresa.toLowerCase().includes(searchTerm)) ||
        (doacao.status && doacao.status.toLowerCase().includes(searchTerm))
    );
    
    const tempData = filteredData;
    filteredData = filtered;
    renderizarTabela();
    filteredData = tempData;
}

// === FUNÇÕES DE GRÁFICOS ===
function inicializarGraficos() {
    const ctxTipoAlimento = document.getElementById('chartTipoAlimento').getContext('2d');
    const ctxTemporal = document.getElementById('chartTemporal').getContext('2d');
    const ctxOngs = document.getElementById('chartOngs').getContext('2d');
    
    chartTipoAlimento = new Chart(ctxTipoAlimento, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#004AAD', '#3498db', '#2ecc71', '#f39c12', 
                    '#e74c3c', '#9b59b6', '#1abc9c', '#34495e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    chartTemporal = new Chart(ctxTemporal, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Alimentos Doados (kg)',
                data: [],
                borderColor: '#004AAD',
                backgroundColor: 'rgba(0, 74, 173, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    chartOngs = new Chart(ctxOngs, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: dadosUsuario.tipo === 'ong' ? 'Empresas Doadoras' : 'ONGs Beneficiadas',
                data: [],
                backgroundColor: '#004AAD'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function atualizarGraficos() {
    // Gráfico por tipo de alimento
    const alimentosPorCategoria = agruparPorCategoria();
    chartTipoAlimento.data.labels = Object.keys(alimentosPorCategoria);
    chartTipoAlimento.data.datasets[0].data = Object.values(alimentosPorCategoria);
    chartTipoAlimento.update();
    
    // Gráfico temporal (últimos 30 dias)
    const dadosTemporais = agruparPorData();
    chartTemporal.data.labels = Object.keys(dadosTemporais);
    chartTemporal.data.datasets[0].data = Object.values(dadosTemporais);
    chartTemporal.update();
    
    // Gráfico por ONG/Empresa
    const doacoesPorInstituicao = agruparPorInstituicao();
    chartOngs.data.labels = Object.keys(doacoesPorInstituicao);
    chartOngs.data.datasets[0].data = Object.values(doacoesPorInstituicao);
    chartOngs.update();
}

function agruparPorCategoria() {
    const categorias = {};
    
    filteredData.forEach(doacao => {
        if (doacao.alimentos) {
            doacao.alimentos.forEach(alimento => {
                const categoria = determinarCategoria(alimento.nome);
                categorias[categoria] = (categorias[categoria] || 0) + alimento.quantidade;
            });
        }
    });
    
    return categorias;
}

function determinarCategoria(nomeAlimento) {
    const categorias = {
        'frutas': ['maçã', 'banana', 'laranja', 'uva', 'mamão', 'melancia', 'abacaxi'],
        'legumes': ['cenoura', 'batata', 'tomate', 'cebola', 'abobrinha', 'berinjela'],
        'verduras': ['alface', 'couve', 'rúcula', 'espinafre', 'agrião', 'acelga'],
        'graos': ['arroz', 'feijão', 'milho', 'trigo', 'aveia', 'soja', 'lentilha'],
        'laticinios': ['leite', 'queijo', 'iogurte', 'manteiga', 'requeijão'],
        'outros': ['pão', 'óleo', 'açúcar', 'sal', 'macarrão', 'farinha']
    };
    
    nomeAlimento = (nomeAlimento || '').toLowerCase();
    
    for (const [categoria, alimentos] of Object.entries(categorias)) {
        if (alimentos.some(alimento => nomeAlimento.includes(alimento))) {
            return categoria;
        }
    }
    
    return 'outros';
}

function agruparPorData() {
    const dados = {};
    const hoje = new Date();
    
    // Inicializar últimos 30 dias
    for (let i = 29; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        const dataStr = data.toLocaleDateString('pt-BR');
        dados[dataStr] = 0;
    }
    
    // Preencher com dados reais
    filteredData.forEach(doacao => {
        const dataDoacao = new Date(doacao.data);
        const dataStr = dataDoacao.toLocaleDateString('pt-BR');
        
        if (dados[dataStr] !== undefined) {
            dados[dataStr] += (doacao.totalAlimentos || 0);
        }
    });
    
    return dados;
}

function agruparPorInstituicao() {
    const instituicoes = {};
    
    filteredData.forEach(doacao => {
        const instituicao = dadosUsuario.tipo === 'ong' ? doacao.empresa : doacao.ong;
        if (instituicao) {
            instituicoes[instituicao] = (instituicoes[instituicao] || 0) + (doacao.totalAlimentos || 0);
        }
    });
    
    return instituicoes;
}

// === FUNÇÕES DE MODAL ===
function abrirModalDoacao(doacao) {
    const modal = document.getElementById('doacaoModal');
    
    // Preencher dados básicos
    document.getElementById('doacaoId').textContent = doacao.id;
    document.getElementById('doacaoData').textContent = formatarData(doacao.data);
    document.getElementById('doacaoOng').textContent = dadosUsuario.tipo === 'ong' ? doacao.empresa : doacao.ong;
    document.getElementById('doacaoStatus').textContent = formatarStatus(doacao.status);
    document.getElementById('doacaoResponsavel').textContent = doacao.responsavel;
    document.getElementById('doacaoEndereco').textContent = doacao.endereco;
    document.getElementById('doacaoTelefone').textContent = doacao.telefone;
    
    // Preencher itens
    const itemsList = document.getElementById('doacaoItemsList');
    itemsList.innerHTML = '';
    
    if (doacao.alimentos) {
        doacao.alimentos.forEach(alimento => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${alimento.nome}</td>
                <td>${alimento.quantidade}</td>
                <td>${alimento.unidade}</td>
                <td>${alimento.refeicoes}</td>
                <td>${(alimento.co2 || 0).toFixed(1)}</td>
            `;
            itemsList.appendChild(row);
        });
    }
    
    // Preencher impacto total
    document.getElementById('impactoRefeicoes').textContent = (doacao.totalRefeicoes || 0).toLocaleString();
    document.getElementById('impactoCO2').textContent = `${(doacao.totalCO2 || 0).toFixed(1)} kg`;
    document.getElementById('impactoPessoas').textContent = Math.round((doacao.totalRefeicoes || 0) / 3);
    
    // Mostrar modal
    modal.showModal();
}

function closeModal() {
    document.getElementById('doacaoModal').close();
}

// === FUNÇÕES DE EXPORTAÇÃO ===
function exportarRelatorio() {
    // Criar dados para exportação
    const dadosExportacao = {
        periodo: document.getElementById('periodo').options[document.getElementById('periodo').selectedIndex].text,
        totalAlimentos: document.getElementById('totalAlimentos').textContent,
        totalRefeicoes: document.getElementById('totalRefeicoes').textContent,
        pessoasBeneficiadas: document.getElementById('pessoasBeneficiadas').textContent,
        co2Evitado: document.getElementById('co2Evitado').textContent,
        doacoes: filteredData
    };
    
    // Criar e baixar arquivo JSON
    const dataStr = JSON.stringify(dadosExportacao, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `relatorio-${dadosUsuario.tipo === 'ong' ? 'consumo' : 'impacto'}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    mostrarMensagem('Relatório exportado com sucesso', 'success');
}

function exportarDetalhes() {
    const doacaoId = document.getElementById('doacaoId').textContent;
    const doacao = filteredData.find(d => d.id == doacaoId);
    
    if (doacao) {
        const dataStr = JSON.stringify(doacao, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `detalhes-doacao-${doacaoId}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        mostrarMensagem('Detalhes da doação exportados', 'success');
    }
}