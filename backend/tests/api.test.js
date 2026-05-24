/**
 * tests/api.test.js
 * Test suite for history, progress, and gamification endpoints
 */

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('../routes/auth');
const historyRouter = require('../routes/history');
const progressRouter = require('../routes/progress');
const gamificationRouter = require('../routes/gamification');
const { attachUser } = require('../middleware/auth');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(attachUser);
  app.use('/api/auth', authRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/gamification', gamificationRouter);
  return app;
}

describe('API Endpoints', () => {
  let app;
  let sessionCookie;
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

    // Register and get session cookie
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    sessionCookie = res.headers['set-cookie'][0];
  });

  describe('History Endpoints', () => {
    describe('POST /api/history', () => {
      it('should save history entry successfully', async () => {
        const historyEntry = {
          section: 'algebra',
          question: '2x + 5 = 15',
          answer: 'x = 5',
        };

        const res = await request(app)
          .post('/api/history')
          .set('Cookie', sessionCookie)
          .send(historyEntry)
          .expect(201);

        expect(res.body.message).toContain('saved');
      });

      it('should reject history without authentication', async () => {
        const historyEntry = {
          section: 'algebra',
          question: '2x + 5 = 15',
          answer: 'x = 5',
        };

        await request(app)
          .post('/api/history')
          .send(historyEntry)
          .expect(401);
      });

      it('should reject history with missing fields', async () => {
        const res = await request(app)
          .post('/api/history')
          .set('Cookie', sessionCookie)
          .send({ section: 'algebra' })
          .expect(400);

        expect(res.body).toHaveProperty('message', 'Validation failed.');
      });

      it('should reject history with too long question', async () => {
        const res = await request(app)
          .post('/api/history')
          .set('Cookie', sessionCookie)
          .send({
            section: 'algebra',
            question: 'x'.repeat(4001),
            answer: 'y',
          })
          .expect(400);

        expect(res.body).toHaveProperty('message', 'Validation failed.');
      });
    });

    describe('GET /api/history', () => {
      beforeEach(async () => {
        // Add some history entries
        await request(app)
          .post('/api/history')
          .set('Cookie', sessionCookie)
          .send({
            section: 'algebra',
            question: '2x + 5 = 15',
            answer: 'x = 5',
          });

        await request(app)
          .post('/api/history')
          .set('Cookie', sessionCookie)
          .send({
            section: 'calculus',
            question: 'd/dx(x^2)',
            answer: '2x',
          });
      });

      it('should fetch user history successfully', async () => {
        const res = await request(app)
          .get('/api/history')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body).toHaveProperty('history');
        expect(Array.isArray(res.body.history)).toBe(true);
        expect(res.body.history.length).toBe(2);
      });

      it('should reject unauthenticated requests', async () => {
        await request(app)
          .get('/api/history')
          .expect(401);
      });
    });
  });

  describe('Progress Endpoints', () => {
    describe('POST /api/progress', () => {
      it('should save progress successfully', async () => {
        const progress = {
          currentSection: 'algebra',
          lastQuestion: '2x + 5 = 15',
        };

        const res = await request(app)
          .post('/api/progress')
          .set('Cookie', sessionCookie)
          .send(progress)
          .expect(200);

        expect(res.body.message).toContain('saved');
      });

      it('should update existing progress', async () => {
        // Save initial progress
        await request(app)
          .post('/api/progress')
          .set('Cookie', sessionCookie)
          .send({
            currentSection: 'algebra',
            lastQuestion: 'question 1',
          });

        // Update progress
        const res = await request(app)
          .post('/api/progress')
          .set('Cookie', sessionCookie)
          .send({
            currentSection: 'calculus',
            lastQuestion: 'question 2',
          })
          .expect(200);

        expect(res.body.message).toContain('saved');
      });

      it('should reject progress without authentication', async () => {
        await request(app)
          .post('/api/progress')
          .send({ currentSection: 'algebra' })
          .expect(401);
      });
    });

    describe('GET /api/progress', () => {
      it('should return null for new user', async () => {
        const res = await request(app)
          .get('/api/progress')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.progress).toBeNull();
      });

      it('should fetch saved progress', async () => {
        // Save progress first
        await request(app)
          .post('/api/progress')
          .set('Cookie', sessionCookie)
          .send({
            currentSection: 'algebra',
            lastQuestion: 'test question',
          });

        const res = await request(app)
          .get('/api/progress')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.progress).toBeDefined();
        expect(res.body.progress.currentSection).toBe('algebra');
      });
    });
  });

  describe('Gamification Endpoints', () => {
    describe('GET /api/gamification', () => {
      it('should return default stats for new user', async () => {
        const res = await request(app)
          .get('/api/gamification')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.gamification).toBeDefined();
        expect(res.body.gamification.points).toBe(0);
        expect(res.body.gamification.streak).toBe(0);
        expect(res.body.gamification.level).toBe('Beginner');
      });
    });

    describe('POST /api/gamification/solve', () => {
      it('should award points for solving', async () => {
        const res = await request(app)
          .post('/api/gamification/solve')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.gamification.points).toBe(10);
        expect(res.body.gamification.streak).toBe(1);
        expect(res.body.gamification.todaySolves).toBe(1);
      });

      it('should increment streak on consecutive days', async () => {
        // First solve
        await request(app)
          .post('/api/gamification/solve')
          .set('Cookie', sessionCookie);

        // Second solve (same day)
        const res = await request(app)
          .post('/api/gamification/solve')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.gamification.points).toBe(20);
        expect(res.body.gamification.todaySolves).toBe(2);
      });
    });

    describe('GET /api/gamification/badges', () => {
      it('should return all badges with unlock status', async () => {
        const res = await request(app)
          .get('/api/gamification/badges')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.badges).toBeDefined();
        expect(Array.isArray(res.body.badges)).toBe(true);
        expect(res.body.badges.length).toBeGreaterThan(0);
        expect(res.body.badges[0]).toHaveProperty('id');
        expect(res.body.badges[0]).toHaveProperty('name');
        expect(res.body.badges[0]).toHaveProperty('unlocked');
      });
    });

    describe('POST /api/gamification/badges/unlock', () => {
      it('should unlock a badge successfully', async () => {
        const res = await request(app)
          .post('/api/gamification/badges/unlock')
          .set('Cookie', sessionCookie)
          .send({ badgeId: 1 })
          .expect(200);

        expect(res.body.unlocked).toBe(true);
        expect(res.body.badge).toBeDefined();
      });

      it('should reject unlocking same badge twice', async () => {
        // First unlock
        await request(app)
          .post('/api/gamification/badges/unlock')
          .set('Cookie', sessionCookie)
          .send({ badgeId: 1 });

        // Second unlock attempt
        const res = await request(app)
          .post('/api/gamification/badges/unlock')
          .set('Cookie', sessionCookie)
          .send({ badgeId: 1 })
          .expect(400);

        expect(res.body.message).toContain('already unlocked');
      });

      it('should reject invalid badge ID', async () => {
        const res = await request(app)
          .post('/api/gamification/badges/unlock')
          .set('Cookie', sessionCookie)
          .send({ badgeId: 9999 })
          .expect(404);

        expect(res.body.message).toContain('not found');
      });
    });

    describe('GET /api/gamification/leaderboard', () => {
      it('should return leaderboard', async () => {
        const res = await request(app)
          .get('/api/gamification/leaderboard')
          .set('Cookie', sessionCookie)
          .expect(200);

        expect(res.body.leaderboard).toBeDefined();
        expect(Array.isArray(res.body.leaderboard)).toBe(true);
      });
    });
  });
});
