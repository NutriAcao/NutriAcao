import { showPopup } from './modal.js';

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

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do DOM
    const btnCadastrarOng = document.getElementById('btn-cadastrar-ong');
    const btnCadastrarEmpresa = document.getElementById('btn-cadastrar-empresa');
    const modalOng = document.getElementById('modal-ong');
    const modalEmpresa = document.getElementById('modal-empresa');
    const formOng = document.getElementById('form-cadastro-ong');
    const formEmpresa = document.getElementById('form-cadastro-empresa');
    const closeButtons = document.querySelectorAll('.close-button');

    // Abre modais
    if (btnCadastrarOng) {
        btnCadastrarOng.addEventListener('click', () => { 
            modalOng.style.display = 'block';
        });
    }

    if (btnCadastrarEmpresa) {
        btnCadastrarEmpresa.addEventListener('click', () => { 
            modalEmpresa.style.display = 'block'; 
        });
    }

    // Fecha modais
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (modalOng) modalOng.style.display = 'none';
            if (modalEmpresa) modalEmpresa.style.display = 'none';
            if (formOng) formOng.reset();
            if (formEmpresa) formEmpresa.reset();
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalOng) { 
            modalOng.style.display = 'none'; 
            if (formOng) formOng.reset();
        }
        if (event.target === modalEmpresa) { 
            modalEmpresa.style.display = 'none'; 
            if (formEmpresa) formEmpresa.reset();
        }
    });

    // Submissão da ONG
    if (formOng) {
        formOng.addEventListener('submit', async (event) => { 
            event.preventDefault(); 
            
            const senha = document.getElementById('senha_ong').value;
            const confirmaSenha = document.getElementById('confirma_senha_ong').value;

            if (senha !== confirmaSenha) {
                showPopup('As senhas não coincidem!', { title: 'Erro', type: 'error', okText: 'OK' });
                return;
            }

            const formData = new FormData(formOng);
            const dadosCompletos = Object.fromEntries(formData.entries());
            
            // Preparar dados conforme a nova estrutura do banco
            const dadosONG = {
                // Dados da ONG
                nome_ong: dadosCompletos.nome_ong,
                cnpj: dadosCompletos.cnpj_ong,
                email_institucional: dadosCompletos.email_institucional_ong,
                
                // Dados do usuário/login
                email: dadosCompletos.email,
                senha: dadosCompletos.senha,
                nome: dadosCompletos.nome_usuario_ong,
                telefone: dadosCompletos.telefone_ong,
                
                // Dados do responsável
                nome_responsavel_ong: dadosCompletos.nome_responsavel_ong,
                cpf_responsavel_ong: dadosCompletos.cpf_responsavel_ong,
                cargo_responsavel_ong: dadosCompletos.cargo_responsavel_ong,
                email_responsavel_ong: dadosCompletos.email_responsavel_ong,
                telefone_responsavel_ong: dadosCompletos.telefone_responsavel_ong,
                data_nascimento_responsavel_ong: dadosCompletos.data_nascimento_responsavel_ong,
                
                // Endereço
                cep: dadosCompletos.cep_ong,
                logradouro: dadosCompletos.logradouro_ong,
                numero: dadosCompletos.numero_ong,
                complemento: dadosCompletos.complemento_ong,
                bairro: dadosCompletos.bairro_ong,
                cidade: dadosCompletos.cidade_ong,
                estado: dadosCompletos.estado_ong
            };


            try {
                const response = await fetch('/api/ongs/cadastrar', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosONG)
                });

                const resultado = await response.json();
                
                if (response.ok) {
                    showPopup('SUCESSO! ONG cadastrada com sucesso!', { title: 'Sucesso', type: 'success', okText: 'OK' });
                    modalOng.style.display = 'none';
                    formOng.reset();
                } else {
                    showPopup(`FALHA: ${resultado.message || 'Erro no cadastro'}`, { title: 'Erro', type: 'error', okText: 'OK' });
                }

            } catch (error) {
                console.error('Erro de rede ao comunicar com o servidor:', error);
                showPopup('Ocorreu um erro de conexão. Tente novamente mais tarde.', { title: 'Erro', type: 'error', okText: 'OK' });
            }
        });
    }
    
    // Submissão da Empresa
    if (formEmpresa) {
        formEmpresa.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            // Validação de senha
            const senha = document.getElementById('senha').value;
            const confirmaSenha = document.getElementById('confirma_senha').value;

            if (senha !== confirmaSenha) {
                showPopup('As senhas não coincidem!', { title: 'Erro', type: 'error', okText: 'OK' });
                return;
            }
            
            // Coleta dos dados do formulário
            const formData = new FormData(formEmpresa);
            const dadosCompletos = Object.fromEntries(formData.entries());

            // Preparar dados conforme a nova estrutura do banco
            const dadosEmpresa = {
                // Dados da empresa
                razao_social: dadosCompletos.razao_social,
                nome_fantasia: dadosCompletos.nome_fantasia,
                cnpj: dadosCompletos.cnpj,
                ramo_atuacao: dadosCompletos.ramo_atuacao,
                email_institucional: dadosCompletos.email_institucional,
                site_url: dadosCompletos.site_url,
                descricao: dadosCompletos.descricao,
                
                // Dados do usuário/login
                email: dadosCompletos.email,
                senha: dadosCompletos.senha,
                nome: dadosCompletos.nome,
                telefone: dadosCompletos.telefone,
                
                // Dados do responsável
                nome_responsavel_empresa: dadosCompletos.nome_responsavel_empresa,
                cpf_responsavel_empresa: dadosCompletos.cpf_responsavel_empresa,
                cargo_responsavel_empresa: dadosCompletos.cargo_responsavel_empresa,
                email_responsavel_empresa: dadosCompletos.email_responsavel_empresa,
                telefone_responsavel_empresa: dadosCompletos.telefone_responsavel_empresa,
                data_nascimento_responsavel: dadosCompletos.data_nascimento_responsavel,
                
                // Endereço
                cep: dadosCompletos.cep,
                logradouro: dadosCompletos.logradouro,
                numero: dadosCompletos.numero,
                complemento: dadosCompletos.complemento,
                bairro: dadosCompletos.bairro,
                cidade: dadosCompletos.cidade,
                estado: dadosCompletos.estado
            };


            try {
                // Envio da Requisição HTTP POST
                const response = await fetch('/api/empresas/cadastrar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(dadosEmpresa)
                });

                const resultado = await response.json();
                
                // Tratamento da Resposta
                if (response.ok) { 
                    showPopup('SUCESSO! Empresa cadastrada com sucesso!', { title: 'Sucesso', type: 'success', okText: 'OK' });
                    modalEmpresa.style.display = 'none';
                    formEmpresa.reset();
                } else {
                    showPopup(`FALHA: ${resultado.message || 'Erro no cadastro'}`, { title: 'Erro', type: 'error', okText: 'OK' });
                }

            } catch (error) {
                console.error('Erro de rede ou falha ao processar a resposta:', error);
                showPopup('Ocorreu um erro de conexão. Tente novamente mais tarde.', { title: 'Erro', type: 'error', okText: 'OK' });
            }
        });
    }

    // Aplicar máscaras nos campos
    aplicarMascaras();
    configurarAutoCompleteCEP();
});

// Função para aplicar máscaras nos campos
function aplicarMascaras() {
    // Máscara para CPF
    const cpfInputs = document.querySelectorAll('input[name*="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2')
                           .replace(/(\d{3})(\d)/, '$1.$2')
                           .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
            e.target.value = value;
        });
    });
    
    // Máscara para CNPJ
    const cnpjInputs = document.querySelectorAll('input[name*="cnpj"]');
    cnpjInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 14) {
                value = value.replace(/(\d{2})(\d)/, '$1.$2')
                           .replace(/(\d{3})(\d)/, '$1.$2')
                           .replace(/(\d{3})(\d)/, '$1/$2')
                           .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
            }
            e.target.value = value;
        });
    });
    
    // Máscara para CEP
    const cepInputs = document.querySelectorAll('input[name*="cep"]');
    cepInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    });

    // Máscara para telefone
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2')
                           .replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    });
}

// Função para auto-completar endereço via CEP
function configurarAutoCompleteCEP() {
    const cepInputs = document.querySelectorAll('input[name*="cep"]');
    
    cepInputs.forEach(cepInput => {
        cepInput.addEventListener('blur', async function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            const form = e.target.closest('form');
            
            if (cep.length === 8) {
                try {
                    console.log(`🔍 Buscando endereço para CEP: ${cep}`);
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const endereco = await response.json();
                    
                    if (!endereco.erro) {
                        console.log('📍 Endereço encontrado:', endereco);
                        
                        // Encontrar os campos correspondentes no mesmo formulário
                        const logradouroInput = form.querySelector('input[name*="logradouro"]');
                        const bairroInput = form.querySelector('input[name*="bairro"]');
                        const cidadeInput = form.querySelector('input[name*="cidade"]');
                        const estadoSelect = form.querySelector('select[name*="estado"]');
                        
                        if (logradouroInput) logradouroInput.value = endereco.logradouro;
                        if (bairroInput) bairroInput.value = endereco.bairro;
                        if (cidadeInput) cidadeInput.value = endereco.localidade;
                        if (estadoSelect) estadoSelect.value = endereco.uf;
                    } else {
                        console.log('❌ CEP não encontrado');
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                }
            }
        });
    });
}

initMenu();

