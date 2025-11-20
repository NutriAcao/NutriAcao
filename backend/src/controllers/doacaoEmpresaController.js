// controllers/doacaoEmpresaController.js

// ADAPTADO ----------------------------------------------///////////////
import { supabase } from '../config/supabaseClient.js';

export async function cadastrarDoacaoEmpresa(req, res) {
    console.log('Dados recebidos no req.body:', req.body); 
    
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

    // Verificação de segurança e validação
    if (!nome_alimento || !nome || !email_Institucional || !email || !data_validade) {
        return res.status(400).json({
          success: false,
          message: "Campos essenciais não podem estar vazios."
        });
    }
    
    try {
        // NOVO: Primeiro inserir na tabela excedentes
        const { data: excedente, error: excedenteError } = await supabase
            .from('excedentes')
            .insert([
                { 
                    empresa_id: id_empresa,
                    titulo: nome_alimento,
                    descricao: `Doação de ${nome_alimento} - CEP retirada: ${cep_retirada}`,
                    categoria_id: 1, // Categoria padrão - você pode ajustar depois
                    quantidade: quantidade,
                    unidade_medida_id: 1, // Unidade padrão (kg) - ajustar conforme necessário
                    data_validade: data_validade,
                    status: 'disponivel',
                    data_criacao: new Date()
                } 
            ])
            .select()
            .single();

        if (excedenteError) {
            console.error('Erro ao cadastrar excedente:', excedenteError.message);
            return res.status(500).json({
              success: false,
              message: "Falha no cadastro do excedente. Erro: " + excedenteError.message
            });
        }

        const { data: doacao, error: doacaoError } = await supabase
        .from('doacoes_disponiveis')
        .insert([
            { 
                empresa_id: id_empresa,
                excedente_id: excedente.id,
                titulo: nome_alimento,
                descricao: descricaoCompleta,
                quantidade: quantidade,
                data_validade: data_validade,
                status: 'disponível',
                data_publicacao: new Date(),
                // USANDO OS NOVOS CAMPOS
                cep_retirada: cep_retirada,
                telefone_contato: telefone,
                email_contato: email
            } 
        ])
        .select();

        if (doacaoError) {
            console.error('Erro ao criar doação disponível:', doacaoError.message);
            
            // Rollback: deletar o excedente criado
            await supabase.from('excedentes').delete().eq('id', excedente.id);
            
            return res.status(500).json({
              success: false,
              message: "Falha ao criar doação disponível. Erro: " + doacaoError.message
            });
        }

        return res.status(201).json({ 
            success: true,
            message: 'Doação cadastrada com sucesso!', 
            data: {
                excedente: excedente,
                doacao: doacao
            }
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro da doação:', e);
        return res.status(500).json({
          success: false,
          message: "Erro fatal ao processar a requisição."
        });
    }
}