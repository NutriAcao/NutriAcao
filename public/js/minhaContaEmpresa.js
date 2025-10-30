// Variável global para armazenar os dados da empresa
let dadosEmpresa = {};

// Função para mascarar CPF
function mascararCPF(cpf) {
    return '***.***.***-' + cpf.substring(cpf.length - 2);
}

document.addEventListener('DOMContentLoaded', function () {

    // Função principal que busca os dados da API
    async function carregarUsuario() {
        try {
            const res = await fetch('/api/usuario');
            const dados = await res.json();

            console.log('Dados completos:', dados);

            if (!dados || !dados.email) {
                console.error('Erro: resposta inválida da API.');
                return;
            }

            // Preenche o objeto de dados da empresa
            dadosEmpresa = {
                nomeResponsavel: "João Silva", // Aqui você pode preencher futuramente via API
                cargoResponsavel: "Gerente de Operações",
                cpfResponsavel: "123.456.789-00",
                emailResponsavel: dados.email,
                telefoneResponsavel: "(11) 99999-9999",
                emailLogin: dados.email,
                tipo: dados.tipo
            };

            // Atualiza o conteúdo na tela
            atualizarCamposHTML();

        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro);
        }
    }

    // Atualiza os elementos HTML com os dados atuais
    function atualizarCamposHTML() {
        document.getElementById('nome-responsavel').textContent = dadosEmpresa.nomeResponsavel;
        document.getElementById('cargo-responsavel').textContent = dadosEmpresa.cargoResponsavel;
        document.getElementById('cpf-responsavel').textContent = mascararCPF(dadosEmpresa.cpfResponsavel);
        document.getElementById('email-responsavel').textContent = dadosEmpresa.emailResponsavel;
        document.getElementById('telefone-responsavel').textContent = dadosEmpresa.telefoneResponsavel;
        document.getElementById('email-login').textContent = dadosEmpresa.emailLogin;
    }

    // Carrega o usuário
    carregarUsuario();

    // === EVENTOS DOS BOTÕES PRINCIPAIS ===
    document.getElementById('alterar-senha').addEventListener('click', abrirModalAlterarSenha);
    document.getElementById('redefinir-senha').addEventListener('click', function () {
        alert(`Um e-mail de redefinição de senha foi enviado para ${dadosEmpresa.emailLogin}`);
    });
    document.getElementById('editar-informacoes').addEventListener('click', abrirModalEditarInformacoes);
    document.getElementById('atualizar-contato').addEventListener('click', abrirModalAtualizarContato);
    document.getElementById('excluir-conta').addEventListener('click', confirmarExclusaoConta);

    // === MODAL ===
    const modal = document.getElementById('modal-edicao');
    const closeBtn = document.querySelector('.close');
    const cancelarBtn = document.getElementById('cancelar-edicao');

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelarBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    document.getElementById('salvar-edicao').addEventListener('click', salvarAlteracoes);
});

// === FUNÇÕES DE MODAL ===
function abrirModalAlterarSenha() {
    const modal = document.getElementById('modal-edicao');
    const modalTitulo = document.getElementById('modal-titulo');
    const formEdicao = document.getElementById('form-edicao');

    modalTitulo.textContent = 'Alterar Senha';
    formEdicao.innerHTML = `
        <div class="form-group">
            <label for="senha-atual">Senha atual:</label>
            <input type="password" id="senha-atual" required>
        </div>
        <div class="form-group">
            <label for="nova-senha">Nova senha:</label>
            <input type="password" id="nova-senha" required>
        </div>
        <div class="form-group">
            <label for="confirmar-senha">Confirmar nova senha:</label>
            <input type="password" id="confirmar-senha" required>
        </div>
    `;
    modal.style.display = 'block';
}

function abrirModalEditarInformacoes() {
    const modal = document.getElementById('modal-edicao');
    const modalTitulo = document.getElementById('modal-titulo');
    const formEdicao = document.getElementById('form-edicao');

    modalTitulo.textContent = 'Editar Informações do Responsável';
    formEdicao.innerHTML = `
        <div class="form-group">
            <label>Nome do responsável:</label>
            <input type="text" id="nome-responsavel-input" value="${dadosEmpresa.nomeResponsavel}" required>
        </div>
        <div class="form-group">
            <label>Cargo do responsável:</label>
            <input type="text" id="cargo-responsavel-input" value="${dadosEmpresa.cargoResponsavel}" required>
        </div>
        <div class="form-group">
            <label>CPF do responsável:</label>
            <input type="text" id="cpf-responsavel-input" value="${dadosEmpresa.cpfResponsavel}" required>
        </div>
    `;
    modal.style.display = 'block';
}

function abrirModalAtualizarContato() {
    const modal = document.getElementById('modal-edicao');
    const modalTitulo = document.getElementById('modal-titulo');
    const formEdicao = document.getElementById('form-edicao');

    modalTitulo.textContent = 'Atualizar Dados de Contato';
    formEdicao.innerHTML = `
        <div class="form-group">
            <label>E-mail corporativo:</label>
            <input type="email" id="email-responsavel-input" value="${dadosEmpresa.emailResponsavel}" required>
        </div>
        <div class="form-group">
            <label>Telefone:</label>
            <input type="tel" id="telefone-responsavel-input" value="${dadosEmpresa.telefoneResponsavel}" required>
        </div>
        <div class="form-group">
            <label>E-mail de login:</label>
            <input type="email" id="email-login-input" value="${dadosEmpresa.emailLogin}" required>
        </div>
    `;
    modal.style.display = 'block';
}

function confirmarExclusaoConta() {
    const confirmar = confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    if (confirmar) {
        alert('Sua conta foi excluída. Você será redirecionado para a página inicial.');
        // window.location.href = '/';
    }
}

// === SALVAR ALTERAÇÕES ===
function salvarAlteracoes() {
    const modalTitulo = document.getElementById('modal-titulo').textContent;
    const modal = document.getElementById('modal-edicao');

    if (modalTitulo === 'Alterar Senha') {
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (novaSenha !== confirmarSenha) {
            alert('As senhas não coincidem.');
            return;
        }

        alert('Senha alterada com sucesso!');
    } else if (modalTitulo === 'Editar Informações do Responsável') {
        dadosEmpresa.nomeResponsavel = document.getElementById('nome-responsavel-input').value;
        dadosEmpresa.cargoResponsavel = document.getElementById('cargo-responsavel-input').value;
        dadosEmpresa.cpfResponsavel = document.getElementById('cpf-responsavel-input').value;

        document.getElementById('nome-responsavel').textContent = dadosEmpresa.nomeResponsavel;
        document.getElementById('cargo-responsavel').textContent = dadosEmpresa.cargoResponsavel;
        document.getElementById('cpf-responsavel').textContent = mascararCPF(dadosEmpresa.cpfResponsavel);

        alert('Informações atualizadas com sucesso!');
    } else if (modalTitulo === 'Atualizar Dados de Contato') {
        dadosEmpresa.emailResponsavel = document.getElementById('email-responsavel-input').value;
        dadosEmpresa.telefoneResponsavel = document.getElementById('telefone-responsavel-input').value;
        dadosEmpresa.emailLogin = document.getElementById('email-login-input').value;

        document.getElementById('email-responsavel').textContent = dadosEmpresa.emailResponsavel;
        document.getElementById('telefone-responsavel').textContent = dadosEmpresa.telefoneResponsavel;
        document.getElementById('email-login').textContent = dadosEmpresa.emailLogin;

        alert('Dados de contato atualizados com sucesso!');
    }

    modal.style.display = 'none';
}