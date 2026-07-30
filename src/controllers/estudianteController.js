const EstudianteModel = require('../models/EstudianteModel');

const EstudianteController = {

    listar(req, res) {
        res.json(EstudianteModel.obtenerTodos());
    },

    obtener(req, res) {
        const estudiante = EstudianteModel.obtenerPorId(req.params.id);
        if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });
        res.json(estudiante);
    },

    // GET /api/estudiantes/carne/:codigo -> usado por el escaner de la app
    buscarPorCarne(req, res) {
        const estudiante = EstudianteModel.obtenerPorCodigoCarne(req.params.codigo);
        if (!estudiante) return res.status(404).json({ error: 'No existe un estudiante con ese codigo de carne' });
        res.json(estudiante);
    },

    crear(req, res) {
        const { codigoCarne, nombreCompleto } = req.body;
        if (!codigoCarne || !nombreCompleto) {
            return res.status(400).json({ error: 'codigoCarne y nombreCompleto son obligatorios' });
        }
        try {
            const nuevo = EstudianteModel.crear(req.body);
            res.status(201).json(nuevo);
        } catch (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'Ya existe un estudiante con ese codigo de carne' });
            }
            res.status(500).json({ error: err.message });
        }
    },

    actualizar(req, res) {
        const existente = EstudianteModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Estudiante no encontrado' });
        const actualizado = EstudianteModel.actualizar(req.params.id, req.body);
        res.json(actualizado);
    },

    eliminar(req, res) {
        const existente = EstudianteModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Estudiante no encontrado' });
        EstudianteModel.eliminar(req.params.id);
        res.status(204).send();
    }
};

module.exports = EstudianteController;
