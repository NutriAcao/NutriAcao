// --- FUNCIONALIDADE 1: LÓGICA DO MENU DE NAVEGAÇÃO ---
export function initMenu() {
    const menuButton = document.getElementById('menu-button');
    const navMenu = document.getElementById('menu');
    const navLinks = document.querySelectorAll('#nav-list .nav-link, #nav-list .btn-login, #nav-list .btn-cadastro');

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// --- FUNCIONALIDADE 2: LÓGICA DAS OPÇÕES DE CADASTRO ORIGINAIS ---
// const ong = document.getElementById("input_ong");
// const empresa = document.getElementById("input_empresa");
// const pessoa_fisica = document.getElementById("input_pessoa-fisica");
// const erro = document.getElementById("mensagem-erro");

// if (document.querySelector('form')) {
//     document.querySelector('form').addEventListener('submit', function (e) {
//         if (!ong.checked && !empresa.checked && !pessoa_fisica.checked) {
//             e.preventDefault();
//             if (erro) {
//                 erro.style.display = "flex";
//             }
//         }
//     });

//     document.querySelector('form').addEventListener('click', function () {
//         if (ong.checked || empresa.checked || pessoa_fisica.checked) {
//             if (erro) {
//                 erro.style.display = "none";
//             }
//         }
//     });
// }

// --- FUNCIONALIDADE 3: LÓGICA DOS POPUPS DE CADASTRO ---
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do DOM para o cadastro de ONG
    const btnCadastrarOng = document.getElementById('btn-cadastrar-ong');
    const modalOng = document.getElementById('modal-ong');
    const formOng = document.getElementById('form-cadastro-ong');

    // Seleciona os elementos do DOM para o cadastro de Empresa
    const btnCadastrarEmpresa = document.getElementById('btn-cadastrar-empresa');
    const modalEmpresa = document.getElementById('modal-empresa');
    const formEmpresa = document.getElementById('form-cadastro-empresa');

    // Seleciona os elementos do DOM para o cadastro de Pessoa Física
    const btnCadastrarPessoaFisica = document.getElementById('btn-cadastrar-pessoa-fisica');
    const modalPessoaFisica = document.getElementById('modal-pessoa-fisica');
    const formPessoaFisica = document.getElementById('form-cadastro-pessoa-fisica');
    
    // Seleciona todos os botões de fechar popups
    const closeButtons = document.querySelectorAll('.close-button');

    // Abre o popup de ONG
    if (btnCadastrarOng) {
        btnCadastrarOng.addEventListener('click', () => {
            modalOng.style.display = 'block';
        });
    }

    // Abre o popup de Empresa
    if (btnCadastrarEmpresa) {
        btnCadastrarEmpresa.addEventListener('click', () => {
            modalEmpresa.style.display = 'block';
        });
    }

    // Abre o popup de Pessoa Física
    if (btnCadastrarPessoaFisica) {
        btnCadastrarPessoaFisica.addEventListener('click', () => {
            modalPessoaFisica.style.display = 'block';
        });
    }

    // Lógica para fechar qualquer popup
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (modalOng) modalOng.style.display = 'none';
            if (modalEmpresa) modalEmpresa.style.display = 'none';
            if (modalPessoaFisica) modalPessoaFisica.style.display = 'none';
            if (formOng) formOng.reset();
            if (formEmpresa) formEmpresa.reset();
            if (formPessoaFisica) formPessoaFisica.reset();
        });
    });

    // Fecha o popup quando o usuário clica fora da caixa
    window.addEventListener('click', (event) => {
        if (event.target === modalOng) {
            modalOng.style.display = 'none';
            formOng.reset();
        }
        if (event.target === modalEmpresa) {
            modalEmpresa.style.display = 'none';
            formEmpresa.reset();
        }
        if (event.target === modalPessoaFisica) {
            modalPessoaFisica.style.display = 'none';
            formPessoaFisica.reset();
        }
    });

    // Validação do formulário de ONG
    if (formOng) {
        formOng.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const senha = document.getElementById('senha').value;
            const confirmaSenha = document.getElementById('confirma-senha').value;

            if (senha !== confirmaSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            alert('Formulário de ONG enviado com sucesso!');
            modalOng.style.display = 'none';
            formOng.reset();
        });
    }
    
    // Validação do formulário de Empresa
    if (formEmpresa) {
        formEmpresa.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const senha = document.getElementById('senha-empresa').value;
            const confirmaSenha = document.getElementById('confirma-senha-empresa').value;

            if (senha !== confirmaSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            alert('Formulário de Empresa enviado com sucesso!');
            modalEmpresa.style.display = 'none';
            formEmpresa.reset();
        });
    }

    // Validação do formulário de Pessoa Física
    if (formPessoaFisica) {
        formPessoaFisica.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const senha = document.getElementById('senha-pf').value;
            const confirmaSenha = document.getElementById('confirma-senha-pf').value;

            if (senha !== confirmaSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            alert('Formulário de Pessoa Física enviado com sucesso!');
            modalPessoaFisica.style.display = 'none';
            formPessoaFisica.reset();
        });
    }
});

initMenu();