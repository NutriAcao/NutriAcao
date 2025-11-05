// contato.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('feedbackMessage');
    
    if (form) {
        form.addEventListener('submit', async function(event) {
            // Impede o envio padrão do formulário
            event.preventDefault(); 

            const submitButton = this.querySelector('button[type="submit"]');

            feedback.textContent = 'Enviando...';
            feedback.style.color = '#004AAD';
            submitButton.disabled = true;

            // Coleta dos dados
            const formData = {
              email: this.querySelector('input[name="email"]').value, 
              assunto: "Mensagem de Suporte - Empresa ABC",
              descricao: this.querySelector('textarea[name="descricao"]').value
            };

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
                feedback.textContent = result.message;
                feedback.style.color = 'green';
                this.reset();
              } else {
                feedback.textContent = `Erro: ${result.message}`;
                feedback.style.color = 'red';
              }
            } catch (error) {
              console.error('Erro na requisição:', error);
              feedback.textContent = 'Erro de conexão. Verifique o servidor.';
              feedback.style.color = 'red';
            } finally {
              submitButton.disabled = false;
            }
        });
    }
});
// --- JavaScript (Funcionalidade do Acordeão) ---
document.addEventListener('DOMContentLoaded', function() {
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
});