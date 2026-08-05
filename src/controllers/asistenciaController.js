const AsistenciaModel = require('../models/AsistenciaModel');
const EstudianteModel = require('../models/EstudianteModel');
const EventoModel = require('../models/EventoModel');
const RegistroExternoModel = require('../models/RegistroExternoModel');

const AsistenciaController = {

    listarPorEvento(req, res) {
        const evento = EventoModel.obtenerPorId(req.params.eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(AsistenciaModel.obtenerPorEvento(req.params.eventoId));
    },

    // POST /api/eventos/:eventoId/asistencias/escaneo  body: { codigoCarne }
    registrarPorEscaneo(req, res) {
        const { eventoId } = req.params;
        const { codigoCarne } = req.body;

        if (!codigoCarne) {
            return res.status(400).json({ error: 'codigoCarne es obligatorio' });
        }

        const evento = EventoModel.obtenerPorId(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        if (evento.estado !== 'ACTIVO') {
            return res.status(409).json({ error: 'El evento no esta activo, no se puede registrar asistencia' });
        }

        if (evento.cupo_maximo > 0) {
            const totalActual = AsistenciaModel.contarPorEvento(eventoId) + RegistroExternoModel.contarPorEvento(eventoId);
            if (totalActual >= evento.cupo_maximo) {
                return res.status(409).json({ error: `Se alcanzo el cupo maximo del evento (${evento.cupo_maximo})` });
            }
        }

        const estudiante = EstudianteModel.obtenerPorCodigoCarne(codigoCarne);
        if (!estudiante) {
            return res.status(404).json({ error: 'No existe un estudiante con ese codigo de carne' });
        }

        if (AsistenciaModel.yaRegistrado(eventoId, estudiante.id)) {
            return res.status(409).json({ error: 'El estudiante ya tiene asistencia registrada en este evento', estudiante });
        }

        const asistencia = AsistenciaModel.registrar({
            eventoId,
            estudianteId: estudiante.id,
            codigoCarneEscaneado: codigoCarne,
            nombreCompletoSnapshot: estudiante.nombre_completo,
            programaSnapshot: estudiante.programa
        });

        res.status(201).json({ asistencia, estudiante });
    },

    // POST /api/eventos/:eventoId/asistencias/datos  body: { nombreCompleto, documento, programa }
    // Usado cuando se leen los datos impresos del carne (OCR) en vez del codigo de barras.
    // Si el documento ya existe, reutiliza ese estudiante; si no, lo crea en el momento.
    registrarPorDatos(req, res) {
        const { eventoId } = req.params;
        const { nombreCompleto, documento, programa } = req.body;

        if (!nombreCompleto || !documento) {
            return res.status(400).json({ error: 'nombreCompleto y documento son obligatorios' });
        }

        const evento = EventoModel.obtenerPorId(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        if (evento.estado !== 'ACTIVO') {
            return res.status(409).json({ error: 'El evento no esta activo, no se puede registrar asistencia' });
        }

        if (evento.cupo_maximo > 0) {
            const totalActual = AsistenciaModel.contarPorEvento(eventoId) + RegistroExternoModel.contarPorEvento(eventoId);
            if (totalActual >= evento.cupo_maximo) {
                return res.status(409).json({ error: `Se alcanzo el cupo maximo del evento (${evento.cupo_maximo})` });
            }
        }

        let estudiante = EstudianteModel.obtenerPorDocumento(documento);
        if (!estudiante) {
            try {
                estudiante = EstudianteModel.crear({
                    codigoCarne: documento, // sin codigo de barras leido: el documento hace de identificador unico
                    nombreCompleto,
                    documento,
                    programa: programa || null
                });
            } catch (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Ya existe un registro con ese documento/codigo. Verifica el numero leido.' });
                }
                throw err;
            }
        }

        if (AsistenciaModel.yaRegistrado(eventoId, estudiante.id)) {
            return res.status(409).json({ error: 'El estudiante ya tiene asistencia registrada en este evento', estudiante });
        }

        const asistencia = AsistenciaModel.registrar({
            eventoId,
            estudianteId: estudiante.id,
            codigoCarneEscaneado: estudiante.codigo_carne,
            nombreCompletoSnapshot: estudiante.nombre_completo,
            programaSnapshot: estudiante.programa
        });

        res.status(201).json({ asistencia, estudiante });
    }
};

module.exports = AsistenciaController;
