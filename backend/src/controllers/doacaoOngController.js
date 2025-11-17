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
export async function getPedidosDisponiveis(req, res) {
    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*') // Pega todas as colunas
            .eq('status', 'disponível'); // O FILTRO MÁGICO!

        if (error) throw error;

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar pedidos disponíveis:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}
// -------------------------------------------------------------------
// FUNÇÃO 3: Para a Tabela "Meus Pedidos Disponíveis" (Status: Disponível)
// -------------------------------------------------------------------
export async function getMeusPedidosDisponiveis(req, res) {
    const id_ong_logada = req.usuario.id; 

    if (!id_ong_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*')
            .eq('status', 'disponível') 
            .eq('id_ong', id_ong_logada); // Filtro: Somente os pedidos que EU criei

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar meus pedidos:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}

// -------------------------------------------------------------------
// FUNÇÃO 4: Para a Tabela "Itens Recebidos/Reservados" (Status: Reservado)
// -------------------------------------------------------------------
export async function getMeusPedidosReservados(req, res) {
    const id_ong_logada = req.usuario.id;

    if (!id_ong_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesSolicitadas')
            .select('*') 
            .eq('status', 'reservado') // Filtro 1: Status
            .eq('id_ong', id_ong_logada); // Filtro 2: Eu (ONG) criei

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar meus pedidos reservados:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}


// --- NOVO (PARA TABELA 3: Doações que eu reservei) ---
// Tabela 3: Excedentes em Andamento (Reservados por Mim)
export async function getDoacoesQueReservei(req, res) {
    const id_ong_logada = req.usuario.id;

    if (!id_ong_logada) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*') 
            .eq('status', 'reservado') // Filtro 1: Status
            .eq('id_ong_reserva', id_ong_logada); // Filtro 2: Eu (ONG) reservei
        
        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar doações que reservei:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}