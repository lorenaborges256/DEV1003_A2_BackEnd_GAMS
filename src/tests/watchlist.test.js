const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Item = require('../models/Item');
const Watchlist = require('../models/Watchlist');

const TEST_USER_EMAIL = 'watchlistuser@jest.com';
const TEST_USER_PASSWORD = 'password123';

let userToken;
let testItemId;
let watchlistEntryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clean up any leftover data from a previous interrupted run
  await User.deleteMany({ email: TEST_USER_EMAIL });
  await Item.deleteMany({ name: 'Jest Watchlist Item' });

  // Register a test user and capture their token
  const userResponse = await request(app)
    .post('/auth/register')
    .send({ name: 'Watchlist User', email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
  userToken = userResponse.body.token;

  // Create a real Item directly in the database to use as the watch target
  const item = await Item.create({
    name: 'Jest Watchlist Item',
    description: 'An item used as a watchlist target during Jest testing.',
    category: 'Test',
    price: 10,
    stockQuantity: 5,
  });
  testItemId = item._id.toString();
});

afterAll(async () => {
  await User.deleteMany({ email: TEST_USER_EMAIL });
  await Item.deleteMany({ name: 'Jest Watchlist Item' });
  await Watchlist.deleteMany({ targetId: testItemId });
  await mongoose.disconnect();
});

// ─── POST /watchlist ──────────────────────────────────────────────────────────

describe('POST /watchlist', () => {
  it('returns 201 and the watchlist entry when watching an item for the first time', async () => {
    const response = await request(app)
      .post('/watchlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ targetId: testItemId, targetType: 'Item' });

    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
    expect(response.body.targetType).toBe('Item');

    // Save the entry id for use in later tests
    watchlistEntryId = response.body._id;
  });

  it('returns 409 when trying to watch the same item twice', async () => {
    const response = await request(app)
      .post('/watchlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ targetId: testItemId, targetType: 'Item' });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Already watching this item.');
  });

  it('returns 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/watchlist')
      .send({ targetId: testItemId, targetType: 'Item' });

    expect(response.status).toBe(401);
  });

  it('returns 400 when targetId is missing', async () => {
    const response = await request(app)
      .post('/watchlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ targetType: 'Item' });

    expect(response.status).toBe(400);
  });
});

// ─── GET /watchlist ───────────────────────────────────────────────────────────

describe('GET /watchlist', () => {
  it('returns 200 and an array containing the watched item', async () => {
    const response = await request(app)
      .get('/watchlist')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].targetType).toBe('Item');
  });

  it('returns 401 when no token is provided', async () => {
    const response = await request(app).get('/watchlist');

    expect(response.status).toBe(401);
  });
});

// ─── DELETE /watchlist/:id ────────────────────────────────────────────────────

describe('DELETE /watchlist/:id', () => {
  it('returns 404 when the watchlist entry does not exist', async () => {
    const response = await request(app)
      .delete('/watchlist/111111111111111111111111')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Watchlist entry not found.');
  });

  it('returns 200 and a confirmation message when the entry is successfully removed', async () => {
    const response = await request(app)
      .delete(`/watchlist/${watchlistEntryId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Removed from watchlist.');
  });

  it('returns 401 when no token is provided', async () => {
    const response = await request(app)
      .delete(`/watchlist/${watchlistEntryId}`);

    expect(response.status).toBe(401);
  });
});
