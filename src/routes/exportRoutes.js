const express = require('express');
const router = express.Router({ mergeParams: true });
const ExportController = require('../controllers/exportController');

router.get('/excel', ExportController.exportarExcel);

module.exports = router;
