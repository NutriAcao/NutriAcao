document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-login');
    const usuarioInput = document.getElementById('user');
    const senhaInput = document.getElementById('password');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = usuarioInput.value.trim();
        const senha = senhaInput.value;

        if (!usuario || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: usuario, senha })
            });

            const resultado = await response.json();

            if (response.ok) {
                alert('Login bem-sucedido!');
                console.log('Dados do usuário:', resultado);
                // Redirecionar ou salvar token/session aqui
            } else {
                alert(`Erro: ${resultado.message}`);
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            alert('Falha na comunicação com o servidor');
        }
    });
});
