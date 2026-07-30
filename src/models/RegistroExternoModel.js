const db = require('../config/db');

const RegistroExternoModel = {

    obtenerPorEvento(eventoId) {
        return db.prepare(`
            SELECT * FROM registros_externos
            WHERE evento_id = ?
            ORDER BY fecha_hora_registro
        `).all(eventoId);
    },

    registrar({ eventoId, nombreCompleto, documento, correo, telefono, procedencia }) {
        const stmt = db.prepare(`
            INSERT INTO registros_externos (evento_id, nombre_completo, documento, correo, telefono, procedencia)
            VALUES (@eventoId, @nombreCompleto, @documento, @correo, @telefono, @procedencia)
        `);
        const info = stmt.run({
            eventoId,
            nombreCompleto,
            documento: documento || null,
            correo: correo || null,
            telefono: telefono || null,
            procedencia: procedencia || null
        });
        return db.prepare('SELECT * FROM registros_externos WHERE id = ?').get(info.lastInsertRowid);
    },

    contarPorEvento(eventoId) {
        return db.prepare('SELECT COUNT(*) AS total FROM registros_externos WHERE evento_id = ?').get(eventoId).total;
    }
};

module.exports = RegistroExternoModel;
