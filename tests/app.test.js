const request = require('supertest');
const app = require('../app');
const db = require('../db');

jest.mock('../db');

beforeEach(() => {
  db.query.mockReset();
  db.testConnection.mockReset();
});

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ ok: true });
});

test('POST /users returns 400 when missing email/password', async () => {
  const res = await request(app).post('/users').send({ email: '', password: '' });
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('POST /users creates user when not exists', async () => {
  db.query
    .mockResolvedValueOnce({ rowCount: 0, rows: [] })
    .mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, email: 'a@b.com', first_name: 'A', last_name: 'B', role: 'user', created_at: new Date().toISOString() }]
    });

  const payload = { email: 'a@b.com', password: 'secret', first_name: 'A', last_name: 'B' };
  const res = await request(app).post('/users').send(payload);

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('email', 'a@b.com');
  expect(db.query).toHaveBeenCalledTimes(2);
});

test('POST /users returns 409 when user already exists', async () => {
  db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
  const payload = { email: 'exists@b.com', password: 'secret' };
  const res = await request(app).post('/users').send(payload);
  expect(res.statusCode).toBe(409);
  expect(res.body).toHaveProperty('error', 'user already exists');
});

test('GET /users returns list', async () => {
  db.query.mockResolvedValueOnce({ rowCount: 2, rows: [
    { id: 2, email: 'u2@b.com', first_name: 'U2', last_name: 'B', role: 'user', created_at: new Date() },
    { id: 1, email: 'u1@b.com', first_name: 'U1', last_name: 'B', role: 'user', created_at: new Date() }
  ]});

  const res = await request(app).get('/users');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(2);
});
