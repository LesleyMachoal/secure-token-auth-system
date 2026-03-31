const express = require('express');
const cors = require('./config/cors-config');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Secure Token Authentication System' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;