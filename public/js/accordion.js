export function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const link = item.querySelector('.accordion-link');
    link.addEventListener('click', e => {
      e.preventDefault();

      accordionItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      item.classList.toggle('active');
    });
  });
}
