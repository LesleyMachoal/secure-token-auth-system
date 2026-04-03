# Secure Token Authentication System

## Project Overview
A secure token-based authentication system built with Express.js and PostgreSQL.

## Setup Instructions

### Prerequisites
- Node.js v18+ 
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/secure_token_db
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

Server will be available at `http://localhost:3000`

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Project Structure

```
secure-token-auth-system/
├── src/
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   ├── cors-config.js     # CORS configuration
│   │   └── database.js        # PostgreSQL connection
│   ├── controllers/
│   │   └── authController.js  # Request handlers
│   ├── routes/
│   │   └── authRoutes.js      # Route definitions
│   └── services/
│       └── authService.js     # Business logic
├── tests/
│   ├── api.test.js            # API unit tests
│   ├── integration.test.js    # Integration tests
│   └── testHelpers.js         # Test utilities
├── db/
│   └── setup.sql              # Database schema
├── server.js                  # Server entry point
├── package.json               # Dependencies
├── jest.config.js             # Jest configuration
├── .env                       # Environment variables
└── TEST_REPORT.md            # Test results
```

## API Endpoints

### Health Check
- **GET** `/` - Returns service status

### Authentication
- **POST** `/api/auth/register` - Register new user
  - Body: `{ email, password, firstName, lastName }`
- **POST** `/api/auth/login` - User login
  - Body: `{ email, password }`
  - Response: Returns authentication token
- **GET** `/api/auth/validate` - Validate token
- **GET** `/api/auth/profile` - Get user profile
- **GET** `/api/auth/status` - Auth service status

## Testing

### Test Suites
- **api.test.js** - Unit tests for all endpoints
- **integration.test.js** - Full authentication flow tests

### Test Coverage
- Line Coverage: 83.33%
- Branch Coverage: 83.33%
- Function Coverage: 80%
- Statement Coverage: 83.33%

### Test Categories
✅ 7 Unit Tests
✅ 5 Integration Tests
✅ 100% Endpoint Coverage
✅ Field Validation Tests
✅ Error Handling Tests

See [TEST_REPORT.md](./TEST_REPORT.md) for detailed test results.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Code Standards
- ESLint-compatible code style
- Async/await for asynchronous operations
- Error handling with try-catch
- Proper HTTP status codes and messages

## Security Considerations
- CORS protection enabled
- Input validation on all endpoints
- Error messages don't expose sensitive information
- PostgreSQL connection pooling for production

## Dependencies

### Production
- **express** - Web framework
- **pg** - PostgreSQL client
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development
- **jest** - Testing framework
- **supertest** - HTTP assertion library

## Future Enhancements
- [ ] JWT token implementation
- [ ] Password hashing (bcrypt)
- [ ] Database integration tests
- [ ] Rate limiting
- [ ] Authentication middleware
- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] OAuth2 integration

## License
ISC
