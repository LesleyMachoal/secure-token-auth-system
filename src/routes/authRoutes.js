const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/validate', authController.validate);
router.get('/profile', authController.profile);
router.get('/status', (req, res) => {
  res.json({ message: 'Auth service is running' });
});

module.exports = router;
