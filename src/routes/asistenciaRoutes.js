const express = require('express');
const router = express.Router({ mergeParams: true });
const AsistenciaController = require('../controllers/asistenciaController');

router.get('/', AsistenciaController.listarPorEvento);
router.post('/escaneo', AsistenciaController.registrarPorEscaneo);
router.post('/datos', AsistenciaController.registrarPorDatos);

module.exports = router;
