const EventoModel = require('../models/EventoModel');

const EventoController = {

    async listar(req, res) {
        const { estado } = req.query;
        const eventos = estado ? await EventoModel.obtenerPorEstado(estado) : await EventoModel.obtenerTodos();
        res.json(eventos);
    },

    async obtener(req, res) {
        const evento = await EventoModel.obtenerPorId(req.params.id);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(evento);
    },

    async crear(req, res) {
        const { nombre, fechaHoraInicio } = req.body;
        if (!nombre || !fechaHoraInicio) {
            return res.status(400).json({ error: 'nombre y fechaHoraInicio son obligatorios' });
        }
        const nuevo = await EventoModel.crear(req.body);
        res.status(201).json(nuevo);
    },

    async actualizar(req, res) {
        const existente = await EventoModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Evento no encontrado' });
        const actualizado = await EventoModel.actualizar(req.params.id, req.body);
        res.json(actualizado);
    },

    async cambiarEstado(req, res) {
        const { estado } = req.body;
        const validos = ['PROGRAMADO', 'ACTIVO', 'CERRADO'];
        if (!validos.includes(estado)) {
            return res.status(400).json({ error: `estado debe ser uno de: ${validos.join(', ')}` });
        }
        const existente = await EventoModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(await EventoModel.cambiarEstado(req.params.id, estado));
    },

    async eliminar(req, res) {
        const existente = await EventoModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Evento no encontrado' });
        try {
            await EventoModel.eliminar(req.params.id);
            res.status(204).send();
        } catch (err) {
            if (err.code === '23503') { // foreign_key_violation en Postgres
                return res.status(409).json({
                    error: 'No se puede eliminar: este evento ya tiene asistencia o registros externos guardados. Cambia su estado a CERRADO en su lugar para conservar el historial de auditoría.'
                });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = EventoController;
