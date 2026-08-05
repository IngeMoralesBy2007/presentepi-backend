const db = require('../config/db');

const EstudianteModel = {

    obtenerTodos() {
        return db.prepare('SELECT * FROM estudiantes ORDER BY nombre_completo').all();
    },

    obtenerPorId(id) {
        return db.prepare('SELECT * FROM estudiantes WHERE id = ?').get(id);
    },

    // Usado al escanear el codigo de barras del carne
    obtenerPorCodigoCarne(codigoCarne) {
        return db.prepare('SELECT * FROM estudiantes WHERE codigo_carne = ?').get(codigoCarne);
    },

    // Usado en el flujo de lectura de datos impresos del carne (OCR),
    // cuando no hay codigo de barras pre-registrado.
    obtenerPorDocumento(documento) {
        return db.prepare('SELECT * FROM estudiantes WHERE documento = ?').get(documento);
    },

    crear(estudiante) {
        const stmt = db.prepare(`
            INSERT INTO estudiantes (codigo_carne, nombre_completo, documento, programa, ciclo, correo, telefono, activo)
            VALUES (@codigoCarne, @nombreCompleto, @documento, @programa, @ciclo, @correo, @telefono, @activo)
        `);
        const info = stmt.run({
            codigoCarne: estudiante.codigoCarne,
            nombreCompleto: estudiante.nombreCompleto,
            documento: estudiante.documento || null,
            programa: estudiante.programa || null,
            ciclo: estudiante.ciclo || null,
            correo: estudiante.correo || null,
            telefono: estudiante.telefono || null,
            activo: estudiante.activo === undefined ? 1 : (estudiante.activo ? 1 : 0)
        });
        return this.obtenerPorId(info.lastInsertRowid);
    },

    actualizar(id, estudiante) {
        db.prepare(`
            UPDATE estudiantes SET
                codigo_carne = @codigoCarne,
                nombre_completo = @nombreCompleto,
                documento = @documento,
                programa = @programa,
                ciclo = @ciclo,
                correo = @correo,
                telefono = @telefono,
                activo = @activo
            WHERE id = @id
        `).run({
            id,
            codigoCarne: estudiante.codigoCarne,
            nombreCompleto: estudiante.nombreCompleto,
            documento: estudiante.documento || null,
            programa: estudiante.programa || null,
            ciclo: estudiante.ciclo || null,
            correo: estudiante.correo || null,
            telefono: estudiante.telefono || null,
            activo: estudiante.activo ? 1 : 0
        });
        return this.obtenerPorId(id);
    },

    eliminar(id) {
        return db.prepare('DELETE FROM estudiantes WHERE id = ?').run(id);
    }
};

module.exports = EstudianteModel;
