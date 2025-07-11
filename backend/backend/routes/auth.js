const express = require('express');
const bcrypt  = require('bcryptjs');               // use bcryptjs (fewer native deps)
const jwt     = require('jsonwebtoken');
const db      = require('../db');

const router = express.Router();

// helper → simple field check
const isEmpty = (val) => !val || val.trim() === '';

// ─────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '8h' });
jwt.verify(token, process.env.JWT_SECRET);
  const { name, email, password, address } = req.body;

  // 1. quick validation
  if ([name, email, password, address].some(isEmpty)) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 2. check duplicate email
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // 3. hash + insert
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, address, 'user']
    );
    res.sendStatus(201); // Created
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // simple validation
  if (isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // issue JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;