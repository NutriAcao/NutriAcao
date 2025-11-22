export function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (accordionItems.length === 0) return; // Não fazer nada se não houver accordion items

    accordionItems.forEach(item => {
        const link = item.querySelector('.accordion-link');
        const answer = item.querySelector('.answer');

        if (!link || !answer) return; // Pular se elementos não existirem

        // Inicialmente esconde todas as respostas
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.display = 'none';
        answer.style.transition = 'max-height 0.3s ease-out';

        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Verifica se este item já está aberto
            const isOpen = answer.style.maxHeight !== '0px' && answer.style.maxHeight !== '0';

            // Fecha todas as respostas
            accordionItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = '0';
                }
            });

            // Se não estava aberto, abre este item
            if (!isOpen) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}