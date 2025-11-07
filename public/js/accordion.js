/* arquivo: public/js/accordion.js - script do frontend: funcionalidades relacionadas a accordion - funções/constantes: isOpen, accordionItems, otherAnswer, answer, link */

export function initAccordion() {
  document.addEventListener("DOMContentLoaded", function () {
    const accordionItems = document.querySelectorAll(".accordion-item");

    accordionItems.forEach((item) => {
      const link = item.querySelector(".accordion-link");
      const answer = item.querySelector(".answer");

      answer.style.maxHeight = "0";
      answer.style.overflow = "hidden";
      answer.style.display = "none";
      answer.style.transition = "max-height 0.3s ease-out";

      link.addEventListener("click", function (e) {
        e.preventDefault();

        const isOpen =
          answer.style.maxHeight !== "0px" && answer.style.maxHeight !== "0";

        accordionItems.forEach((otherItem) => {
          const otherAnswer = otherItem.querySelector(".answer");
          otherAnswer.style.maxHeight = "0";
        });

        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  });
}
