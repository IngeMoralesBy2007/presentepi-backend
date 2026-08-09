const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/reporteController');

router.get('/eventos', ReporteController.consultarEventos);
router.get('/export', ReporteController.exportarExcel);

module.exports = router;
