const AsistenciaModel = require('../models/AsistenciaModel');
const EstudianteModel = require('../models/EstudianteModel');
const EventoModel = require('../models/EventoModel');
const RegistroExternoModel = require('../models/RegistroExternoModel');

const AsistenciaController = {

    async listarPorEvento(req, res) {
        const evento = await EventoModel.obtenerPorId(req.params.eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(await AsistenciaModel.obtenerPorEvento(req.params.eventoId));
    },

    // POST /api/eventos/:eventoId/asistencias/datos  body: { nombreCompleto, documento, programa, rol }
    // Usado al leer los datos impresos del carne (foto / reconocimiento de texto).
    // Si el documento ya existe, reutiliza ese registro; si no, lo crea en el momento.
    async registrarPorDatos(req, res) {
        const { eventoId } = req.params;
        const { nombreCompleto, documento, programa, rol } = req.body;

        const ROLES_VALIDOS = ['ESTUDIANTE', 'DOCENTE', 'PERSONAL_ADMINISTRATIVO', 'OTRO'];

        if (!nombreCompleto || !documento) {
            return res.status(400).json({ error: 'nombreCompleto y documento son obligatorios' });
        }
        if (!rol || !ROLES_VALIDOS.includes(rol)) {
            return res.status(400).json({ error: `rol es obligatorio y debe ser uno de: ${ROLES_VALIDOS.join(', ')}` });
        }

        const evento = await EventoModel.obtenerPorId(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
        if (evento.estado !== 'ACTIVO') {
            return res.status(409).json({ error: 'El evento no esta activo, no se puede registrar asistencia' });
        }

        if (evento.cupo_maximo > 0) {
            const totalActual = (await AsistenciaModel.contarPorEvento(eventoId)) + (await RegistroExternoModel.contarPorEvento(eventoId));
            if (totalActual >= evento.cupo_maximo) {
                return res.status(409).json({ error: `Se alcanzo el cupo maximo del evento (${evento.cupo_maximo})` });
            }
        }

        let estudiante = await EstudianteModel.obtenerPorDocumento(documento);
        if (!estudiante) {
            try {
                estudiante = await EstudianteModel.crear({
                    codigoCarne: documento, // identificador unico: el documento leido de los datos del carne
                    nombreCompleto,
                    documento,
                    programa: programa || null
                });
            } catch (err) {
                if (err.code === '23505') { // unique_violation en Postgres
                    return res.status(409).json({ error: 'Ya existe un registro con ese documento. Verifica el numero leido.' });
                }
                throw err;
            }
        }

        if (await AsistenciaModel.yaRegistrado(eventoId, estudiante.id)) {
            return res.status(409).json({ error: 'Esta persona ya tiene asistencia registrada en este evento', estudiante });
        }

        const asistencia = await AsistenciaModel.registrar({
            eventoId,
            estudianteId: estudiante.id,
            codigoCarneEscaneado: estudiante.codigo_carne,
            nombreCompletoSnapshot: estudiante.nombre_completo,
            programaSnapshot: estudiante.programa,
            rol
        });

        res.status(201).json({ asistencia, estudiante });
    }
};

module.exports = AsistenciaController;
