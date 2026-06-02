const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const Item = require('../../src/models/Item');
const User = require('../../src/models/User');

let userToken;
let adminToken;
let itemId;

describe('auth routes', () => {
  it.todo('register, login and logout tests to be added by Person 1');
});

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  await User.deleteMany({ email: { $in: ['testuser@jest.com', 'testadmin@jest.com'] } });
  await Item.deleteMany({ name: 'Jest Test Item' });

  const userResponse = await request(app)
    .post('/auth/register')
    .send({ name: 'Jest User', email: 'testuser@jest.com', password: 'password123' });
  userToken = userResponse.body.token;

  const adminResponse = await request(app)
    .post('/auth/register')
    .send({ name: 'Jest Admin', email: 'testadmin@jest.com', password: 'password123' });

  await User.findByIdAndUpdate(adminResponse.body.user.id, { role: 'admin' });

  const loginResponse = await request(app)
    .post('/auth/login')
    .send({ email: 'testadmin@jest.com', password: 'password123' });
  adminToken = loginResponse.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['testuser@jest.com', 'testadmin@jest.com'] } });
  await Item.deleteMany({ name: 'Jest Test Item' });
  await mongoose.disconnect();
});

describe('GET /items', () => {
  it('returns 200 and an array for a logged in user', async () => {
    const response = await request(app).get('/items').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns 401 if no token is provided', async () => {
    const response = await request(app).get('/items');
    expect(response.status).toBe(401);
  });
});

describe('POST /items (admin)', () => {
  it('returns 201 when admin creates an item', async () => {
    const response = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jest Test Item',
        description: 'An item created during Jest testing.',
        category: 'Test',
        price: 10,
        stockQuantity: 5,
      });
    expect(response.status).toBe(201);
    itemId = response.body._id;
  });

  it('returns 403 when a regular user tries to create an item', async () => {
    const response = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Jest Test Item',
        description: 'An item created during Jest testing.',
        category: 'Test',
        price: 10,
        stockQuantity: 5,
      });
    expect(response.status).toBe(403);
  });
});
