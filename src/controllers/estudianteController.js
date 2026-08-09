const EstudianteModel = require('../models/EstudianteModel');

const EstudianteController = {

    async listar(req, res) {
        res.json(await EstudianteModel.obtenerTodos());
    },

    async obtener(req, res) {
        const estudiante = await EstudianteModel.obtenerPorId(req.params.id);
        if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });
        res.json(estudiante);
    },

    // GET /api/estudiantes/carne/:codigo -> usado por el escaner de la app
    async buscarPorCarne(req, res) {
        const estudiante = await EstudianteModel.obtenerPorCodigoCarne(req.params.codigo);
        if (!estudiante) return res.status(404).json({ error: 'No existe un estudiante con ese codigo de carne' });
        res.json(estudiante);
    },

    async crear(req, res) {
        const { codigoCarne, nombreCompleto } = req.body;
        if (!codigoCarne || !nombreCompleto) {
            return res.status(400).json({ error: 'codigoCarne y nombreCompleto son obligatorios' });
        }
        try {
            const nuevo = await EstudianteModel.crear(req.body);
            res.status(201).json(nuevo);
        } catch (err) {
            if (err.code === '23505') { // unique_violation en Postgres
                return res.status(409).json({ error: 'Ya existe un estudiante con ese codigo de carne' });
            }
            res.status(500).json({ error: err.message });
        }
    },

    async actualizar(req, res) {
        const existente = await EstudianteModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Estudiante no encontrado' });
        const actualizado = await EstudianteModel.actualizar(req.params.id, req.body);
        res.json(actualizado);
    },

    async eliminar(req, res) {
        const existente = await EstudianteModel.obtenerPorId(req.params.id);
        if (!existente) return res.status(404).json({ error: 'Estudiante no encontrado' });
        await EstudianteModel.eliminar(req.params.id);
        res.status(204).send();
    }
};

module.exports = EstudianteController;
