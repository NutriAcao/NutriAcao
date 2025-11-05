import { buscarUsuarioPorEmail } from '../model/loginModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// funçãozinha pra logar bota fé, ela puxa o email e a senha la do formulario
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

//criação do Token JWT e envio como cookie
const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo: usuario.tipo,
                nome: usuario.tipo === 'ong' 
                ? usuario.nome_responsavel_ong 
                : usuario.nome_responsavel_empresa,
                nomeInstituicao: usuario.nome
                
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // token expira em 1 hora
        );
// configura o cookie com o token
         res.cookie('token', token, {
    httpOnly: true,
    secure: true, // use HTTPS em produção
    sameSite: 'Strict',
    maxAge: 3600000 //cookie também expira em 1 hora
  });


        // retorna sucesso e tipo do usuário
        // também envia o token JWT no corpo da resposta
        return res.status(200).json({ 
            message: 'Login bem-sucedido!',
            userId: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo,
            token: token
            // se quiser testar pra ver se ta pegando, descomenta, nao sei se é uma falha de segurança, mas Deus nos abençoe que não seja
            // por que muito provavelmente eu não vou lembrar de tirar esse comentario na entrega do p.i
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}