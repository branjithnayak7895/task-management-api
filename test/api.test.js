// Set environment to test BEFORE requiring any app code
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../server');

let mongoServer;
let request;
let tokenUser1;
let tokenUser2;
let userId1;
let userId2;
let taskIdUser1;
let subtaskId;

describe('Task Management API Test Suite', () => {

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    request = supertest(app);
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('1. User Authentication & Profile Endpoints', () => {
    it('should register a new user successfully', async () => {
      const res = await request
        .post('/api/users/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);

      tokenUser1 = res.body.token;
      userId1 = res.body.user.id;
    });

    it('should register a second user for task sharing tests', async () => {
      const res = await request
        .post('/api/users/register')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password123'
        });

      assert.strictEqual(res.status, 201);
      tokenUser2 = res.body.token;
      userId2 = res.body.user.id;
    });

    it('should login existing user', async () => {
      const res = await request
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('should update user profile details', async () => {
      const res = await request
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          name: 'John Updated',
          email: 'john.updated@example.com'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });
  });

  describe('2. Enterprise Task Features & Audit Logs', () => {
    it('should create a task with time tracking & tags', async () => {
      const res = await request
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          title: 'finish node.js project',
          description: 'Build REST API with Mongoose and Express',
          priority: 'high',
          category: 'work',
          estimatedHours: 6,
          actualHours: 3.5,
          tags: ['urgent', 'backend']
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.estimatedHours, 6);
      assert.strictEqual(res.body.data.actualHours, 3.5);

      taskIdUser1 = res.body.data._id;
    });

    it('should pin task to top', async () => {
      const res = await request
        .patch(`/api/tasks/${taskIdUser1}/pin`)
        .set('Authorization', `Bearer ${tokenUser1}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.isPinned, true);
    });

    it('should share task with User 2', async () => {
      const res = await request
        .post(`/api/tasks/${taskIdUser1}/share`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ email: 'jane@example.com' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('should allow User 2 to view shared task', async () => {
      const res = await request
        .get(`/api/tasks/${taskIdUser1}`)
        .set('Authorization', `Bearer ${tokenUser2}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.title, 'Finish node.js project');
    });

    it('should fetch activity audit log for task', async () => {
      const res = await request
        .get(`/api/tasks/${taskIdUser1}/activity`)
        .set('Authorization', `Bearer ${tokenUser1}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 2);
    });

    it('should import JSON task backup array', async () => {
      const res = await request
        .post('/api/tasks/import')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          tasks: [
            { title: 'Imported Task 1', priority: 'medium' },
            { title: 'Imported Task 2', priority: 'high' }
          ]
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.count, 2);
    });
  });

  describe('3. Capstone Enterprise Extensions (Projects, Sprints, Webhooks, Eisenhower, Backup)', () => {
    it('should create a project workspace', async () => {
      const res = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          title: 'Capstone E-Commerce Platform',
          description: 'Build full stack application',
          color: '#6366f1'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.title, 'Capstone E-Commerce Platform');
    });

    it('should fetch Eisenhower priority matrix', async () => {
      const res = await request
        .get('/api/tasks/eisenhower')
        .set('Authorization', `Bearer ${tokenUser1}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.do);
    });

    it('should register a webhook subscription', async () => {
      const res = await request
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          name: 'Slack Notification Dispatcher',
          url: 'https://hooks.slack.com/services/demo'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.name, 'Slack Notification Dispatcher');
    });

    it('should trigger demo notification', async () => {
      const res = await request
        .post('/api/notifications')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          title: 'Deadline Warning',
          message: '3 tasks are due today',
          type: 'warning'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.title, 'Deadline Warning');
    });

    it('should export full database backup', async () => {
      const res = await request
        .get('/api/tasks/backup')
        .set('Authorization', `Bearer ${tokenUser1}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.taskCount >= 2);
    });
  });
});
