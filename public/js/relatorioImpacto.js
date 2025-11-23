// public/js/relatorioImpacto.js
let dadosUsuario = {};
let nomeUsuario = document.getElementById('textNomeUsuario');
let nomeInstituicao = document.getElementById('textNomeInstituicao');

// Variáveis globais
let currentPage = 1;
const itemsPerPage = 5;
let filteredData = [];
let chartTipoAlimento, chartTemporal, chartOngs;
let dadosOriginais = [];

// Carregar dados do usuário
async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarioToken');
        const dados = await res.json();

        dadosUsuario = dados;
        nomeUsuario.innerHTML = dadosUsuario.nome;
        nomeInstituicao.innerHTML = dadosUsuario.nomeInstituicao;
        
        // Inicializar componentes
        inicializarComponentes();
        await carregarDadosReais();
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
    }
}

// Inicializar componentes da página
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

// Carregar dados reais da API
async function carregarDadosReais() {
    try {
        console.log('Carregando dados reais do banco...');
        mostrarLoading(true);
        
        const response = await fetch('/api/relatorios-impacto', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        
        if (!resultado.success) {
            throw new Error(resultado.error || 'Erro ao carregar dados');
        }

        console.log('Dados recebidos da API:', resultado);
        
        dadosOriginais = resultado.data || [];
        filteredData = [...dadosOriginais];
        
        // Atualizar interface
        atualizarResumo();
        renderizarTabela();
        atualizarGraficos();
        
        mostrarMensagem(`Carregadas ${dadosOriginais.length} doações com sucesso`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar dados reais:', error);
        mostrarMensagem('Erro ao carregar dados: ' + error.message, 'error');
        carregarDadosExemplo();
    } finally {
        mostrarLoading(false);
    }
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    let loading = document.getElementById('loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        loading.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.5); 
            display: none; 
            justify-content: center; 
            align-items: center; 
            z-index: 9999;
        `;
        loading.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #004AAD; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p style="margin: 0; color: #333; font-weight: 600;">Carregando dados...</p>
            </div>
        `;
        document.body.appendChild(loading);
    }
    loading.style.display = mostrar ? 'flex' : 'none';
}

// Obter token JWT
function getToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') return value;
    }
    return null;
}

// Alternar visibilidade dos campos de data personalizada
function toggleCustomDate() {
    const periodo = document.getElementById('periodo').value;
    const customDateFields = document.querySelectorAll('.custom-date');
    
    if (periodo === 'custom') {
        customDateFields.forEach(field => field.style.display = 'flex');
    } else {
        customDateFields.forEach(field => field.style.display = 'none');
    }
}

// Aplicar filtros aos dados
function aplicarFiltros() {
    try {
        const periodo = document.getElementById('periodo').value;
        const tipoAlimento = document.getElementById('tipoAlimento').value;
        const ong = document.getElementById('ong').value;
        
        aplicarFiltrosCliente(periodo, tipoAlimento, ong);
        
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        mostrarMensagem('Erro ao aplicar filtros', 'error');
    }
}

// Aplicar filtros no lado do cliente
function aplicarFiltrosCliente(periodo, tipoAlimento, ong) {
    let dadosFiltrados = [...dadosOriginais];
    
    // Filtro de tipo de alimento
    if (tipoAlimento !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(doacao => 
            doacao.alimentos.some(alimento => 
                alimento.categoria?.toLowerCase() === tipoAlimento.toLowerCase() ||
                alimento.nome.toLowerCase().includes(tipoAlimento.toLowerCase())
            )
        );
    }
    
    // Filtro de ONG
    if (ong !== 'todas') {
        dadosFiltrados = dadosFiltrados.filter(doacao => 
            doacao.ong.toLowerCase().includes(ong.toLowerCase())
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

// Atualizar resumo de impacto
function atualizarResumo() {
    const totalAlimentos = filteredData.reduce((sum, doacao) => sum + doacao.totalAlimentos, 0);
    const totalRefeicoes = filteredData.reduce((sum, doacao) => sum + doacao.totalRefeicoes, 0);
    const totalCO2 = filteredData.reduce((sum, doacao) => sum + doacao.totalCO2, 0);
    
    const pessoasBeneficiadas = Math.round(totalRefeicoes / 3);

    document.getElementById('totalAlimentos').textContent = `${totalAlimentos.toFixed(1)} kg`;
    document.getElementById('totalRefeicoes').textContent = totalRefeicoes.toLocaleString();
    document.getElementById('pessoasBeneficiadas').textContent = pessoasBeneficiadas.toLocaleString();
    document.getElementById('co2Evitado').textContent = `${totalCO2.toFixed(1)} kg`;
}

// Renderizar tabela
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
                <td colspan="7" class="no-results">
                    Nenhuma doação encontrada com os filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedData.forEach(doacao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatarData(doacao.data)}</td>
            <td>${doacao.alimentos.map(a => a.nome).join(', ')}</td>
            <td>${doacao.totalAlimentos.toFixed(1)} kg</td>
            <td>${doacao.ong}</td>
            <td>${doacao.totalRefeicoes.toLocaleString()}</td>
            <td>${doacao.totalCO2.toFixed(1)} kg</td>
            <td><span class="status ${doacao.status}">${formatarStatus(doacao.status)}</span></td>
        `;
        
        row.addEventListener('click', () => abrirModalDoacao(doacao));
        tableBody.appendChild(row);
    });
    
    atualizarControlesPaginacao(totalPages);
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Formatar status
function formatarStatus(status) {
    const statusMap = {
        'entregue': 'Entregue',
        'pendente': 'Pendente',
        'cancelado': 'Cancelado',
        'coletado': 'Coletado',
        'concluido': 'Concluído',
        'finalizado': 'Finalizado'
    };
    return statusMap[status] || status;
}

// Atualizar controles de paginação
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

// Mudar página
function mudarPagina(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderizarTabela();
}

// Filtrar tabela por pesquisa
function filtrarTabela() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        renderizarTabela();
        return;
    }
    
    const filtered = filteredData.filter(doacao => 
        doacao.alimentos.some(alimento => 
            alimento.nome.toLowerCase().includes(searchTerm)
        ) ||
        doacao.ong.toLowerCase().includes(searchTerm) ||
        doacao.status.toLowerCase().includes(searchTerm)
    );
    
    const tempData = filteredData;
    filteredData = filtered;
    renderizarTabela();
    filteredData = tempData;
}

// Inicializar gráficos
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
                label: 'Doações Recebidas',
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

// Atualizar gráficos com dados
function atualizarGraficos() {
    const alimentosPorCategoria = agruparPorCategoria();
    chartTipoAlimento.data.labels = Object.keys(alimentosPorCategoria);
    chartTipoAlimento.data.datasets[0].data = Object.values(alimentosPorCategoria);
    chartTipoAlimento.update();
    
    const dadosTemporais = agruparPorData();
    chartTemporal.data.labels = Object.keys(dadosTemporais);
    chartTemporal.data.datasets[0].data = Object.values(dadosTemporais);
    chartTemporal.update();
    
    const doacoesPorOng = agruparPorOng();
    chartOngs.data.labels = Object.keys(doacoesPorOng);
    chartOngs.data.datasets[0].data = Object.values(doacoesPorOng);
    chartOngs.update();
}

// Agrupar dados por categoria de alimento
function agruparPorCategoria() {
    const categorias = {};
    
    filteredData.forEach(doacao => {
        doacao.alimentos.forEach(alimento => {
            const categoria = determinarCategoria(alimento.nome);
            categorias[categoria] = (categorias[categoria] || 0) + alimento.quantidade;
        });
    });
    
    return categorias;
}

// Determinar categoria pelo nome do alimento
function determinarCategoria(nomeAlimento) {
    const categorias = {
        'frutas': ['maçã', 'banana', 'laranja', 'uva', 'mamão', 'melancia', 'abacaxi'],
        'legumes': ['cenoura', 'batata', 'tomate', 'cebola', 'abobrinha', 'berinjela'],
        'verduras': ['alface', 'couve', 'rúcula', 'espinafre', 'agrião', 'acelga'],
        'graos': ['arroz', 'feijão', 'milho', 'trigo', 'aveia', 'soja', 'lentilha'],
        'laticinios': ['leite', 'queijo', 'iogurte', 'manteiga', 'requeijão'],
        'outros': ['pão', 'óleo', 'açúcar', 'sal', 'macarrão', 'farinha']
    };
    
    nomeAlimento = nomeAlimento.toLowerCase();
    
    for (const [categoria, alimentos] of Object.entries(categorias)) {
        if (alimentos.some(alimento => nomeAlimento.includes(alimento))) {
            return categoria;
        }
    }
    
    return 'outros';
}

// Agrupar dados por data (últimos 30 dias)
function agruparPorData() {
    const dados = {};
    const hoje = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        const dataStr = data.toLocaleDateString('pt-BR');
        dados[dataStr] = 0;
    }
    
    filteredData.forEach(doacao => {
        const dataDoacao = new Date(doacao.data);
        const dataStr = dataDoacao.toLocaleDateString('pt-BR');
        
        if (dados[dataStr] !== undefined) {
            dados[dataStr] += doacao.totalAlimentos;
        }
    });
    
    return dados;
}

// Agrupar dados por ONG
function agruparPorOng() {
    const ongs = {};
    
    filteredData.forEach(doacao => {
        ongs[doacao.ong] = (ongs[doacao.ong] || 0) + doacao.totalAlimentos;
    });
    
    return ongs;
}

// Abrir modal com detalhes da doação
function abrirModalDoacao(doacao) {
    const modal = document.getElementById('doacaoModal');
    
    document.getElementById('doacaoId').textContent = doacao.id;
    document.getElementById('doacaoData').textContent = formatarData(doacao.data);
    document.getElementById('doacaoOng').textContent = doacao.ong;
    document.getElementById('doacaoStatus').textContent = formatarStatus(doacao.status);
    document.getElementById('doacaoResponsavel').textContent = doacao.responsavel;
    document.getElementById('doacaoEndereco').textContent = doacao.endereco;
    
    const itemsList = document.getElementById('doacaoItemsList');
    itemsList.innerHTML = '';
    
    doacao.alimentos.forEach(alimento => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${alimento.nome}</td>
            <td>${alimento.quantidade}</td>
            <td>${alimento.unidade}</td>
            <td>${alimento.refeicoes}</td>
            <td>${alimento.co2.toFixed(1)}</td>
        `;
        itemsList.appendChild(row);
    });
    
    document.getElementById('impactoRefeicoes').textContent = doacao.totalRefeicoes.toLocaleString();
    document.getElementById('impactoCO2').textContent = `${doacao.totalCO2.toFixed(1)} kg`;
    document.getElementById('impactoPessoas').textContent = Math.round(doacao.totalRefeicoes / 3);
    
    modal.showModal();
}

// Fechar modal
function closeModal() {
    document.getElementById('doacaoModal').close();
}

// Exportar relatório
function exportarRelatorio() {
    const dadosExportacao = {
        periodo: document.getElementById('periodo').options[document.getElementById('periodo').selectedIndex].text,
        totalAlimentos: document.getElementById('totalAlimentos').textContent,
        totalRefeicoes: document.getElementById('totalRefeicoes').textContent,
        pessoasBeneficiadas: document.getElementById('pessoasBeneficiadas').textContent,
        co2Evitado: document.getElementById('co2Evitado').textContent,
        doacoes: filteredData
    };
    
    const dataStr = JSON.stringify(dadosExportacao, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `relatorio-impacto-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    mostrarMensagem('Relatório exportado com sucesso', 'success');
}

// Exportar detalhes da doação
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

// Mostrar mensagem de feedback
function mostrarMensagem(mensagem, tipo) {
    const mensagemEl = document.createElement('div');
    mensagemEl.className = `mensagem ${tipo}`;
    mensagemEl.textContent = mensagem;
    mensagemEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    if (tipo === 'success') {
        mensagemEl.style.backgroundColor = '#2ecc71';
    } else if (tipo === 'error') {
        mensagemEl.style.backgroundColor = '#e74c3c';
    } else {
        mensagemEl.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(mensagemEl);
    
    setTimeout(() => {
        mensagemEl.remove();
    }, 3000);
}

// Inicializar quando a página carregar
window.addEventListener('DOMContentLoaded', carregarUsuario);