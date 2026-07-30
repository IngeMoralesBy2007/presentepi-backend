const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/eventoController');
const asistenciaRoutes = require('./asistenciaRoutes');
const registroExternoRoutes = require('./registroExternoRoutes');
const exportRoutes = require('./exportRoutes');

router.get('/', EventoController.listar);
router.get('/:id', EventoController.obtener);
router.post('/', EventoController.crear);
router.put('/:id', EventoController.actualizar);
router.patch('/:id/estado', EventoController.cambiarEstado);
router.delete('/:id', EventoController.eliminar);

// Rutas anidadas: /api/eventos/:eventoId/asistencias, /externos, /export
router.use('/:eventoId/asistencias', asistenciaRoutes);
router.use('/:eventoId/externos', registroExternoRoutes);
router.use('/:eventoId/export', exportRoutes);

module.exports = router;
