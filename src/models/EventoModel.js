const { pool } = require('../config/db');

const EventoModel = {

    async obtenerTodos() {
        const { rows } = await pool.query('SELECT * FROM eventos ORDER BY fecha_hora_inicio DESC');
        return rows;
    },

    async obtenerPorId(id) {
        const { rows } = await pool.query('SELECT * FROM eventos WHERE id = $1', [id]);
        return rows[0] || null;
    },

    async obtenerPorEstado(estado) {
        const { rows } = await pool.query('SELECT * FROM eventos WHERE estado = $1 ORDER BY fecha_hora_inicio', [estado]);
        return rows;
    },

    // Usado por el modulo de Consultas: filtros combinables por sede, nombre y rango de fechas.
    // La fecha se compara solo por los primeros 10 caracteres (YYYY-MM-DD) para que
    // funcione sin importar si el separador guardado es espacio o "T".
    async buscarConFiltros({ sede, nombre, fechaDesde, fechaHasta } = {}) {
        const condiciones = [];
        const valores = [];

        if (sede) {
            valores.push(`%${sede}%`);
            condiciones.push(`sede ILIKE $${valores.length}`);
        }
        if (nombre) {
            valores.push(`%${nombre}%`);
            condiciones.push(`nombre ILIKE $${valores.length}`);
        }
        if (fechaDesde) {
            valores.push(fechaDesde);
            condiciones.push(`SUBSTRING(fecha_hora_inicio, 1, 10) >= $${valores.length}`);
        }
        if (fechaHasta) {
            valores.push(fechaHasta);
            condiciones.push(`SUBSTRING(fecha_hora_inicio, 1, 10) <= $${valores.length}`);
        }

        const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
        const { rows } = await pool.query(
            `SELECT * FROM eventos ${where} ORDER BY fecha_hora_inicio DESC`,
            valores
        );
        return rows;
    },

    async crear(evento) {
        const { rows } = await pool.query(
            `INSERT INTO eventos (nombre, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar, sede, responsable, cupo_maximo, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                evento.nombre,
                evento.descripcion || null,
                evento.fechaHoraInicio,
                evento.fechaHoraFin || null,
                evento.lugar || null,
                evento.sede || null,
                evento.responsable || null,
                evento.cupoMaximo || 0,
                evento.estado || 'PROGRAMADO'
            ]
        );
        return rows[0];
    },

    async actualizar(id, evento) {
        const { rows } = await pool.query(
            `UPDATE eventos SET
                nombre = $1,
                descripcion = $2,
                fecha_hora_inicio = $3,
                fecha_hora_fin = $4,
                lugar = $5,
                sede = $6,
                responsable = $7,
                cupo_maximo = $8,
                estado = $9
             WHERE id = $10
             RETURNING *`,
            [
                evento.nombre,
                evento.descripcion || null,
                evento.fechaHoraInicio,
                evento.fechaHoraFin || null,
                evento.lugar || null,
                evento.sede || null,
                evento.responsable || null,
                evento.cupoMaximo || 0,
                evento.estado,
                id
            ]
        );
        return rows[0] || null;
    },

    async cambiarEstado(id, estado) {
        const { rows } = await pool.query('UPDATE eventos SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
        return rows[0] || null;
    },

    async eliminar(id) {
        return pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    }
};

module.exports = EventoModel;
