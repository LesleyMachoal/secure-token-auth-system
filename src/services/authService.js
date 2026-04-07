const crypto = require('crypto');
const pool = require('../config/database');

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
    
    // Store token in a session or tokens table
    await pool.query(
      'INSERT INTO tokens (user_id, token) VALUES ($1, $2)',
      [user.id, token]
    );

    return {
      token,
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

module.exports = {
  registerUser,
  loginUser
};
