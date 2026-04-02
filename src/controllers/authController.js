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

    const result = await authService.loginUser(email, password);
    res.status(200).json({ 
      message: 'Login successful', 
      token: result.token,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

function validate(req, res) {
  res.status(200).json({ 
    message: 'Token is valid', 
    user: req.user 
  });
}

function profile(req, res) {
  res.status(200).json({ 
    message: 'User profile retrieved', 
    user: req.user 
  });
}

module.exports = {
  register,
  login,
  validate,
  profile
};