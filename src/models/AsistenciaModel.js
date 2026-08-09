const { pool } = require('../config/db');

const AsistenciaModel = {

    async obtenerPorEvento(eventoId) {
        const { rows } = await pool.query(
            'SELECT * FROM asistencias WHERE evento_id = $1 ORDER BY fecha_hora_registro',
            [eventoId]
        );
        return rows;
    },

    async yaRegistrado(eventoId, estudianteId) {
        const { rows } = await pool.query(
            'SELECT 1 FROM asistencias WHERE evento_id = $1 AND estudiante_id = $2',
            [eventoId, estudianteId]
        );
        return rows.length > 0;
    },

    async registrar({ eventoId, estudianteId, codigoCarneEscaneado, nombreCompletoSnapshot, programaSnapshot, rol }) {
        const { rows } = await pool.query(
            `INSERT INTO asistencias (evento_id, estudiante_id, codigo_carne_escaneado, nombre_completo_snapshot, programa_snapshot, rol)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [eventoId, estudianteId, codigoCarneEscaneado, nombreCompletoSnapshot, programaSnapshot, rol || 'ESTUDIANTE']
        );
        return rows[0];
    },

    async contarPorEvento(eventoId) {
        const { rows } = await pool.query('SELECT COUNT(*) AS total FROM asistencias WHERE evento_id = $1', [eventoId]);
        return parseInt(rows[0].total, 10);
    }
};

module.exports = AsistenciaModel;
