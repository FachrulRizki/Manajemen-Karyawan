const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login — tidak menggunakan auth middleware
router.post('/login', authController.login);

module.exports = router;
