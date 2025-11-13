require('dotenv').config();
const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/users', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount > 0) return res.status(409).json({ error: 'user already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING id,email,first_name,last_name,role,created_at`,
      [email, hashed, first_name || null, last_name || null, role || 'user']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const q = await db.query('SELECT id,email,first_name,last_name,role,created_at FROM users ORDER BY id DESC LIMIT 100');
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const q = await db.query('SELECT id,email,first_name,last_name,role,created_at FROM users WHERE id=$1', [req.params.id]);
    if (q.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json(q.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = app;
