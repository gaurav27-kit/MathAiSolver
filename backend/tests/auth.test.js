/**
 * tests/auth.test.js
 * Test suite for authentication endpoints
 */

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('../routes/auth');
const { attachUser } = require('../middleware/auth');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(attachUser);
  app.use('/api/auth', authRouter);
  return app;
}

describe('Authentication Endpoints', () => {
  let app;
  let testUser;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
    app = createTestApp();
    
    testUser = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.fullName).toBe(testUser.fullName);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject registration with missing fullName', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: testUser.email, password: testUser.password })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation failed.');
      expect(res.body.errors[0]).toContain('"fullName" is required');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation failed.');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: '12345' })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation failed.');
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Duplicate registration
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password })
        .expect(401);

      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation failed.');
    });
  });

  describe('GET /api/auth/me', () => {
    let sessionCookie;

    beforeEach(async () => {
      // Register and login to get session cookie
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      sessionCookie = res.headers['set-cookie'][0];
    });

    it('should return current user when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.message).toContain('log in');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body.message).toContain('Logged out');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
