const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.registerUser(email, password, firstName || '', lastName || '');
    res.status(201).json({ 
      message: 'User registered successfully', 
      user 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('=== LOGIN DEBUG ===');
    console.log('Login attempt for email:', email);
    
    const result = await authService.loginUser(email, password);
    
    console.log('Login successful');
    console.log('Token:', result.token.substring(0, 20) + '...');
    console.log('Expires in:', result.expiresIn, 'seconds');
    console.log('Expires at:', result.expiresAt);
    
    res.status(200).json({ 
      message: 'Login successful', 
      token: result.token,
      expiresIn: result.expiresIn,
      expiresAt: result.expiresAt,
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
}

function validate(req, res) {
  res.status(200).json({ 
    message: 'Token is valid', 
    expiresIn: req.tokenExpiresIn,
    expiresAt: req.tokenExpiresAt,
    user: req.user 
  });
}

function profile(req, res) {
  res.status(200).json({ 
    message: 'User profile retrieved', 
    user: {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    }
  });
}

async function logout(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const result = await authService.logout(token);
    res.status(200).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  register,
  login,
  validate,
  profile,
  logout
};