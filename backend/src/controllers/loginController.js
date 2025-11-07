/* arquivo: backend/src/controllers/loginController.js - arquivo de controller do backend: controla rotinas relacionadas a logincontroller - funções/constantes: senhaValida, token, usuario */

/*
    controller de autenticação / login:
    - valida presença de email e senha no corpo da requisição
    - busca o usuário pelo email (model: loginModel)
    - compara a senha recebida com o hash armazenado usando bcrypt
    - em caso de sucesso gera um token jwt com informações essenciais
    - define cookie httpOnly com o token e responde com dados do usuário
    - em caso de erro responde com códigos apropriados (400/401/500)
*/
import { buscarUsuarioPorEmail } from "../model/loginModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const usuario = await buscarUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        nome:
          usuario.tipo === "ong"
            ? usuario.nome_responsavel_ong
            : usuario.nome_responsavel_empresa,
        nomeInstituicao: usuario.nome,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });

    return res.status(200).json({
      message: "Login bem-sucedido!",
      userId: usuario.id,
      nome: usuario.nome,
      tipo: usuario.tipo,
      token: token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
