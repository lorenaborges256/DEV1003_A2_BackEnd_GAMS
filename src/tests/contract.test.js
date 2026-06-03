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
