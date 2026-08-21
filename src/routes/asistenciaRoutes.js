const express = require('express');
const router = express.Router({ mergeParams: true });
const AsistenciaController = require('../controllers/asistenciaController');

router.get('/', AsistenciaController.listarPorEvento);
router.post('/datos', AsistenciaController.registrarPorDatos);
router.delete('/:id', AsistenciaController.eliminar);

module.exports = router;
