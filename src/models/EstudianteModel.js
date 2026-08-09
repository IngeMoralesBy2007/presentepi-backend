const { pool } = require('../config/db');

const EstudianteModel = {

    async obtenerTodos() {
        const { rows } = await pool.query('SELECT * FROM estudiantes ORDER BY nombre_completo');
        return rows;
    },

    async obtenerPorId(id) {
        const { rows } = await pool.query('SELECT * FROM estudiantes WHERE id = $1', [id]);
        return rows[0] || null;
    },

    // Usado al escanear el codigo de barras del carne
    async obtenerPorCodigoCarne(codigoCarne) {
        const { rows } = await pool.query('SELECT * FROM estudiantes WHERE codigo_carne = $1', [codigoCarne]);
        return rows[0] || null;
    },

    // Usado en el flujo de lectura de datos impresos del carne (OCR),
    // cuando no hay codigo de barras pre-registrado.
    async obtenerPorDocumento(documento) {
        const { rows } = await pool.query('SELECT * FROM estudiantes WHERE documento = $1', [documento]);
        return rows[0] || null;
    },

    async crear(estudiante) {
        const { rows } = await pool.query(
            `INSERT INTO estudiantes (codigo_carne, nombre_completo, documento, programa, ciclo, correo, telefono, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                estudiante.codigoCarne,
                estudiante.nombreCompleto,
                estudiante.documento || null,
                estudiante.programa || null,
                estudiante.ciclo || null,
                estudiante.correo || null,
                estudiante.telefono || null,
                estudiante.activo === undefined ? true : !!estudiante.activo
            ]
        );
        return rows[0];
    },

    async actualizar(id, estudiante) {
        const { rows } = await pool.query(
            `UPDATE estudiantes SET
                codigo_carne = $1,
                nombre_completo = $2,
                documento = $3,
                programa = $4,
                ciclo = $5,
                correo = $6,
                telefono = $7,
                activo = $8
             WHERE id = $9
             RETURNING *`,
            [
                estudiante.codigoCarne,
                estudiante.nombreCompleto,
                estudiante.documento || null,
                estudiante.programa || null,
                estudiante.ciclo || null,
                estudiante.correo || null,
                estudiante.telefono || null,
                !!estudiante.activo,
                id
            ]
        );
        return rows[0] || null;
    },

    async eliminar(id) {
        return pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
    }
};

module.exports = EstudianteModel;
