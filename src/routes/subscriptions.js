const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const { sendMail } = require('../utils/mailer');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Subscribe
router.post(
  '/',
  [body('email').isEmail(), body('name').optional().isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, name } = req.body;
      const existing = await Subscriber.findOne({ email });
      if (existing) return res.json({ ok: true, message: 'Already subscribed' });
      await Subscriber.create({ email, name, confirmed: true });
      try {
        await sendMail({
          to: email,
          subject: 'Subscribed to AI Kannada updates',
          text: 'Thank you for subscribing to AI Kannada updates!',
          html: `<p>Hi${name ? ' ' + name : ''},</p><p>Thanks for subscribing to AI Kannada updates. You will receive notifications when we publish new content.</p>`,
        });
      } catch (e) {
        // ignore email error
      }
      res.status(201).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Admin: list subscribers
router.get('/', authRequired, async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ createdAt: -1 }).limit(1000);
    res.json(subs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete subscriber
router.delete('/:id', authRequired, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
