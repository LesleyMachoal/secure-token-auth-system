const request = require('supertest');
const app = require('../src/app');

describe('Authentication System API', () => {
  
  describe('GET /', () => {
    it('should return health check message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Secure Token Authentication System');
    });
  });

  describe('GET /api/auth/status', () => {
    it('should return auth service status', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Auth service is running');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail without email and password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
    });

    it('should fail without credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/undefined-route')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Route not found');
    });
  });
});
