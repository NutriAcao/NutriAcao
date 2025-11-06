
import { supabase } from "../config/supabaseClient.js";


export async function buscarUsuarioPorEmail(email, tipo = null) {
    const tabelas = tipo ? [tipo] : ['empresa', 'ong'];
    

    for (const tabela of tabelas) {
        const { data, error } = await supabase
            .from(tabela)
            .select('*')
            .eq('email', email)
            .single(); // retorna apenas 1 registro

        if (error && error.code !== 'PGRST116') { 
            // PGRST116 = no rows returned, ai ignora
            console.error(`Erro ao buscar na tabela ${tabela}:`, error);
        }

        if (data) {
            return { ...data, tipo: tabela }; // retorna dados do usuário e de qual tabela veio
        }
    }

    return null; // se não encontrou em nenhuma tabela
}
