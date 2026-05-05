const crypto = require('crypto');
const pool = require('../config/database');

// Token expiration time in seconds (default: 300 seconds = 5 minutes for debugging)
const TOKEN_EXPIRATION_SECONDS = process.env.TOKEN_EXPIRATION_SECONDS || 300;

async function registerUser(email, password, firstName, lastName) {
  try {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, created_at',
      [email, hashedPassword, firstName, lastName, 'user']
    );

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at
    };
  } catch (error) {
    throw new Error('User registration failed: ' + error.message);
  }
}

async function loginUser(email, password) {
  try {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1 AND password_hash = $2',
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    
    console.log('=== TOKEN CREATION ===');
    console.log('Token generated:', token);
    console.log('Token length:', token.length);
    console.log('Token type:', typeof token);
    
    // Store token in database with expiration time
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_SECONDS * 1000);
    console.log('Expiration time set to:', expiresAt.toISOString());
    
    const result2 = await pool.query(
      'INSERT INTO tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id, token, expires_at',
      [user.id, token, expiresAt]
    );

    console.log('=== TOKEN SAVED TO DB ===');
    console.log('Insert result rows:', result2.rows.length);
    if (result2.rows[0]) {
      console.log('Saved token:', result2.rows[0].token);
      console.log('Saved token length:', result2.rows[0].token.length);
      console.log('Tokens match:', result2.rows[0].token === token);
    }

    const tokenExpiresAt = result2.rows[0].expires_at;
    const expiresIn = Math.floor((new Date(tokenExpiresAt) - new Date()) / 1000); // seconds

    return {
      token,
      expiresIn, // seconds
      expiresAt: tokenExpiresAt,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    };
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
}

async function logout(token) {
  try {
    await pool.query('DELETE FROM tokens WHERE token = $1', [token]);
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    throw new Error('Logout failed: ' + error.message);
  }
}

function getTokenExpirationSeconds() {
  return TOKEN_EXPIRATION_SECONDS;
}

module.exports = {
  registerUser,
  loginUser,
  logout,
  getTokenExpirationSeconds
};
