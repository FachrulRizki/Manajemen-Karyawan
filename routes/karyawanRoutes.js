const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const karyawanController = require('../controllers/karyawanController');

// route auth middleware
router.use(auth);

router.get('/',    karyawanController.getAll);
router.get('/:id', karyawanController.getById);
router.post('/',   karyawanController.create);
router.put('/:id', karyawanController.update);
router.delete('/:id', karyawanController.remove);

module.exports = router;
