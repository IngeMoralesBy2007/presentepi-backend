const { pool } = require('../config/db');

const RegistroExternoModel = {

    async obtenerPorEvento(eventoId) {
        const { rows } = await pool.query(
            'SELECT * FROM registros_externos WHERE evento_id = $1 ORDER BY fecha_hora_registro',
            [eventoId]
        );
        return rows;
    },

    async registrar({ eventoId, nombreCompleto, documento, correo, telefono, procedencia }) {
        const { rows } = await pool.query(
            `INSERT INTO registros_externos (evento_id, nombre_completo, documento, correo, telefono, procedencia)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [eventoId, nombreCompleto, documento || null, correo || null, telefono || null, procedencia || null]
        );
        return rows[0];
    },

    async contarPorEvento(eventoId) {
        const { rows } = await pool.query('SELECT COUNT(*) AS total FROM registros_externos WHERE evento_id = $1', [eventoId]);
        return parseInt(rows[0].total, 10);
    }
};

module.exports = RegistroExternoModel;
