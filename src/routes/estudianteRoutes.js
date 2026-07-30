const express = require('express');
const router = express.Router();
const EstudianteController = require('../controllers/estudianteController');

router.get('/', EstudianteController.listar);
router.get('/carne/:codigo', EstudianteController.buscarPorCarne);
router.get('/:id', EstudianteController.obtener);
router.post('/', EstudianteController.crear);
router.put('/:id', EstudianteController.actualizar);
router.delete('/:id', EstudianteController.eliminar);

module.exports = router;
