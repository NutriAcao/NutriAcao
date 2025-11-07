/* arquivo: public/js/suporte.js - script do frontend: funcionalidades relacionadas a suporte - funções/constantes: feedback, form, isActive, submitButton, response */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("feedbackMessage");

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = this.querySelector('button[type="submit"]');

      feedback.textContent = "Enviando...";
      feedback.style.color = "#004AAD";
      submitButton.disabled = true;

      const formData = {
        email: this.querySelector('input[name="email"]').value,
        assunto: "Mensagem de Suporte - Empresa ABC",
        descricao: this.querySelector('textarea[name="descricao"]').value,
      };

      try {
        const response = await fetch("/enviar-contato", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          feedback.textContent = result.message;
          feedback.style.color = "green";
          this.reset();
        } else {
          feedback.textContent = `Erro: ${result.message}`;
          feedback.style.color = "red";
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        feedback.textContent = "Erro de conexão. Verifique o servidor.";
        feedback.style.color = "red";
      } finally {
        submitButton.disabled = false;
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const accordionLinks = document.querySelectorAll(".accordion-link");

  accordionLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const item = this.closest(".accordion-item");
      const answer = item.querySelector(".answer");

      const isActive = item.classList.contains("active");

      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          const otherAnswer = otherItem.querySelector(".answer");

          otherAnswer.style.maxHeight = "0";
          otherAnswer.style.paddingTop = "0";
          otherAnswer.style.paddingBottom = "0";
        }
      });

      item.classList.toggle("active");

      if (item.classList.contains("active")) {
        answer.style.maxHeight = answer.scrollHeight + "px";

        answer.style.paddingTop = "15px";
        answer.style.paddingBottom = "15px";
      } else {
        answer.style.maxHeight = "0";
        answer.style.paddingTop = "0";
        answer.style.paddingBottom = "0";
      }
    });
  });
});
