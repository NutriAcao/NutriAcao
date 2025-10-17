document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-login');
    const usuarioInput = document.getElementById('user');
    const senhaInput = document.getElementById('password');
    const empresaRadio = document.getElementById('empresa');
    const ongRadio = document.getElementById('ong');
    

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = usuarioInput.value.trim();
        const senha = senhaInput.value;

        if (!usuario || !senha || (!empresaRadio.checked && !ongRadio.checked)) {
            alert('Por favor, selecione uma das opções e preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: usuario, senha, tipo: empresaRadio.checked ? 'empresa' : 'ong' })
            });

            const resultado = await response.json();

            if (!response.ok) {
        alert(`Erro: ${resultado.message}`);
        return;
    }

    // Verifica se o tipo retornado bate com o tipo selecionado
    if (resultado.tipo === 'ong' && ongRadio.checked) {
        alert('Login bem-sucedido!');
        window.location.href = '../ong/visualizacaoDoacoes.html';
    } else if (resultado.tipo === 'empresa' && empresaRadio.checked) {
        alert('Login bem-sucedido!');
        window.location.href = '../empresa/visualizacaoOngs.html';
    } else {
        alert('Erro: Usuário não encontrado no tipo selecionado !');
    }

} catch (error) {
            console.error('Erro de rede:', error);
            alert('Falha na comunicação com o servidor');
            
        }
    });
});


