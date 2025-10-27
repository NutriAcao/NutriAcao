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

            // Coleta dos dados (IMPORTANTE: Use os nomes dos campos do seu HTML)
            const formData = {
              email: this.querySelector('input[name="email"]').value, 
              assunto: "Mensagem de Suporte - Empresa ABC", // Definindo um assunto fixo aqui, se preferir
              descricao: this.querySelector('textarea[name="descricao"]').value
            };

            try {
              // Garante que a rota está CORRETA: '/enviar-contato' (com hífen)
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
                this.reset(); // Limpa o formulário
              } else {
                feedback.textContent = `Erro: ${result.message}`;
                feedback.style.color = 'red';
              }
            } catch (error) {
              console.error('Erro na requisição:', error);
              feedback.textContent = 'Erro de conexão. Verifique o servidor.';
              feedback.style.color = 'red';
            } finally {
              submitButton.disabled = false; // Reabilita o botão
            }
        });
    }
});