const doacoes = [
            {
                id: 1,
                alimento: "Arroz integral",
                quantidade: 50000,
                empresa: "Supermercado Fresco Bom",
                cnea: "12.345.678/0001-90",
                doacoesRealizadas: 28,
                status: "Ativo",
                data: "2024-01-15"
            },
            {
                id: 2,
                alimento: "Feijão Carioca",
                quantidade: 25000,
                empresa: "Distribuidora Alimentar",
                cnea: "23.456.789/0001-91",
                doacoesRealizadas: 45,
                status: "Ativo",
                data: "2024-01-14"
            },
            {
                id: 3,
                alimento: "Macarrão Espaguete",
                quantidade: 15000,
                empresa: "Indústria Massa Fina",
                cnea: "34.567.890/0001-92",
                doacoesRealizadas: 32,
                status: "Andamento",
                data: "2024-01-13"
            },
            {
                id: 4,
                alimento: "Óleo de Soja",
                quantidade: 10000,
                empresa: "Óleos Vegetais Ltda",
                cnea: "45.678.901/0001-93",
                doacoesRealizadas: 19,
                status: "Ativo",
                data: "2024-01-12"
            },
            {
                id: 5,
                alimento: "Açúcar Cristal",
                quantidade: 20000,
                empresa: "Doces e Açúcares S.A.",
                cnea: "56.789.012/0001-94",
                doacoesRealizadas: 37,
                status: "Concluído",
                data: "2024-01-11"
            }
        ];

        // Variáveis de controle
        let currentPage = 1;
        const itemsPerPage = 5;
        let filteredData = [...doacoes];

        // Elementos DOM
        const tableBody = document.getElementById('tableBody');
        const pagination = document.getElementById('pagination');
        const searchInput = document.getElementById('searchInput');
        const filterStatus = document.getElementById('filterStatus');
        const filterEmpresa = document.getElementById('filterEmpresa');
        const filterOrdenacao = document.getElementById('filterOrdenacao');

        // Inicialização
        function init() {
            updateStats();
            renderTable();
            renderPagination();
            populateEmpresaFilter();
            setupEventListeners();
        }

        // Atualizar estatísticas
        function updateStats() {
            document.getElementById('totalDoacoes').textContent = doacoes.length;
            document.getElementById('doacoesAtivas').textContent = doacoes.filter(d => d.status === 'Ativo').length;
            document.getElementById('kgDoados').textContent = doacoes.reduce((sum, d) => sum + d.quantidade, 0).toLocaleString();
            document.getElementById('empresasParticipantes').textContent = new Set(doacoes.map(d => d.empresa)).size;
        }

        // Renderizar tabela
        function renderTable() {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = filteredData.slice(startIndex, endIndex);

            if (pageData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h3>Nenhuma doação encontrada</h3>
                            <p>Tente ajustar os filtros de busca</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = pageData.map(doacao => `
                <tr>
                    <td>${doacao.id}</td>
                    <td>${doacao.alimento}</td>
                    <td>${doacao.quantidade.toLocaleString()}</td>
                    <td>${doacao.empresa}</td>
                    <td>${doacao.cnea}</td>
                    <td>${doacao.doacoesRealizadas}</td>
                    <td><span class="status-badge status-${doacao.status.toLowerCase()}">${doacao.status}</span></td>
                    <td><button class="btn-action" onclick="verDoacao(${doacao.id})">Ver</button></td>
                </tr>
            `).join('');
        }

        // Renderizar paginação
        function renderPagination() {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            pagination.innerHTML = '';

            if (totalPages <= 1) return;

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.className = i === currentPage ? 'active' : '';
                button.onclick = () => {
                    currentPage = i;
                    renderTable();
                    renderPagination();
                };
                pagination.appendChild(button);
            }
        }

        // Popular filtro de empresas
        function populateEmpresaFilter() {
            const empresas = [...new Set(doacoes.map(d => d.empresa))];
            filterEmpresa.innerHTML = '<option value="">Todas as empresas</option>' +
                empresas.map(empresa => `<option value="${empresa}">${empresa}</option>`).join('');
        }

        // Configurar event listeners
        function setupEventListeners() {
            searchInput.addEventListener('input', applyFilters);
            filterStatus.addEventListener('change', applyFilters);
            filterEmpresa.addEventListener('change', applyFilters);
            filterOrdenacao.addEventListener('change', applyFilters);
        }

        // Aplicar filtros
        function applyFilters() {
            const searchTerm = searchInput.value.toLowerCase();
            const statusFilter = filterStatus.value;
            const empresaFilter = filterEmpresa.value;
            const ordenacao = filterOrdenacao.value;

            filteredData = doacoes.filter(doacao => {
                const matchesSearch = 
                    doacao.alimento.toLowerCase().includes(searchTerm) ||
                    doacao.empresa.toLowerCase().includes(searchTerm) ||
                    doacao.cnea.includes(searchTerm);

                const matchesStatus = !statusFilter || doacao.status === statusFilter;
                const matchesEmpresa = !empresaFilter || doacao.empresa === empresaFilter;

                return matchesSearch && matchesStatus && matchesEmpresa;
            });

            // Ordenação
            switch (ordenacao) {
                case 'antigos':
                    filteredData.sort((a, b) => new Date(a.data) - new Date(b.data));
                    break;
                case 'quantidade':
                    filteredData.sort((a, b) => b.quantidade - a.quantidade);
                    break;
                default: // recentes
                    filteredData.sort((a, b) => new Date(b.data) - new Date(a.data));
            }

            currentPage = 1;
            renderTable();
            renderPagination();
        }

        // Função para visualizar doação
        function verDoacao(id) {
            alert(`Visualizando doação ID: ${id}\n\nEm uma implementação real, isso abriria um modal ou redirecionaria para uma página de detalhes.`);
            // Aqui você pode integrar com o backend para mostrar detalhes
        }

        // Inicializar a página
        document.addEventListener('DOMContentLoaded', init);
