//refatorado

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-login');
    const usuarioInput = document.getElementById('user');
    const senhaInput = document.getElementById('password');
    const empresaRadio = document.getElementById('empresa');
    const ongRadio = document.getElementById('ong');

    // Preencher dados salvos se existirem
    preencherDadosSalvos();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = usuarioInput.value.trim();
        const senha = senhaInput.value;

        // Validação básica
        if (!email || !senha || (!empresaRadio.checked && !ongRadio.checked)) {
            alert('Por favor, selecione uma das opções e preencha todos os campos!');
            return;
        }

        try {
            console.log('🔐 Tentativa de login:', { 
                email: email, 
                tipo: empresaRadio.checked ? 'empresa' : 'ong' 
            });

            // Fazer requisição de login
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    email: email, 
                    senha: senha 
                }),
                credentials: 'include' // Importante para cookies
            });

            const resultado = await response.json();

            console.log('📨 Resposta do servidor:', resultado);

            if (!response.ok || !resultado.success) {
                alert(`Erro: ${resultado.message || 'Credenciais inválidas'}`);
                return;
            }

            // ✅ Login bem-sucedido
            console.log('✅ Login bem-sucedido!', resultado.usuario);
            
            // Salvar dados do usuário no localStorage para uso na UI
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            
            // Verificar se o tipo do usuário bate com o tipo selecionado
            const tipoUsuario = resultado.usuario.tipo;
            const tipoSelecionado = empresaRadio.checked ? 'empresa' : 'ong';

            if (tipoUsuario !== tipoSelecionado) {
                alert(`Erro: Este email está cadastrado como ${tipoUsuario}, mas você selecionou ${tipoSelecionado}.`);
                // Limpar dados
                localStorage.removeItem('usuario');
                return;
            }

            // ✅ Redirecionar para a página específica
            console.log('🚀 Redirecionando para:', resultado.redirectUrl);
            window.location.href = resultado.redirectUrl;

        } catch (error) {
            console.error('💥 Erro de rede:', error);
            alert('Falha na comunicação com o servidor. Tente novamente.');
        }
    });

    // Função para preencher dados salvos automaticamente
    function preencherDadosSalvos() {
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
            try {
                const usuario = JSON.parse(usuarioSalvo);
                usuarioInput.value = usuario.email || '';
                
                // Marcar o radio button baseado no tipo salvo
                if (usuario.tipo === 'empresa') {
                    empresaRadio.checked = true;
                } else if (usuario.tipo === 'ong') {
                    ongRadio.checked = true;
                }
                
                console.log('📝 Dados preenchidos automaticamente:', usuario.email);
            } catch (error) {
                console.error('Erro ao recuperar dados salvos:', error);
            }
        }
    }

    // Limpar dados ao mudar os campos (opcional)
    usuarioInput.addEventListener('input', () => {
        // Se o email mudar, não preencher automaticamente o tipo
        if (usuarioInput.value !== JSON.parse(localStorage.getItem('usuario') || '{}').email) {
            empresaRadio.checked = false;
            ongRadio.checked = false;
        }
    });
});

// Função global para verificar autenticação (usada em outras páginas)
function verificarAutenticacao() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuario) {
        // Tentar fazer requisição para verificar se o cookie ainda é válido
        return fetch('/api/auth/perfil', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                window.location.href = '/loginpage.html';
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                return data.usuario;
            } else {
                window.location.href = '/loginpage.html';
                return null;
            }
        })
        .catch(() => {
            window.location.href = '/loginpage.html';
            return null;
        });
    }
    
    return Promise.resolve(usuario);
}

// Função para obter dados do usuário (útil para outras páginas)
function obterUsuario() {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
}

// Função para verificar se é empresa
function isEmpresa() {
    const usuario = obterUsuario();
    return usuario && usuario.tipo === 'empresa';
}

// Função para verificar se é ONG
function isOng() {
    const usuario = obterUsuario();
    return usuario && usuario.tipo === 'ong';
}

// Exportar funções para uso em outros arquivos (se usando modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        verificarAutenticacao,
        fazerLogout,
        obterUsuario,
        isEmpresa,
        isOng
    };
}