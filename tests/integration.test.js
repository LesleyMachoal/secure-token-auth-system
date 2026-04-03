const request = require('supertest');
const app = require('../src/app');

describe('Integration Tests - Authentication Flow', () => {
  
  describe('Complete User Journey', () => {
    const testUser = {
      email: 'integration@test.com',
      password: 'securePass123',
      firstName: 'Integration',
      lastName: 'Tester'
    };

    it('should complete full authentication flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body.user).toHaveProperty('id');
      expect(registerResponse.body.user.email).toBe(testUser.email);

      // Step 2: Login with registered user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      const token = loginResponse.body.token;

      // Step 3: Validate token
      const validateResponse = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(validateResponse.body).toHaveProperty('message');
    });

    it('should validate required fields on registration', async () => {
      const invalidUsers = [
        { password: 'pass123' }, // missing email
        { email: 'test@test.com' }, // missing password
        {} // missing both
      ];

      for (const invalidUser of invalidUsers) {
        await request(app)
          .post('/api/auth/register')
          .send(invalidUser)
          .expect(400);
      }
    });

    it('should not login with missing credentials', async () => {
      const invalidLogins = [
        { email: 'test@test.com' }, // missing password
        { password: 'pass123' }, // missing email
        {} // missing both
      ];

      for (const invalidLogin of invalidLogins) {
        await request(app)
          .post('/api/auth/login')
          .send(invalidLogin)
          .expect(400);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    it('should handle missing endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Route not found');
    });
  });
});
