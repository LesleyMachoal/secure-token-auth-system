/**
 * Test utilities and helpers for API testing
 */

const request = require('supertest');
const app = require('../src/app');

/**
 * Helper function to make API requests
 */
const apiRequest = {
  get: (path) => request(app).get(path),
  post: (path, data) => request(app).post(path).send(data),
  put: (path, data) => request(app).put(path).send(data),
  delete: (path) => request(app).delete(path)
};

/**
 * Test user factory for consistent test data
 */
const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'testPassword123',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});

/**
 * Assert response structure
 */
const assertResponseStructure = (response, expectedFields) => {
  expectedFields.forEach(field => {
    expect(response.body).toHaveProperty(field);
  });
};

/**
 * Assert authentication response
 */
const assertAuthResponse = (response, hasToken = false) => {
  if (hasToken) {
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  }
  expect(response.body).toHaveProperty('user');
};

/**
 * Assert error response
 */
const assertErrorResponse = (response, statusCode, errorMessage = null) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('error');
  if (errorMessage) {
    expect(response.body.error).toContain(errorMessage);
  }
};

module.exports = {
  apiRequest,
  createTestUser,
  assertResponseStructure,
  assertAuthResponse,
  assertErrorResponse
};
