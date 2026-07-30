const EventoModel = require('../models/EventoModel');

const EventoController = {

    listar(req, res) {
        const { estado } = req.query;
        const eventos = estado ? EventoModel.obtenerPorEstado(estado) : EventoModel.obtenerTodos();
        res.json(eventos);
    },

    obtener(req, res) {
        const evento = EventoModel.obtenerPorId(req.params.id);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(evento);
    },

    crear(req, res) {
        const { nombre, fechaHoraInicio } = req.body;
        if (!nombre || !fechaHoraInicio) {
            return res.status(400).json({ error: 'nombre y fechaHoraInicio son obligatorios' });
        }
        const nuevo = EventoModel.crear(req.body);
        res.status(201).json(nuevo);
    },

    actualizar(req, res) {
        const existente = EventoModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Evento no encontrado' });
        const actualizado = EventoModel.actualizar(req.params.id, req.body);
        res.json(actualizado);
    },

    cambiarEstado(req, res) {
        const { estado } = req.body;
        const validos = ['PROGRAMADO', 'ACTIVO', 'CERRADO'];
        if (!validos.includes(estado)) {
            return res.status(400).json({ error: `estado debe ser uno de: ${validos.join(', ')}` });
        }
        const existente = EventoModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(EventoModel.cambiarEstado(req.params.id, estado));
    },

    eliminar(req, res) {
        const existente = EventoModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Evento no encontrado' });
        try {
            EventoModel.eliminar(req.params.id);
            res.status(204).send();
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return res.status(409).json({
                    error: 'No se puede eliminar: este evento ya tiene asistencia o registros externos guardados. Cambia su estado a CERRADO en su lugar para conservar el historial de auditoría.'
                });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = EventoController;
