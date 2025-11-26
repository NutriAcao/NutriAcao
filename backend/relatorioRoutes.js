const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexão com Supabase/Postgres

// Rota para buscar dados de impacto
router.get('/impacto', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT beneficiario_id) AS total_beneficiarios,
        SUM(qtd_alimentos) AS total_alimentos,
        SUM(peso_kg) AS peso_total
      FROM doacoes
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar relatório de impacto' });
  }
});

module.exports = router;
