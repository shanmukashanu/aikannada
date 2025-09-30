const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendMail } = require('../utils/mailer');
const Contact = require('../models/Contact');
const { authRequired } = require('../middleware/auth') || { authRequired: (req,res,next)=>next() };

const router = express.Router();

// Public: submit contact form (no auth)
router.post(
  '/',
  [
    body('name').isString().notEmpty(),
    body('email').isEmail(),
    body('phone').isString().notEmpty(),
    body('message').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, phone, message } = req.body;
      // Save to DB
      const saved = await Contact.create({ name, email, phone, message });
      const html = `
        <h3>New Contact Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `;

      await sendMail({
        to: process.env.EMAIL_USER,
        subject: `Contact form - ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
        html,
        from: process.env.EMAIL_USER, // ensure from matches authenticated user
        replyTo: email,
      });

      res.json({ ok: true, id: saved._id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Admin: list contacts
router.get('/', authRequired, async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete contact
router.delete('/:id', authRequired, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: reply to contact
router.post('/:id/reply', authRequired, [
  body('subject').isString().notEmpty(),
  body('message').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Not found' });
    const { subject, message } = req.body;
    await sendMail({
      to: contact.email,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g,'<br>')}</p>`,
      from: process.env.EMAIL_USER,
      replyTo: process.env.EMAIL_USER,
    });
    contact.replied = true;
    contact.repliedAt = new Date();
    contact.lastReplySubject = subject;
    await contact.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
