const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// get pdf
router.get('/pdf', auth, reportController.generatePdf);

module.exports = router;
