// public/js/HistoricoDoacoesOng.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando carregamento do histórico...');
    carregarUsuario();
});

async function carregarUsuario() {
    try {
        console.log('📋 Carregando dados do usuário...');
        const res = await fetch('/api/usuario');
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const resultado = await res.json();
        console.log('✅ Dados do usuário:', resultado);

        if (resultado.success && resultado.data) {
            const dados = resultado.data;
            
            // Atualiza interface do usuário
            document.getElementById('textNomeUsuario').textContent = dados.nome || 'Usuário';
            const nomeInstituicao = dados.nome_ong || dados.nome_fantasia || dados.razao_social || 'Instituição';
            document.getElementById('textNomeInstituicao').textContent = nomeInstituicao;

            const id_usuario = dados.id;
            console.log(`👤 ID do usuário: ${id_usuario}`);

            // Carrega os históricos
            await carregarHistoricoSolicitacoes(id_usuario);
            await carregarHistoricoExcedentes(id_usuario);
            
        } else {
            throw new Error(resultado.message || 'Erro na resposta da API');
        }

    } catch (erro) {
        console.error('❌ Erro ao carregar usuário:', erro);
        // Fallback
        document.getElementById('textNomeUsuario').textContent = 'Usuário';
        document.getElementById('textNomeInstituicao').textContent = 'Instituição';
    }
}

async function carregarHistoricoSolicitacoes(idUsuario) {
    try {
        console.log(`📦 Carregando histórico de solicitações para usuário ${idUsuario}...`);
        
        const res = await fetch(`/doacoesConcluidasONG/solicitacoesConcluidasONG?id=${encodeURIComponent(idUsuario)}`);
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const solicitacoes = await res.json();
        console.log('✅ Solicitações concluídas:', solicitacoes);
        
        preencherTabelaSolicitacoes(solicitacoes);
        configurarPesquisaSolicitacoes(solicitacoes);
        
    } catch (erro) {
        console.error('❌ Erro ao carregar solicitações:', erro);
        document.getElementById('tbodySolicitacoes').innerHTML = 
            '<tr><td colspan="4">Erro ao carregar dados</td></tr>';
    }
}

async function carregarHistoricoExcedentes(idUsuario) {
    try {
        console.log(`📦 Carregando histórico de excedentes para usuário ${idUsuario}...`);
        
        const res = await fetch(`/doacoesConcluidasONG/excedentesConcluidosONG?id=${encodeURIComponent(idUsuario)}`);
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const excedentes = await res.json();
        console.log('✅ Excedentes concluídos:', excedentes);
        
        preencherTabelaExcedentes(excedentes);
        configurarPesquisaExcedentes(excedentes);
        
    } catch (erro) {
        console.error('❌ Erro ao carregar excedentes:', erro);
        document.getElementById('tbodyExcedentes').innerHTML = 
            '<tr><td colspan="4">Erro ao carregar dados</td></tr>';
    }
}

function preencherTabelaSolicitacoes(solicitacoes) {
    const tbody = document.getElementById('tbodySolicitacoes');
    
    if (!solicitacoes || solicitacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Nenhuma solicitação concluída encontrada.</td></tr>';
        document.getElementById('totalItensSolicitacoes').textContent = '0';
        return;
    }

    let html = '';
    solicitacoes.forEach(item => {
        // CORREÇÃO: Usa campos corretos da API
        const nomeProduto = item.titulo || item.nome_alimento || 'Produto';
        const quantidade = item.quantidade_desejada || item.quantidade || '0';
        const empresa = item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || 'Empresa';
        const dataConclusao = item.data_conclusao || item.data_atualizacao || 'N/A';
        const dataFormatada = formatarData(dataConclusao);

        html += `
            <tr>
                <td>${nomeProduto}</td>
                <td>${quantidade} Kg/L</td>
                <td>${empresa}</td>
                <td>${dataFormatada}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    document.getElementById('totalItensSolicitacoes').textContent = solicitacoes.length;
}

function preencherTabelaExcedentes(excedentes) {
    const tbody = document.getElementById('tbodyExcedentes');
    
    if (!excedentes || excedentes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Nenhum excedente recebido encontrado.</td></tr>';
        document.getElementById('totalItensExcedentes').textContent = '0';
        return;
    }

    let html = '';
    excedentes.forEach(item => {
        // CORREÇÃO: Usa campos corretos da API
        const nomeProduto = item.titulo || item.nome_alimento || 'Produto';
        const quantidade = item.quantidade || '0';
        const empresa = item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || 'Empresa';
        const dataConclusao = item.data_conclusao || item.data_atualizacao || 'N/A';
        const dataFormatada = formatarData(dataConclusao);

        html += `
            <tr>
                <td>${nomeProduto}</td>
                <td>${quantidade} Kg/L</td>
                <td>${empresa}</td>
                <td>${dataFormatada}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    document.getElementById('totalItensExcedentes').textContent = excedentes.length;
}

function configurarPesquisaSolicitacoes(solicitacoes) {
    const searchInput = document.getElementById('searchInputSolicitacoes');
    const tbody = document.getElementById('tbodySolicitacoes');
    
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const termo = this.value.toLowerCase().trim();
        
        if (!termo) {
            // Se não há termo, mostra todos os itens
            preencherTabelaSolicitacoes(solicitacoes);
            return;
        }

        const filtrados = solicitacoes.filter(item => {
            const nomeProduto = (item.titulo || item.nome_alimento || '').toLowerCase();
            const empresa = (item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || '').toLowerCase();
            
            return nomeProduto.includes(termo) || empresa.includes(termo);
        });

        // Atualiza apenas a tabela com os dados filtrados
        if (filtrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhum resultado encontrado.</td></tr>';
            document.getElementById('totalItensSolicitacoes').textContent = '0';
        } else {
            let html = '';
            filtrados.forEach(item => {
                const nomeProduto = item.titulo || item.nome_alimento || 'Produto';
                const quantidade = item.quantidade_desejada || item.quantidade || '0';
                const empresa = item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || 'Empresa';
                const dataConclusao = item.data_conclusao || item.data_atualizacao || 'N/A';
                const dataFormatada = formatarData(dataConclusao);

                html += `
                    <tr>
                        <td>${nomeProduto}</td>
                        <td>${quantidade} Kg/L</td>
                        <td>${empresa}</td>
                        <td>${dataFormatada}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            document.getElementById('totalItensSolicitacoes').textContent = filtrados.length;
        }
    });
}

function configurarPesquisaExcedentes(excedentes) {
    const searchInput = document.getElementById('searchInputExcedentes');
    const tbody = document.getElementById('tbodyExcedentes');
    
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const termo = this.value.toLowerCase().trim();
        
        if (!termo) {
            // Se não há termo, mostra todos os itens
            preencherTabelaExcedentes(excedentes);
            return;
        }

        const filtrados = excedentes.filter(item => {
            const nomeProduto = (item.titulo || item.nome_alimento || '').toLowerCase();
            const empresa = (item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || '').toLowerCase();
            
            return nomeProduto.includes(termo) || empresa.includes(termo);
        });

        // Atualiza apenas a tabela com os dados filtrados
        if (filtrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhum resultado encontrado.</td></tr>';
            document.getElementById('totalItensExcedentes').textContent = '0';
        } else {
            let html = '';
            filtrados.forEach(item => {
                const nomeProduto = item.titulo || item.nome_alimento || 'Produto';
                const quantidade = item.quantidade || '0';
                const empresa = item.empresa?.nome_fantasia || item.empresa?.razao_social || item.NomeEmpresa || 'Empresa';
                const dataConclusao = item.data_conclusao || item.data_atualizacao || 'N/A';
                const dataFormatada = formatarData(dataConclusao);

                html += `
                    <tr>
                        <td>${nomeProduto}</td>
                        <td>${quantidade} Kg/L</td>
                        <td>${empresa}</td>
                        <td>${dataFormatada}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            document.getElementById('totalItensExcedentes').textContent = filtrados.length;
        }
    });
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        return new Date(dataString).toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}