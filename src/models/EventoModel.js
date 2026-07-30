const db = require('../config/db');

const EventoModel = {

    obtenerTodos() {
        return db.prepare('SELECT * FROM eventos ORDER BY fecha_hora_inicio DESC').all();
    },

    obtenerPorId(id) {
        return db.prepare('SELECT * FROM eventos WHERE id = ?').get(id);
    },

    obtenerPorEstado(estado) {
        return db.prepare('SELECT * FROM eventos WHERE estado = ? ORDER BY fecha_hora_inicio').all(estado);
    },

    crear(evento) {
        const stmt = db.prepare(`
            INSERT INTO eventos (nombre, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar, responsable, cupo_maximo, estado)
            VALUES (@nombre, @descripcion, @fechaHoraInicio, @fechaHoraFin, @lugar, @responsable, @cupoMaximo, @estado)
        `);
        const info = stmt.run({
            nombre: evento.nombre,
            descripcion: evento.descripcion || null,
            fechaHoraInicio: evento.fechaHoraInicio,
            fechaHoraFin: evento.fechaHoraFin || null,
            lugar: evento.lugar || null,
            responsable: evento.responsable || null,
            cupoMaximo: evento.cupoMaximo || 0,
            estado: evento.estado || 'PROGRAMADO'
        });
        return this.obtenerPorId(info.lastInsertRowid);
    },

    actualizar(id, evento) {
        db.prepare(`
            UPDATE eventos SET
                nombre = @nombre,
                descripcion = @descripcion,
                fecha_hora_inicio = @fechaHoraInicio,
                fecha_hora_fin = @fechaHoraFin,
                lugar = @lugar,
                responsable = @responsable,
                cupo_maximo = @cupoMaximo,
                estado = @estado
            WHERE id = @id
        `).run({
            id,
            nombre: evento.nombre,
            descripcion: evento.descripcion || null,
            fechaHoraInicio: evento.fechaHoraInicio,
            fechaHoraFin: evento.fechaHoraFin || null,
            lugar: evento.lugar || null,
            responsable: evento.responsable || null,
            cupoMaximo: evento.cupoMaximo || 0,
            estado: evento.estado
        });
        return this.obtenerPorId(id);
    },

    cambiarEstado(id, estado) {
        db.prepare('UPDATE eventos SET estado = ? WHERE id = ?').run(estado, id);
        return this.obtenerPorId(id);
    },

    eliminar(id) {
        return db.prepare('DELETE FROM eventos WHERE id = ?').run(id);
    }
};

module.exports = EventoModel;
