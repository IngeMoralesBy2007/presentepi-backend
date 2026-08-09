const RegistroExternoModel = require('../models/RegistroExternoModel');
const EventoModel = require('../models/EventoModel');
const AsistenciaModel = require('../models/AsistenciaModel');

const RegistroExternoController = {

    async listarPorEvento(req, res) {
        const evento = await EventoModel.obtenerPorId(req.params.eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(await RegistroExternoModel.obtenerPorEvento(req.params.eventoId));
    },

    // POST /api/eventos/:eventoId/externos  body: { nombreCompleto, documento, correo, telefono, procedencia }
    async registrar(req, res) {
        const { eventoId } = req.params;
        const { nombreCompleto } = req.body;

        if (!nombreCompleto) {
            return res.status(400).json({ error: 'nombreCompleto es obligatorio' });
        }

        const evento = await EventoModel.obtenerPorId(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        if (evento.estado !== 'ACTIVO') {
            return res.status(409).json({ error: 'El evento no esta activo, no se puede registrar asistencia' });
        }

        if (evento.cupo_maximo > 0) {
            const [totalAsistencias, totalExternos] = await Promise.all([
                AsistenciaModel.contarPorEvento(eventoId),
                RegistroExternoModel.contarPorEvento(eventoId)
            ]);
            if (totalAsistencias + totalExternos >= evento.cupo_maximo) {
                return res.status(409).json({ error: `Se alcanzo el cupo maximo del evento (${evento.cupo_maximo})` });
            }
        }

        const registro = await RegistroExternoModel.registrar({ eventoId, ...req.body });
        res.status(201).json(registro);
    }
};

module.exports = RegistroExternoController;
