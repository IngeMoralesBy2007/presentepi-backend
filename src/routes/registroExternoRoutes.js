const express = require('express');
const router = express.Router({ mergeParams: true });
const RegistroExternoController = require('../controllers/registroExternoController');

router.get('/', RegistroExternoController.listarPorEvento);
router.post('/', RegistroExternoController.registrar);

module.exports = router;
