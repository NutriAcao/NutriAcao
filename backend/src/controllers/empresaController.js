//refatorado
// backend/src/controllers/empresaController.js
//refatorado
import * as EmpresaModel from '../model/empresaModel.js';

export async function cadastrarEmpresa(req, res) {
    console.log('Dados recebidos no req.body:', req.body);
    
    const { 
        // Dados da empresa
        razao_social, 
        nome_fantasia,
        cnpj, 
        ramo_atuacao,
        email_institucional,
        site_url,
        descricao,
        
        // Dados do usuário/login
        email,
        senha,
        telefone,
        nome,
        
        // Dados do responsável legal
        nome_responsavel_empresa,
        cpf_responsavel_empresa,
        cargo_responsavel_empresa,
        email_responsavel_empresa,
        telefone_responsavel_empresa,
        data_nascimento_responsavel,
        
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
    if (!senha || !razao_social || !cnpj || !email || !ramo_atuacao || !nome_responsavel_empresa) {
        return res.status(400).send("Campos essenciais (Razão Social, CNPJ, Ramo de Atuação, E-mail, Senha e Nome do Responsável) não podem estar vazios.");
    }

    try {
        const resultado = await EmpresaModel.criarEmpresaCompleta({
            // Dados da empresa
            razao_social, 
            nome_fantasia,
            cnpj, 
            ramo_atuacao,
            email_institucional,
            site_url,
            descricao,
            
            // Dados do usuário
            email,
            senha,
            telefone,
            nome,
            
            // Dados do responsável
            nome_responsavel_empresa,
            cpf_responsavel_empresa,
            cargo_responsavel_empresa,
            email_responsavel_empresa,
            telefone_responsavel_empresa,
            data_nascimento_responsavel,
            
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
            message: 'Empresa cadastrada com sucesso!',
            dados: resultado
        });

    } catch (error) {
        console.error('Erro no controller ao cadastrar empresa:', error);
        
        if (error.code === '23505') {
            return res.status(409).send(error.message);
        }
        
        if (error.message.includes('Campos essenciais')) {
            return res.status(400).send(error.message);
        }
        
        return res.status(500).send(error.message || "Erro interno do servidor.");
    }
}

// Função para buscar empresa por ID
export async function buscarEmpresa(req, res) {
    try {
        const { id } = req.params;
        const empresa = await EmpresaModel.buscarEmpresaPorId(id);
        
        return res.status(200).json({
            status: 'OK',
            dados: empresa
        });
        
    } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        return res.status(404).send(error.message);
    }
}