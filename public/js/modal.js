// PARA USAR O MODAL, CERTIFIQUE-SE DE:
// 1. Incluir o arquivo CSS (style-modal.css) no HTML
// 2. Ter o trecho de código abaixo no HTML:
// <div id="app-modal" class="app-modal" aria-hidden="true" role="dialog" aria-modal="true"
//     aria-labelledby="app-modal-title">
//     <div class="app-modal-backdrop" data-close></div>
//     <div class="app-modal-panel" role="document">
//       <header class="app-modal-header">
//         <h2 id="app-modal-title" class="app-modal-title">Aviso</h2>
//         <button class="app-modal-close" aria-label="Fechar" data-close>&times;</button>
//       </header>
//       <div class="app-modal-body" id="app-modal-body">Mensagem</div>
//       <footer class="app-modal-footer">
//         <button id="app-modal-ok" class="app-modal-ok">OK</button>
//       </footer>
//     </div>
//   </div>
// 3. Importe a função showPopup no arquivo JS onde desejar usar o modal com:
// import { showPopup } from './modal.js'; (Adapte o caminho conforme necessário)
// 4. chame showPopup() com a mensagem e as opções desejadas.
// Por exemplo:
// showPopup('Mensagem de aviso', { title: 'Título', type: 'info', okText: 'OK', onClose: () => { ... } });


    const modal = document.getElementById('app-modal');
    const panel = modal.querySelector('.app-modal-panel');
    const bodyEl = document.getElementById('app-modal-body');
    const titleEl = document.getElementById('app-modal-title');
    const okBtn = document.getElementById('app-modal-ok');
    const closeBtns = modal.querySelectorAll('[data-close]');

    let lastFocused = null;

    export function trapFocus(e) {
        const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    export function showPopup(message, options = {}) {
        const { title = 'Aviso', type = 'info', okText = 'OK', onClose = null } = options;
        lastFocused = document.activeElement;
        titleEl.textContent = title;
        bodyEl.textContent = message;
        okBtn.textContent = okText;

        // Ajusta classe de tipo
        panel.classList.remove('info', 'error', 'success');
        panel.classList.add(type);

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');

        // foco no botão OK
        okBtn.focus();

        function closeHandler() {
            hidePopup();
            if (typeof onClose === 'function') onClose();
        }

        // eventos temporários
        okBtn.addEventListener('click', closeHandler, { once: true });
        closeBtns.forEach(b => b.addEventListener('click', closeHandler, { once: true }));

        // ESC e trap focus
        function keyHandler(e) {
            if (e.key === 'Escape') {
                closeHandler();
            } else {
                trapFocus(e);
            }
        }

        document.addEventListener('keydown', keyHandler);

        // guardar para remover depois
        modal._cleanup = () => {
            document.removeEventListener('keydown', keyHandler);
        };
    }

    export function hidePopup() {
        modal.setAttribute('aria-hidden', 'true');
        // animação curta antes de esconder
        setTimeout(() => {
            modal.style.display = 'none';
            if (modal._cleanup) modal._cleanup();
            if (lastFocused) lastFocused.focus();
        }, 180);
    }

