import { Router } from 'express';
// Certifique-se de que o caminho para o seu pool de conexão está correto!
import { pool } from '../config/dbPool.js'; 

const router = Router();

// 1. Usamos 'router.get' em vez de 'app.get'
// 2. Definimos a função como 'async'
router.get("/data-test", async (req, res) => {
    try {
        const querySQL = 'SELECT * FROM pessoafisica';
        
        // 3. O 'await pool.query' envia o comando ao PostgreSQL
        const result = await pool.query(querySQL); 
        
        if (result.rows.length > 0) {
             return res.status(200).json({ 
                 status: 'OK', 
                 message: 'Dados lidos com sucesso da tabela pessoafisica.',
                 data: result.rows[0] 
             });
        } else {
             return res.status(200).json({ 
                 status: 'WARNING', 
                 message: 'Tabela encontrada, mas está vazia.',
             });
        }
    } catch (error) {
        // Trata erros como falha de conexão ou tabela inexistente
        console.error("ERRO na rota /data-test:", error.message);
        return res.status(500).json({ 
            status: 'ERROR', 
            message: 'Falha ao conectar ou executar query no PostgreSQL.',
            details: error.message 
        });
    }
});

export default router;