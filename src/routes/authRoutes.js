const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/validate', verifyToken, authController.validate);
router.get('/profile', verifyToken, authController.profile);
router.get('/status', (req, res) => {
  res.json({ message: 'Auth service is running' });
});

module.exports = router;
