require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/database');
const { cleanupExpiredTokens } = require('./src/middleware/authMiddleware');

const PORT = process.env.PORT || 3000;

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✓ Database connected successfully');
  }
});

// Schedule token cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
// Run cleanup on startup
cleanupExpiredTokens();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
