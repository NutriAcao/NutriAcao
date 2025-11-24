// frontend/js/HistoricoDoacoesOng.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script HistoricoDoacoesOng.js carregado - Modo Sessão');

    let dadosUsuario = null;

    // ==================== CARREGAR USUÁRIO (igual outras páginas) ====================
    async function carregarUsuario() {
        try {
            console.log('📋 Carregando dados do usuário...');
            const res = await fetch('/api/usuarioToken');
            
            if (!res.ok) {
                throw new Error('Falha ao buscar usuário: ' + res.status);
            }
            
            dadosUsuario = await res.json();
            console.log('👤 Dados do usuário:', dadosUsuario);

            // Atualiza a interface (igual outras páginas)
            document.getElementById('textNomeUsuario').innerHTML = dadosUsuario.nome || 'Usuário';
            document.getElementById('textNomeInstituicao').innerHTML = dadosUsuario.nomeInstituicao || 'Instituição';

            // Se chegou aqui, o usuário está autenticado, então carrega o histórico
            await carregarHistorico();

        } catch (erro) {
            console.error('❌ Erro ao buscar usuário:', erro);
            
            // Se deu erro, provavelmente não está logado - redireciona para login
            console.log('🔐 Redirecionando para login...');
            window.location.href = '/loginpage';
        }
    }

    // ==================== CARREGAR HISTÓRICO ====================
    async function carregarHistorico() {
        try {
            console.log('📊 Carregando histórico...');
            
            const response = await fetch('/api/historico-ong');
            console.log('📨 Status da resposta:', response.status);

            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao carregar histórico`);
            }

            const historicoData = await response.json();
            console.log('📦 Dados recebidos:', historicoData);
            
            if (!Array.isArray(historicoData)) {
                throw new Error('Formato de dados inválido');
            }
            
            // Separar dados por tipo
            const solicitacoesConcluidas = historicoData.filter(item => item.tipo === 'solicitacao');
            const excedentesRecebidos = historicoData.filter(item => item.tipo === 'excedente');
            
            console.log(`📊 Solicitações: ${solicitacoesConcluidas.length}, Excedentes: ${excedentesRecebidos.length}`);

            // Preencher as tabelas
            preencherTabelaSolicitacoes(solicitacoesConcluidas);
            preencherTabelaExcedentes(excedentesRecebidos);

            // Atualizar contadores
            atualizarContadores(solicitacoesConcluidas.length, excedentesRecebidos.length);

            console.log('✅ Histórico carregado com sucesso');

        } catch (erro) {
            console.error('❌ Erro ao carregar histórico:', erro);
            mostrarMensagem('Erro ao carregar histórico de doações', 'error');
            
            // Mostra mensagem de erro nas tabelas
            const tbody1 = document.querySelector('#doacoesTableOng tbody');
            const tbody2 = document.querySelector('#doacoesTableOngExcedente tbody');
            
            if (tbody1) {
                tbody1.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar dados</td></tr>`;
            }
            if (tbody2) {
                tbody2.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar dados</td></tr>`;
            }
        }
    }

    // ==================== PREENCHER TABELAS ====================
    function preencherTabelaSolicitacoes(doacoes) {
        const tbody = document.querySelector('#doacoesTableOng tbody');
        
        if (!tbody) {
            console.error('❌ Tabela doacoesTableOng não encontrada');
            return;
        }
        
        tbody.innerHTML = '';

        if (doacoes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px;">
                        Nenhuma solicitação concluída encontrada.
                    </td>
                </tr>
            `;
            return;
        }

        doacoes.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.produto || 'N/A'}</td>
                <td>${item.quantidade} ${item.unidade || 'kg'}</td>
                <td>${item.empresa || 'Empresa'}</td>
                <td>${formatarData(item.data_conclusao)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function preencherTabelaExcedentes(doacoes) {
        const tbody = document.querySelector('#doacoesTableOngExcedente tbody');
        
        if (!tbody) {
            console.error('❌ Tabela doacoesTableOngExcedente não encontrada');
            return;
        }
        
        tbody.innerHTML = '';

        if (doacoes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px;">
                        Nenhum excedente recebido encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        doacoes.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.produto || 'N/A'}</td>
                <td>${item.quantidade} ${item.unidade || 'kg'}</td>
                <td>${item.empresa || 'Empresa'}</td>
                <td>${formatarData(item.data_conclusao)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function atualizarContadores(totalSolicitacoes, totalExcedentes) {
        const totalItensOng = document.getElementById('totalItensOng');
        const totalItensOngExcedente = document.getElementById('totalItensOngExcedente');

        if (totalItensOng) {
            totalItensOng.textContent = totalSolicitacoes;
        }

        if (totalItensOngExcedente) {
            totalItensOngExcedente.textContent = totalExcedentes;
        }
    }

    // ==================== FUNÇÕES AUXILIARES ====================
    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR');
        } catch (error) {
            return dataString;
        }
    }

    function mostrarMensagem(mensagem, tipo) {
        console.log(`${tipo}: ${mensagem}`);
        // Pode adicionar um toast/alert visual aqui se quiser
    }

    // ==================== INICIALIZAÇÃO ====================
    // Inicia carregando o usuário (que vai verificar a autenticação)
    carregarUsuario();
});