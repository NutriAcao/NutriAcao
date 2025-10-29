// Dados de exemplo (normalmente viriam do backend)
const dadosEmpresa = {
    nomeResponsavel: "João Silva",
    cargoResponsavel: "Gerente de Operações",
    cpfResponsavel: "123.456.789-00",
    emailResponsavel: "joao.silva@empresa.com",
    telefoneResponsavel: "(11) 99999-9999",
    emailLogin: "joao.silva@empresa.com"
};

document.addEventListener('DOMContentLoaded', function() {

//Essa função carrega os dados do usuário logado
async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuario');
    const dados = await res.json();
    
    console.log('Dados completos:', dados);
    
    console.log('Dados do usuário:', JSON.stringify(dados, null, 2));
    
    if (dados.success) {
      console.log('Nome:', dados.data.nome_responsavel);
      console.log('Empresa:', dados.data.nome_empresa);
      console.log('Email:', dados.data.email_login);
    } else {
      console.log('Erro na API:', dados.message);
    }
    
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

carregarUsuario();
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('nome-responsavel').textContent = dadosEmpresa.nomeResponsavel;
    document.getElementById('cargo-responsavel').textContent = dadosEmpresa.cargoResponsavel;
    document.getElementById('cpf-responsavel').textContent = mascararCPF(dadosEmpresa.cpfResponsavel);
    document.getElementById('email-responsavel').textContent = dadosEmpresa.emailResponsavel;
    document.getElementById('telefone-responsavel').textContent = dadosEmpresa.telefoneResponsavel;
    document.getElementById('email-login').textContent = dadosEmpresa.emailLogin;

    // Configurar eventos dos botões
    document.getElementById('alterar-senha').addEventListener('click', function() {
        abrirModalAlterarSenha();
    });

    document.getElementById('redefinir-senha').addEventListener('click', function() {
        alert('Um e-mail de redefinição de senha foi enviado para ' + dadosEmpresa.emailLogin);
    });

    document.getElementById('editar-informacoes').addEventListener('click', function() {
        abrirModalEditarInformacoes();
    });

    document.getElementById('atualizar-contato').addEventListener('click', function() {
        abrirModalAtualizarContato();
    });

    document.getElementById('excluir-conta').addEventListener('click', function() {
        confirmarExclusaoConta();
    });

    // Configurar eventos do modal
    const modal = document.getElementById('modal-edicao');
    const closeBtn = document.querySelector('.close');
    const cancelarBtn = document.getElementById('cancelar-edicao');

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    cancelarBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('salvar-edicao').addEventListener('click', function() {
        salvarAlteracoes();
    });
});

// Função para mascarar CPF (exibir apenas os últimos dígitos)
function mascararCPF(cpf) {
    return '***.***.***-' + cpf.substring(cpf.length - 2);
}

// Função para abrir modal de alteração de senha
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

// Função para abrir modal de edição de informações
function abrirModalEditarInformacoes() {
    const modal = document.getElementById('modal-edicao');
    const modalTitulo = document.getElementById('modal-titulo');
    const formEdicao = document.getElementById('form-edicao');
    
    modalTitulo.textContent = 'Editar Informações do Responsável';
    
    formEdicao.innerHTML = `
        <div class="form-group">
            <label for="nome-responsavel">Nome do responsável:</label>
            <input type="text" id="nome-responsavel-input" value="${dadosEmpresa.nomeResponsavel}" required>
        </div>
        <div class="form-group">
            <label for="cargo-responsavel">Cargo do responsável:</label>
            <input type="text" id="cargo-responsavel-input" value="${dadosEmpresa.cargoResponsavel}" required>
        </div>
        <div class="form-group">
            <label for="cpf-responsavel">CPF do responsável:</label>
            <input type="text" id="cpf-responsavel-input" value="${dadosEmpresa.cpfResponsavel}" required>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Função para abrir modal de atualização de contato
function abrirModalAtualizarContato() {
    const modal = document.getElementById('modal-edicao');
    const modalTitulo = document.getElementById('modal-titulo');
    const formEdicao = document.getElementById('form-edicao');
    
    modalTitulo.textContent = 'Atualizar Dados de Contato';
    
    formEdicao.innerHTML = `
        <div class="form-group">
            <label for="email-responsavel">E-mail corporativo:</label>
            <input type="email" id="email-responsavel-input" value="${dadosEmpresa.emailResponsavel}" required>
        </div>
        <div class="form-group">
            <label for="telefone-responsavel">Telefone:</label>
            <input type="tel" id="telefone-responsavel-input" value="${dadosEmpresa.telefoneResponsavel}" required>
        </div>
        <div class="form-group">
            <label for="email-login">E-mail de login:</label>
            <input type="email" id="email-login-input" value="${dadosEmpresa.emailLogin}" required>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Função para confirmar exclusão de conta
function confirmarExclusaoConta() {
    const confirmacao = confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    
    if (confirmacao) {
        alert('Sua conta será excluída. Você será redirecionado para a página inicial.');
        // Redirecionar para a página inicial ou fazer logout
        // window.location.href = '/';
    }
}

// Função para salvar alterações (simulação)
function salvarAlteracoes() {
    const modalTitulo = document.getElementById('modal-titulo').textContent;
    const modal = document.getElementById('modal-edicao');
    
    if (modalTitulo === 'Alterar Senha') {
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        
        if (novaSenha !== confirmarSenha) {
            alert('As senhas não coincidem. Por favor, verifique.');
            return;
        }
        
        alert('Senha alterada com sucesso!');
    } 
    else if (modalTitulo === 'Editar Informações do Responsável') {
        const nome = document.getElementById('nome-responsavel-input').value;
        const cargo = document.getElementById('cargo-responsavel-input').value;
        const cpf = document.getElementById('cpf-responsavel-input').value;
        
        // Atualizar dados locais
        dadosEmpresa.nomeResponsavel = nome;
        dadosEmpresa.cargoResponsavel = cargo;
        dadosEmpresa.cpfResponsavel = cpf;
        
        // Atualizar exibição
        document.getElementById('nome-responsavel').textContent = nome;
        document.getElementById('cargo-responsavel').textContent = cargo;
        document.getElementById('cpf-responsavel').textContent = mascararCPF(cpf);
        
        alert('Informações atualizadas com sucesso!');
    }
    else if (modalTitulo === 'Atualizar Dados de Contato') {
        const emailResponsavel = document.getElementById('email-responsavel-input').value;
        const telefone = document.getElementById('telefone-responsavel-input').value;
        const emailLogin = document.getElementById('email-login-input').value;
        
        // Atualizar dados locais
        dadosEmpresa.emailResponsavel = emailResponsavel;
        dadosEmpresa.telefoneResponsavel = telefone;
        dadosEmpresa.emailLogin = emailLogin;
        
        document.getElementById('email-responsavel').textContent = emailResponsavel;
        document.getElementById('telefone-responsavel').textContent = telefone;
        document.getElementById('email-login').textContent = emailLogin;
        
        alert('Dados de contato atualizados com sucesso!');
    }
    
    modal.style.display = 'none';
}