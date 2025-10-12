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
// (MANTIDA COMENTADA)

// --- FUNCIONALIDADE 3: LÓGICA DOS POPUPS DE CADASTRO E ENVIO ---
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

    // ==========================================================
    // LÓGICA DE ABRIR/FECHAR MODAIS (MANTIDA)
    // ==========================================================
    if (btnCadastrarOng) btnCadastrarOng.addEventListener('click', () => { modalOng.style.display = 'block'; });
    if (btnCadastrarEmpresa) btnCadastrarEmpresa.addEventListener('click', () => { modalEmpresa.style.display = 'block'; });
    if (btnCadastrarPessoaFisica) btnCadastrarPessoaFisica.addEventListener('click', () => { modalPessoaFisica.style.display = 'block'; });

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

    window.addEventListener('click', (event) => {
        if (event.target === modalOng) { modalOng.style.display = 'none'; formOng.reset(); }
        if (event.target === modalEmpresa) { modalEmpresa.style.display = 'none'; formEmpresa.reset(); }
        if (event.target === modalPessoaFisica) { modalPessoaFisica.style.display = 'none'; formPessoaFisica.reset(); }
    });

    // ==========================================================
    // LÓGICA DE SUBMISSÃO E ENVIO DE DADOS (AGORA COM FETCH)
    // ==========================================================
    
    // Submissão da ONG
    if (formOng) {
        formOng.addEventListener('submit', async (event) => { // ADICIONADO 'async'
            event.preventDefault(); 
            
            const senha = document.getElementById('senha').value;
            const confirmaSenha = document.getElementById('confirma-senha').value;

            if (senha !== confirmaSenha) {
                alert('As senhas não coincidem!');
                return;
            }

            // 1. Coleta e converte os dados do formulário
            const formData = new FormData(formOng);
            const dadosCompletos = Object.fromEntries(formData.entries());
            
            // 2. Cria o objeto de dados que será enviado para o Express
            // Nota: Se o seu controller da ONG espera os dados do Responsável Legal,
            // você deve adicionar essas chaves aqui também.
            const dadosONG = {
                // Dados da Instituição
                nome: dadosCompletos.nome,
                cnpj: dadosCompletos.cnpj,
                area_atuacao: dadosCompletos.area_atuacao,
                cep: dadosCompletos.cep,
                endereco: dadosCompletos.endereco,
                telefone: dadosCompletos.telefone,
                email: dadosCompletos.email,
                // Credenciais
                login: dadosCompletos.login, // Adicionado 'login'
                senha: dadosCompletos.senha 
            };

            try {
                // 3. Envia a requisição HTTP POST para o backend
                const response = await fetch('/api/cadastro/ong', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Informa ao Express o formato
                    },
                    body: JSON.stringify(dadosONG) // Envia o JSON
                });

                const resultado = await response.json();
                
                // 4. Trata a resposta do Express
                if (response.ok) { // 200-299 Status code
                    alert(`✅ SUCESSO! ${resultado.message}`); 
                    modalOng.style.display = 'none';
                    formOng.reset();
                } else {
                    // Erros 400, 409, 500 retornados pelo seu Controller
                    alert(`❌ FALHA: ${resultado.message || 'Erro de servidor desconhecido.'}`);
                }

            } catch (error) {
                console.error('Erro de rede ao comunicar com o servidor:', error);
                alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
            }
        });
    }
    
    // Submissão de Empresa (APENAS ESQUELETO - REQUER LÓGICA DE FETCH COMPLETA)
    // Localize formEmpresa.addEventListener('submit') e substitua por este código:
if (formEmpresa) {
    formEmpresa.addEventListener('submit', async (event) => { // É NECESSÁRIO O 'async'
        event.preventDefault(); 
        
        // Validação de senha
        const senha = document.getElementById('senha-empresa').value;
        const confirmaSenha = document.getElementById('confirma-senha-empresa').value;

        if (senha !== confirmaSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        
        // 1. Coleta dos dados do formulário
        const formData = new FormData(formEmpresa);
        const dadosCompletos = Object.fromEntries(formData.entries());

        const dadosEmpresa = {
            nome: dadosCompletos.nome,
            cnpj: dadosCompletos.cnpj,
            area_atuacao: dadosCompletos.area_atuacao,
            cep: dadosCompletos.cep,
            endereco: dadosCompletos.endereco,
            telefone: dadosCompletos.telefone,
            email: dadosCompletos.email,
            senha: dadosCompletos.senha 
        };

        try {
            // 3. Envio da Requisição HTTP POST
            const response = await fetch('/api/cadastro/empresa', { // Rota para Empresa
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(dadosEmpresa)
            });

            const resultado = await response.json();
            
            // 4. Tratamento da Resposta
            if (response.ok) { 
                alert(`✅ SUCESSO! ${resultado.message || 'Empresa cadastrada com sucesso!'}`); 
                document.getElementById('modal-empresa').style.display = 'none';
                formEmpresa.reset();
            } else {
                alert(`❌ FALHA (Status ${response.status}): ${resultado.message || 'Erro de servidor desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de rede ou falha ao processar a resposta:', error);
            alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
        }
    });
}
    

    // Submissão de Pessoa Física (APENAS ESQUELETO - REQUER LÓGICA DE FETCH COMPLETA)
    if (formPessoaFisica) {
        formPessoaFisica.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const senha = document.getElementById('senha-pf').value;
            const confirmaSenha = document.getElementById('confirma-senha-pf').value;

            if (senha !== confirmaSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            // *** AQUI VOCÊ DEVE INSERIR A LÓGICA DE FETCH PARA A PESSOA FÍSICA ***
            alert('Formulário de Pessoa Física interceptado. Insira a lógica de FETCH aqui.');
        });
    }
});

initMenu();