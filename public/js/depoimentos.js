// /js/depoimentos-modal.js

class ModalDepoimentos {
    constructor() {
        this.depoimentos = [];
        this.carregando = false;
        this.paginaAtual = 1;
        this.depoimentosPorPagina = 10;
        this.init();
    }

    init() {
        this.carregarDepoimentosIniciais();
        this.configurarScrollInfinito();
    }

    // Carregar depoimentos iniciais
    carregarDepoimentosIniciais() {
        this.depoimentos = this.getDepoimentosExemplo();
    }

    // Simulação de dados - substitua por dados reais do Google Forms
    getDepoimentosExemplo() {
        return [
            {
                id: 1,
                nome: "Renata Costa",
                tipo: "Doadora",
                mensagem: "Com o Nutriação, conseguimos doar alimentos excedentes com rapidez e segurança. Uma plataforma que realmente faz a diferença!",
                avaliacao: 5,
                data: "2024-01-15"
            },
            {
                id: 2,
                nome: "José Almeida",
                tipo: "Beneficiário",
                mensagem: "Graças à plataforma, conseguimos receber alimentos frescos semanalmente. Minha família agradece por essa iniciativa incrível.",
                avaliacao: 5,
                data: "2024-01-14"
            },
            {
                id: 3,
                nome: "ONG Sementes do Bem",
                tipo: "ONG",
                mensagem: "A tecnologia do Nutriação facilitou a logística de entrega dos alimentos e reduziu o desperdício na nossa ONG.",
                avaliacao: 5,
                data: "2024-01-13"
            },
            {
                id: 4,
                nome: "Carlos Eduardo",
                tipo: "Doador",
                mensagem: "Processo muito simples e eficiente. Em poucos cliques consegui conectar com uma ONG próxima!",
                avaliacao: 4,
                data: "2024-01-12"
            },
            {
                id: 5,
                nome: "Maria Santos",
                tipo: "Beneficiária",
                mensagem: "Como mãe solo, essa plataforma tem sido uma benção para minha família. Obrigada a todos os doadores!",
                avaliacao: 5,
                data: "2024-01-11"
            },
            {
                id: 6,
                nome: "Supermercado Bom Preço",
                tipo: "Doador",
                mensagem: "Reduzimos nosso desperdício em 70% após começar a usar o Nutriação. Excelente para o negócio e para a comunidade!",
                avaliacao: 5,
                data: "2024-01-10"
            },
            {
                id: 7,
                nome: "Ana Paula",
                tipo: "Voluntária",
                mensagem: "Acompanho o impacto positivo na comunidade. Famílias inteiras sendo beneficiadas por essa iniciativa.",
                avaliacao: 5,
                data: "2024-01-09"
            },
            {
                id: 8,
                nome: "Roberto Silva",
                tipo: "Doador",
                mensagem: "Sistema intuitivo e seguro. Já indiquei para outros empresários da região.",
                avaliacao: 4,
                data: "2024-01-08"
            },
            {
                id: 9,
                nome: "Creche Esperança",
                tipo: "ONG",
                mensagem: "Conseguimos variedade de alimentos para nossas crianças. A plataforma mudou nossa realidade!",
                avaliacao: 5,
                data: "2024-01-07"
            },
            {
                id: 10,
                nome: "Fernanda Lima",
                tipo: "Beneficiária",
                mensagem: "Alimentos de qualidade que fazem diferença no nosso dia a dia. Gratidão!",
                avaliacao: 5,
                data: "2024-01-06"
            }
        ];
    }

    // Simular carregamento de mais depoimentos
    carregarMaisDepoimentos() {
        if (this.carregando) return;
        
        this.carregando = true;
        this.mostrarLoading();
        
        // Simular delay de rede
        setTimeout(() => {
            const novosDepoimentos = this.gerarDepoimentosAdicionais(this.paginaAtual);
            this.depoimentos = [...this.depoimentos, ...novosDepoimentos];
            this.paginaAtual++;
            
            this.renderizarDepoimentos();
            this.carregando = false;
            this.removerLoading();
        }, 1000);
    }



    // Configurar scroll infinito
    configurarScrollInfinito() {
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        modalBody.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = modalBody;
            
            // Carregar mais quando estiver a 100px do final
            if (scrollTop + clientHeight >= scrollHeight - 100 && !this.carregando) {
                this.carregarMaisDepoimentos();
            }
        });
    }

    // Renderizar depoimentos no modal
    renderizarDepoimentos() {
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        // Limpar apenas o loading se existir
        const loading = modalBody.querySelector('.loading');
        if (loading) {
            loading.remove();
        }

        // Adicionar novos depoimentos
        const novosDepoimentos = this.depoimentos.slice(-this.depoimentosPorPagina);
        
        novosDepoimentos.forEach(depoimento => {
            if (!document.getElementById(`depoimento-${depoimento.id}`)) {
                const depoimentoHTML = this.criarHTMLDepoimento(depoimento);
                modalBody.insertAdjacentHTML('beforeend', depoimentoHTML);
            }
        });
    }

    // Criar HTML para um depoimento
    criarHTMLDepoimento(depoimento) {
        const estrelas = this.renderizarEstrelas(depoimento.avaliacao);
        
        return `
            <div class="depoimento-modal" id="depoimento-${depoimento.id}">
                <div class="depoimento-mensagem">"${depoimento.mensagem}"</div>
                <div class="depoimento-avaliacao">${estrelas}</div>
                <div class="depoimento-info">
                    <div class="depoimento-autor">${depoimento.nome}</div>
                    <div class="depoimento-tipo">${depoimento.tipo}</div>
                </div>
            </div>
        `;
    }

    // Renderizar estrelas
    renderizarEstrelas(numEstrelas) {
        return '⭐'.repeat(numEstrelas);
    }

    // Mostrar loading
    mostrarLoading() {
        const modalBody = document.getElementById('modalBody');
        if (modalBody && !modalBody.querySelector('.loading')) {
            modalBody.insertAdjacentHTML('beforeend', '<div class="loading">Carregando mais depoimentos</div>');
        }
    }

    // Remover loading
    removerLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    // Abrir modal
    abrirModal() {
        const modal = document.getElementById('modalDepoimentos');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Previne scroll da página
            
            // Renderizar depoimentos iniciais
            this.renderizarDepoimentos();
        }
    }

    // Fechar modal
    fecharModal() {
        const modal = document.getElementById('modalDepoimentos');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restaura scroll da página
        }
    }
}

// Inicializar e criar funções globais
const modalDepoimentos = new ModalDepoimentos();

// Funções globais para o HTML
function abrirModalDepoimentos() {
    modalDepoimentos.abrirModal();
}

function fecharModalDepoimentos() {
    modalDepoimentos.fecharModal();
}

// Fechar modal clicando fora
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalDepoimentos');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalDepoimentos();
            }
        });
    }

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalDepoimentos();
        }
    });
});