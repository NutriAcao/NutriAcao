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
export async function getMeusExcedentesDisponiveis(req, res) {
    // Pega o ID da empresa logada (do middleware de autenticação)
    const id_empresa_logada = req.usuario.id; 

    if (!id_empresa_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*')
            .eq('status', 'disponível') // Filtro 1: Status
            .eq('id_empresa', id_empresa_logada); // Filtro 2: Somente os que EU criei

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar excedentes:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }

}