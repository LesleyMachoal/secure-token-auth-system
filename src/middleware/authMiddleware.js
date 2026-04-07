const pool = require('../config/database');

async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer token"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Query the database to verify the token and get user info
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name 
       FROM tokens t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = result.rows[0];
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Token verification failed: ' + error.message });
  }
}

module.exports = {
  verifyToken
};
