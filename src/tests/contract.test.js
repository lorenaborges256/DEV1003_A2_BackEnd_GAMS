const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Contract = require('../models/Contract');
const User = require('../models/User');

let userToken;
let adminToken;
let contractId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  await User.deleteMany({ email: { $in: ['contractuser@jest.com', 'contractadmin@jest.com'] } });
  await Contract.deleteMany({ title: 'Jest Test Contract' });

  const userResponse = await request(app)
    .post('/auth/register')
    .send({ name: 'Contract User', email: 'contractuser@jest.com', password: 'password123' });
  userToken = userResponse.body.token;

  const adminResponse = await request(app)
    .post('/auth/register')
    .send({ name: 'Contract Admin', email: 'contractadmin@jest.com', password: 'password123' });

  await User.findByIdAndUpdate(adminResponse.body.user.id, { role: 'admin' });

  const loginResponse = await request(app)
    .post('/auth/login')
    .send({ email: 'contractadmin@jest.com', password: 'password123' });
  adminToken = loginResponse.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['contractuser@jest.com', 'contractadmin@jest.com'] } });
  await Contract.deleteMany({ title: 'Jest Test Contract' });
  await mongoose.disconnect();
});

describe('GET /contracts', () => {
  it('returns 200 and an array for a logged in user', async () => {
    const response = await request(app)
      .get('/contracts')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns 401 if no token is provided', async () => {
    const response = await request(app).get('/contracts');
    expect(response.status).toBe(401);
  });
});

describe('POST /contracts (admin)', () => {
  it('returns 201 when admin creates a contract', async () => {
    const response = await request(app)
      .post('/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Jest Test Contract',
        description: 'A contract created during Jest testing.',
        type: 'Combat',
        difficulty: 'Easy',
        rewardDescription: 'Gold and reputation.',
        rewardAmount: 100,
        startAt: '2026-01-01T00:00:00.000Z',
        endAt: '2026-12-31T00:00:00.000Z',
        maxAcceptances: 5,
      });
    expect(response.status).toBe(201);
    contractId = response.body._id;
  });

  it('returns 403 when a regular user tries to create a contract', async () => {
    const response = await request(app)
      .post('/contracts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Jest Test Contract',
        description: 'A contract created during Jest testing.',
        type: 'Combat',
        difficulty: 'Easy',
        rewardDescription: 'Gold and reputation.',
        rewardAmount: 100,
        startAt: '2026-01-01T00:00:00.000Z',
        endAt: '2026-12-31T00:00:00.000Z',
        maxAcceptances: 5,
      });
    expect(response.status).toBe(403);
  });
});

describe('GET /contracts/:id', () => {
  it('returns 200 and the contract for a valid id', async () => {
    const response = await request(app)
      .get(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
  });

  it('returns 404 for a contract that does not exist', async () => {
    const response = await request(app)
      .get('/contracts/111111111111111111111111')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(404);
  });
});

describe('POST /contracts/:id/accept', () => {
  it('returns 201 and instructions when contract is available', async () => {
    const response = await request(app)
      .post(`/contracts/${contractId}/accept`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(201);
    expect(response.body.instructions).toBeDefined();
  });

  it('returns 404 when contract does not exist', async () => {
    const response = await request(app)
      .post('/contracts/111111111111111111111111/accept')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(404);
  });
});
