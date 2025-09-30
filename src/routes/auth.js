const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Seed admin user if not exists (optional)
router.post('/seed-admin', async (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return res.status(400).json({ error: 'Admin env not set' });

    let user = await User.findOne({ email });
    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      user = await User.create({ email, passwordHash: hash, role: 'admin', name: 'Admin' });
    }
    return res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    let user = await User.findOne({ email });
    if (!user) {
      // allow env-based admin without DB user
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ sub: 'env-admin', email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
