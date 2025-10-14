import { buscarUsuarioPorEmail } from '../model/loginModel.js';
import bcrypt from 'bcrypt';

//funçãozinha pra logar bota fé, ela puxa o email e a senha la do formulario
export async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) { //verifica se ta preenchido
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    //deu green, agr ele tenta buscar um email
    try {//aqui ele leva pro model
        const usuario = await buscarUsuarioPorEmail(email);
        //se nao tiver usuario entra aqui
        if (!usuario) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }
        //compara a senha que veio do formulario com a senha que a função buscarusuario puxou la do banco de dados
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        // Retorna sucesso e tipo do usuário
        return res.status(200).json({ 
            message: 'Login bem-sucedido!',
            userId: usuario.id,
            tipo: usuario.tipo
            // se quiser testar pra ver se ta pegando, descomenta, nao sei se é uma falha de segurança, mas Deus nos abençoe que não seja
            // por que muito provavelmente eu não vou lembrar de tirar esse comentario na entrega do p.i
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}