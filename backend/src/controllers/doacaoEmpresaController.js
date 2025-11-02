import { supabase } from '../config/supabaseClient.js';

export async function cadastrarDoacaoEmpresa(req, res) {
    console.log('Dados recebidos no req.body:', req.body); 
    // receber e preparar os dados da doação da empresa do formulário
    const { 
       nome,
      email_Institucional,
      nome_alimento,
      quantidade,
      data_validade,
      cep_retirada,
      telefone,
      email,
      id_empresa
    } = req.body; 

    // verificação de Segurança e Validação Simples
    if (!nome_alimento || !nome || !email_Institucional || !email || !data_validade) {
        return res.status(400).json({message: "Campos essenciais não podem estar vazios."});
    }
    
    try {
       

        // insere dados na tabela 'Empresa'
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .insert([
                { 
                    NomeEmpresa: nome,
                    email_Institucional: email_Institucional,
                    nome_alimento: nome_alimento,
                    quantidade: quantidade,
                    data_validade: data_validade,
                    cep_retirada: cep_retirada,
                    telefone_contato: telefone,
                    email_contato: email,
                    status: 'disponível',
                    id_empresa: id_empresa
                } 
            ])
            .select(); // Retorna o registro para confirmação

        if (error) {
            
            console.error('Erro ao cadastrar a doação:', error.message);
            
            
            return res.status(500).json({message:"Falha no cadastro da doação. Erro: " + error.message});
        }

        return res.status(201).json({ 
            status: 'OK', 
            message: 'Doação cadastrada com sucesso !', 
            dados: data
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro da Empresa:', e);
        return res.status(500).json({message:"Erro fatal ao processar a requisição."});
    }
}