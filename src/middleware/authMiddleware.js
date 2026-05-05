const pool = require('../config/database');

async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer token"

  if (!token) {
    console.log('No token provided in Authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('=== TOKEN VERIFICATION DEBUG ===');
    console.log('Token from header:', token);
    console.log('Token length:', token.length);
    console.log('Token type:', typeof token);
    console.log('Token first 20 chars:', token.substring(0, 20));
    
    // Query the database to verify the token and get user info
    // Also check if token has expired
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, t.id as token_id, t.token, t.expires_at, t.created_at
       FROM tokens t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.token = $1`,
      [token]
    );

    console.log('Database query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('Token not found in database');
      
      // Try to find any tokens to debug
      const allTokens = await pool.query('SELECT id, user_id, token FROM tokens ORDER BY created_at DESC LIMIT 5');
      console.log('Recent tokens in database:');
      allTokens.rows.forEach(row => {
        console.log(`  ID: ${row.id}, User: ${row.user_id}, Token: ${row.token.substring(0, 20)}..., Matches: ${row.token === token}`);
      });
      
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = result.rows[0];
    console.log('Token found - ID:', user.token_id);
    console.log('Stored token:', user.token);
    console.log('Stored token length:', user.token.length);
    console.log('Tokens match exactly:', user.token === token);
    
    const expiresAt = new Date(user.expires_at);
    const now = new Date();
    const secondsLeft = Math.floor((expiresAt - now) / 1000);

    console.log('Expires at:', expiresAt.toISOString());
    console.log('Current time:', now.toISOString());
    console.log('Seconds remaining:', secondsLeft);

    // Check if token has expired
    if (now > expiresAt) {
      console.log('Token has expired');
      // Delete expired token from database
      await pool.query('DELETE FROM tokens WHERE token = $1', [token]);
      return res.status(401).json({ error: 'Token has expired' });
    }

    if (secondsLeft < 0) {
      console.log('Negative seconds remaining, token is expired');
      return res.status(401).json({ error: 'Token has expired' });
    }

    console.log('✓ Token is VALID');
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };
    // Include time remaining until expiration
    req.tokenExpiresAt = expiresAt;
    req.tokenExpiresIn = secondsLeft;

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Token verification failed: ' + error.message });
  }
}

// Function to clean up expired tokens (call periodically)
async function cleanupExpiredTokens() {
  try {
    const result = await pool.query(
      'DELETE FROM tokens WHERE expires_at < NOW()'
    );
    console.log(`Cleaned up ${result.rowCount} expired tokens`);
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error.message);
  }
}

module.exports = {
  verifyToken,
  cleanupExpiredTokens
};
