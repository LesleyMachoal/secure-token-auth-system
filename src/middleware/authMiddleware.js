function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer token"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // For now, we'll accept any token and create a mock user
  // In production, you would verify the token against stored tokens or JWT signature
  req.user = {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    token: token
  };

  next();
}

module.exports = {
  verifyToken
};
