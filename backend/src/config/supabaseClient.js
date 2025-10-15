// /backend/src/config/supabaseClient.js
// arquivo  responsavel por configurar e inicializar o cliente de conexão com o Supabase, alem de exportar para que outros
// arquivos possam interagir com o supabase. Ou seja, ele atua como o módulo central de inicialização para o ecossistema Supabase na sua aplicação.

import dotenv from 'dotenv';
dotenv.config(); 

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

export const supabase = createClient(supabaseUrl, supabaseServiceRole);