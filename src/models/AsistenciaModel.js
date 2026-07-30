const db = require('../config/db');

const AsistenciaModel = {

    obtenerPorEvento(eventoId) {
        return db.prepare(`
            SELECT * FROM asistencias
            WHERE evento_id = ?
            ORDER BY fecha_hora_registro
        `).all(eventoId);
    },

    yaRegistrado(eventoId, estudianteId) {
        const row = db.prepare(`
            SELECT 1 FROM asistencias WHERE evento_id = ? AND estudiante_id = ?
        `).get(eventoId, estudianteId);
        return !!row;
    },

    registrar({ eventoId, estudianteId, codigoCarneEscaneado, nombreCompletoSnapshot, programaSnapshot }) {
        const stmt = db.prepare(`
            INSERT INTO asistencias (evento_id, estudiante_id, codigo_carne_escaneado, nombre_completo_snapshot, programa_snapshot)
            VALUES (@eventoId, @estudianteId, @codigoCarneEscaneado, @nombreCompletoSnapshot, @programaSnapshot)
        `);
        const info = stmt.run({ eventoId, estudianteId, codigoCarneEscaneado, nombreCompletoSnapshot, programaSnapshot });
        return db.prepare('SELECT * FROM asistencias WHERE id = ?').get(info.lastInsertRowid);
    },

    contarPorEvento(eventoId) {
        return db.prepare('SELECT COUNT(*) AS total FROM asistencias WHERE evento_id = ?').get(eventoId).total;
    }
};

module.exports = AsistenciaModel;
