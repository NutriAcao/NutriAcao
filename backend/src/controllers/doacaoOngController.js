import { supabase } from '../config/supabaseClient.js';

export async function cadastrarDoacaoOng(req, res) {
    console.log('Dados recebidos no req.body:', req.body); 
    // receber e preparar os dados da doação da empresa do formulário
    const { 
      nome,
      email_Institucional,
      nome_alimento,
      quantidade,
      telefone,
      email,
      id_ong
    } = req.body;

    // verificação de segurança e validação Simples
    if (!nome_alimento || !nome || !email_Institucional || !email) {
        return res.status(400).json({message: "Campos essenciais não podem estar vazios."});
    }
    
    try {
       

        // insere dados na tabela 'Empresa'
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .insert([
                { 
                    nomeONG: nome,
                    email_Institucional: email_Institucional,
                    nome_alimento: nome_alimento,
                    quantidade: quantidade,
                    telefoneContato: telefone,
                    emailContato: email,
                    status: 'disponível',
                    id_ong: id_ong
                } 
            ])
            .select(); // retorna o registro para confirmação

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