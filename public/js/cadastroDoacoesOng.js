// public/js/cadastroDoacoesOng.js
let dadosUsuario = {};
let nomeUsuario = document.getElementById('textNomeUsuario')
let nomeInstituicao = document.getElementById('textNomeInstituicao')

// Função principal para carregar dados do usuário
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
            
            // Salva os dados do usuário globalmente
            dadosUsuario = dados;
            
            // Atualiza a UI
            atualizarElementoUI('textNomeUsuario', dados.nome || 'Usuário');
            atualizarElementoUI('textNomeInstituicao', dados.nome_fantasia || dados.nome_ong || dados.razao_social || 'Instituição');
            
            console.log('>>> Dados carregados:', {
                nome: dados.nome,
                instituicao: dados.nome_fantasia || dados.nome_ong || dados.razao_social
            });
        } else {
            throw new Error(resultado.message || 'Erro na resposta da API');
        }
        
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        // Fallback em caso de erro
        atualizarElementoUI('textNomeUsuario', 'Usuário');
        atualizarElementoUI('textNomeInstituicao', 'Instituição');
    }
}

// Função auxiliar para atualizar elementos da UI
function atualizarElementoUI(elementId, texto) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = texto;
    } else {
        console.warn(`Elemento com ID '${elementId}' não encontrado`);
    }
}

// Carregar categorias para o select
async function carregarCategorias() {
    try {
        const catResponse = await fetch('/api/categorias');
        const catData = await catResponse.json();
        
        if (catData.success) {
            const categoriaSelect = document.getElementById('categoria');
            if (categoriaSelect) {
                categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';
                
                catData.data.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.nome;
                    categoriaSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Validação dos dados do formulário
function validarDados(dados) {
    const erros = [];

    // Validação da quantidade
    const quantidade = Number(dados.quantidade_desejada);
    if (isNaN(quantidade) || quantidade <= 0 || quantidade > 500) {
        erros.push("A quantidade deve ser um número entre 1 e 500.");
    }

    // Validação do telefone
    const telefoneValido = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(dados.telefone_contato);
    if (!telefoneValido) {
        erros.push("O número de telefone informado é inválido.");
    }

    // Validação do título
    if (!dados.titulo || dados.titulo.trim().length < 3) {
        erros.push("O nome do alimento deve ter pelo menos 3 caracteres.");
    }

    // Validação da categoria
    if (!dados.categoria_id) {
        erros.push("Selecione uma categoria.");
    }

    return erros;
}

// Configurar o formulário
function configurarFormulario() {
    const formDoacaoOng = document.getElementById("form-cadastro-ong");

    if (formDoacaoOng) {
        formDoacaoOng.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(formDoacaoOng);
            const dadosCompletos = Object.fromEntries(formData.entries());

            // Verifica se dadosUsuario.id existe
            if (!dadosUsuario.id) {
                alert('Erro: Dados do usuário não carregados. Recarregue a página.');
                return;
            }

            const dadosSolicitacao = {
                titulo: dadosCompletos.nome_alimento,
                descricao: dadosCompletos.descricao || `Solicitação de ${dadosCompletos.nome_alimento}`,
                categoria_id: parseInt(dadosCompletos.categoria),
                quantidade_desejada: parseFloat(dadosCompletos.quantidade),
                telefone_contato: dadosCompletos.telefone,
                email_contato: dadosCompletos.email,
                ong_id: dadosUsuario.id
            };

            // Validação
            const erros = validarDados(dadosSolicitacao);

            if (erros.length > 0) {
                alert("Erros encontrados:\n\n" + erros.join("\n"));
                return;
            }

            try {
                const response = await fetch('/api/solicitacoes-ong', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosSolicitacao)
                });

                const resultado = await response.json();

                if (resultado.success) {
                    alert('✅ Solicitação cadastrada com sucesso!');
                    formDoacaoOng.reset();
                } else {
                    alert('❌ Erro ao cadastrar a solicitação: ' + resultado.message);
                }

            } catch (error) {
                console.error('Erro de rede:', error);
                alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
            }
        });
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', async function() {
    console.log('>>> Iniciando cadastroDoacoesOng.js...');
    
    // Carrega dados do usuário primeiro
    await carregarDadosUsuario();
    
    // Depois carrega as categorias
    await carregarCategorias();
    
    // Configura o formulário
    configurarFormulario();
    
    console.log('>>> cadastroDoacoesOng.js inicializado com sucesso!');
});