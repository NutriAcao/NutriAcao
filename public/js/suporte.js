// suporte.js

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioContato();
    inicializarAccordion();
    carregarDadosUsuario();
});

// Função para carregar dados do usuário
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
            
            // Atualiza os elementos da UI
            const nomeUsuario = document.querySelector('#userInfo h4') || document.getElementById('textNomeUsuario');
            const nomeInstituicao = document.querySelector('#userInfo p') || document.getElementById('textNomeInstituicao');
            
            // CORREÇÃO: Definir a variável dentro do escopo
            const nomeInstituicaoValor = dados.nome_ong || dados.nome_fantasia || dados.razao_social || 'Instituição';
            
            if (nomeUsuario) {
                nomeUsuario.textContent = dados.nome || 'Usuário';
            }
            
            if (nomeInstituicao) {
                nomeInstituicao.textContent = nomeInstituicaoValor;
            }
            
            console.log('>>> Dados carregados:', {
                nome: dados.nome,
                instituicao: nomeInstituicaoValor
            });
        } else {
            throw new Error(resultado.message || 'Erro na resposta da API');
        }
        
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        // Fallback em caso de erro
        const nomeUsuario = document.querySelector('#userInfo h4') || document.getElementById('textNomeUsuario');
        const nomeInstituicao = document.querySelector('#userInfo p') || document.getElementById('textNomeInstituicao');
        
        if (nomeUsuario) nomeUsuario.textContent = 'Usuário';
        if (nomeInstituicao) nomeInstituicao.textContent = 'Instituição';
    }
}

// ... o resto do código permanece igual ...
function inicializarFormularioContato() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('feedbackMessage');
    
    if (!form) return;

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const submitButton = this.querySelector('button[type="submit"]');
        const emailInput = this.querySelector('input[name="email"]');
        const descricaoInput = this.querySelector('textarea[name="descricao"]');

        // Validação básica
        if (!validarEmail(emailInput.value)) {
            mostrarFeedback('Por favor, insira um email válido.', 'error');
            return;
        }

        if (!descricaoInput.value.trim()) {
            mostrarFeedback('Por favor, insira uma mensagem.', 'error');
            return;
        }

        await enviarFormulario({
            email: emailInput.value,
            assunto: "Mensagem de Suporte - Sistema Doações",
            descricao: descricaoInput.value.trim()
        }, submitButton, feedback, form);
    });
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarFeedback(mensagem, tipo = 'info') {
    const feedback = document.getElementById('feedbackMessage');
    if (!feedback) return;
    
    feedback.textContent = mensagem;
    feedback.style.color = tipo === 'success' ? 'green' : 
                          tipo === 'error' ? 'red' : '#004AAD';
}

async function enviarFormulario(formData, submitButton, feedback, form) {
    mostrarFeedback('Enviando...', 'info');
    submitButton.disabled = true;

    try {
        const response = await fetch('/enviar-contato', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            mostrarFeedback(result.message, 'success');
            form.reset();
        } else {
            mostrarFeedback(`Erro: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarFeedback('Erro de conexão. Tente novamente.', 'error');
    } finally {
        submitButton.disabled = false;
    }
}

function inicializarAccordion() {
    const accordionLinks = document.querySelectorAll('.accordion-link');

    accordionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const item = this.closest('.accordion-item');
            const answer = item.querySelector('.answer');
            
            // Verifica se o item atual já está ativo
            const isActive = item.classList.contains('active');

            // --- Lógica para fechar todos os outros itens (Comportamento de 'Single Open') ---
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.answer');
                    // Zera as propriedades de altura e padding para fechar
                    otherAnswer.style.maxHeight = '0';
                    otherAnswer.style.paddingTop = '0';
                    otherAnswer.style.paddingBottom = '0';
                }
            });
            // ---------------------------------------------------------------------------------

            // Alterna a classe 'active' no item clicado
            item.classList.toggle('active');

            // Abre ou fecha a resposta
            if (item.classList.contains('active')) {
                // Abre: Define a altura máxima como a altura real do conteúdo (scrollHeight)
                answer.style.maxHeight = answer.scrollHeight + "px";
                // Garante que o padding seja aplicado ao abrir (necessário para o efeito visual)
                answer.style.paddingTop = "15px";
                answer.style.paddingBottom = "15px";
            } else {
                // Fecha: Redefine a altura máxima para 0
                answer.style.maxHeight = '0';
                answer.style.paddingTop = '0';
                answer.style.paddingBottom = '0';
            }
        });
    });
}