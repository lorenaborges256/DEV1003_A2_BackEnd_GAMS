const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

const TEST_USER_EMAIL = 'authuser@jest.com';
const TEST_USER_PASSWORD = 'password123';
const TEST_USER_NAME = 'Auth Test User';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  // Clean up any leftover test data from a previous interrupted run
  await User.deleteMany({ email: TEST_USER_EMAIL });
});

afterAll(async () => {
  await User.deleteMany({ email: TEST_USER_EMAIL });
  await mongoose.disconnect();
});

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('returns 201 with a token and user object on successful registration', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({
      name: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      role: 'user',
    });
  });

  it('returns 409 when the email is already registered', async () => {
    // The user created in the previous test is still in the database
    const response = await request(app)
      .post('/auth/register')
      .send({ name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email is already registered');
  });

  it('returns 400 when required fields are missing', async () => {
    // Sending an empty body triggers Mongoose ValidationError → 400 via errorHandler
    const response = await request(app)
      .post('/auth/register')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it('returns 400 when the password is too short', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Short Pass', email: 'shortpass@jest.com', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });

  it('returns 400 when the email format is invalid', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Bad Email', email: 'not-an-email', password: TEST_USER_PASSWORD });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  it('returns 200 with a token and user object on successful login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({
      email: TEST_USER_EMAIL,
      role: 'user',
    });
  });

  it('returns 401 when the password is incorrect', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: TEST_USER_EMAIL, password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('returns 401 when the email does not exist', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@jest.com', password: TEST_USER_PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe('POST /auth/logout', () => {
  let userToken;

  beforeAll(async () => {
    // Log in to get a valid token for the logout tests
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
    userToken = loginResponse.body.token;
  });

  it('returns 200 with a confirmation message when a valid token is provided', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Logged out successfully. Please discard your token on the client.',
    );
  });

  it('returns 401 when no token is provided', async () => {
    const response = await request(app).post('/auth/logout');

    expect(response.status).toBe(401);
  });
});
