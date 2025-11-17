const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.post('/login', authController.login);
router.post('/register', authController.register);

// Routes protégées
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
