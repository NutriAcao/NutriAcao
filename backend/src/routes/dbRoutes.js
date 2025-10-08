// backend/src/routes/dbRoutes.js

import { Router } from 'express';
// Certifique-se de que o dbPool.js exporta 'pool'
import { pool } from '../config/dbPool.js'; 

const router = Router();

// A rota correta usando o objeto router
router.get("/db-test", async (req, res) => {
    try {
        // Envia o comando SQL para testar a conexão
        const result = await pool.query('SELECT 1 as is_connected');
        
        // Verifica se a query retornou o que era esperado (is_connected = 1)
        if (result.rows[0].is_connected === 1) {
             return res.status(200).json({ 
                 status: 'OK', 
                 message: 'Conexão com o banco de dados estabelecida com sucesso!' 
             });
        }
    } catch (error) {
        // Captura e retorna o erro se a conexão falhar
        console.error("Erro ao testar a conexão com o banco:", error.message);
        return res.status(500).json({ 
            status: 'ERROR', 
            message: 'Falha na conexão ou na query SQL. Verifique o DATABASE_URL.',
            details: error.message 
        });
    }
});

export default router;