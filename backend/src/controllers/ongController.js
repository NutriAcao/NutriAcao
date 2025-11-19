// backend/src/controllers/ongController.js
import * as OngModel from '../model/ongModel.js';

export async function cadastrarOng(req, res) {
    console.log('📨 Dados recebidos no req.body (ONG):', req.body);
    
    const { 
        // Dados da ONG
        nome_ong, 
        cnpj,
        email_institucional,
        
        // Dados do usuário/login
        email,
        senha,
        nome,
        telefone,
        
        // Dados do responsável legal
        nome_responsavel_ong,
        cpf_responsavel_ong,
        cargo_responsavel_ong,
        email_responsavel_ong,
        telefone_responsavel_ong,
        data_nascimento_responsavel_ong,
        
        // Endereço
        cep, 
        logradouro, 
        numero, 
        complemento, 
        bairro, 
        cidade, 
        estado
    } = req.body;

    // Validação dos campos obrigatórios
    if (!senha || !nome_ong || !cnpj || !email || !nome_responsavel_ong) {
        return res.status(400).send("Campos essenciais (Nome da ONG, CNPJ, E-mail, Senha e Nome do Responsável) não podem estar vazios.");
    }

    try {
        const resultado = await OngModel.criarOngCompleta({
            // Dados da ONG
            nome_ong, 
            cnpj,
            email_institucional,
            
            // Dados do usuário
            email,
            senha,
            nome,
            telefone,
            
            // Dados do responsável
            nome_responsavel_ong,
            cpf_responsavel_ong,
            cargo_responsavel_ong,
            email_responsavel_ong,
            telefone_responsavel_ong,
            data_nascimento_responsavel_ong,
            
            // Endereço
            cep, 
            logradouro, 
            numero, 
            complemento, 
            bairro, 
            cidade, 
            estado
        });

        return res.status(201).json({
            status: 'OK',
            message: 'ONG cadastrada com sucesso!',
            dados: resultado
        });

    } catch (error) {
        console.error('Erro no controller ao cadastrar ONG:', error);
        
        if (error.code === '23505') {
            return res.status(409).send(error.message);
        }
        
        if (error.message.includes('Campos essenciais')) {
            return res.status(400).send(error.message);
        }
        
        return res.status(500).send(error.message || "Erro interno do servidor.");
    }
}