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
                body: JSON.stringify({ email: usuario, senha })
            });

            const resultado = await response.json();

             if (response.ok) {
                if (resultado.tipo === 'ong') {
                    if (ongRadio.checked) {
                        alert('Login bem-sucedido!');
                        window.location.href = '../ong/visualizacaoDoacoes.html';

                    } else if (empresaRadio.checked) {
                        alert('Erro: Usuário não encontrado !');
                        //Indica que o usuário é do tipo ONG, mas tentou logar como empresa
                    } else {
                alert(`Erro: ${resultado.message}`);
            }
            
            } else if (resultado.tipo === 'empresa') {
                if (empresaRadio.checked) {

                    alert('Login bem-sucedido!');
                    window.location.href ='../empresa/visualizacaoOngs.html';
                } else if (ongRadio.checked) {
                    alert('Usuário não encontrado !');
                    //Indica que o usuário é do tipo Empresa, mas tentou logar como ONG
                } else {
                alert(`Erro: ${resultado.message}`);
            }
            } else {
                    alert('Erro: Usuário não encontrado !');
                    //Indica que o usuário não está em nenhuma das tabelas, ou seja, não efetuou o cadastro
                    
                
                
            } 
        }
             
        } catch (error) {
            console.error('Erro de rede:', error);
            alert('Falha na comunicação com o servidor');
        }
    });
});


