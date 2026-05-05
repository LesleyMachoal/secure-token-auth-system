const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const pool = require('../config/database');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/validate', verifyToken, authController.validate);
router.get('/profile', verifyToken, authController.profile);
router.post('/logout', verifyToken, authController.logout);
router.get('/status', (req, res) => {
  res.json({ message: 'Auth service is running' });
});

// Debug endpoint - lists all active tokens
router.get('/debug/tokens', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.user_id, u.email, t.token, t.created_at, t.expires_at, 
              NOW() as current_time,
              (expires_at > NOW()) as is_valid
       FROM tokens t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT 20`
    );
    
    res.json({
      message: 'Active tokens (last 20)',
      count: result.rows.length,
      tokens: result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        email: row.email,
        token: row.token.substring(0, 20) + '...',
        fullToken: row.token,
        created_at: row.created_at,
        expires_at: row.expires_at,
        current_time: row.current_time,
        is_valid: row.is_valid,
        seconds_remaining: Math.floor((new Date(row.expires_at) - new Date(row.current_time)) / 1000)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
