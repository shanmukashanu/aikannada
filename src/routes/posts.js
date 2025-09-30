const express = require('express');
const { body, validationResult } = require('express-validator');
const slugify = require('slugify');
const Post = require('../models/Post');
const Subscriber = require('../models/Subscriber');
const { sendMail } = require('../utils/mailer');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// List posts with optional category filter and pagination
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Post.countDocuments(filter),
    ]);

    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single by slug
router.get('/:slug', async (req, res) => {
  try {
    const item = await Post.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create
router.post(
  '/',
  authRequired,
  [
    body('title').isString().notEmpty(),
    body('category').isIn(['ai_news', 'ai_technology', 'karnataka_tech', 'blog', 'ai_startup', 'article']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { title, category, excerpt, content, imageUrl, imagePublicId, tags, author, published = true, media } = req.body;
      const slugBase = slugify(title, { lower: true, strict: true });
      let slug = slugBase;
      let i = 1;
      while (await Post.findOne({ slug })) slug = `${slugBase}-${i++}`;
      const payload = { title, category, excerpt, content, imageUrl, imagePublicId, tags, author, published, slug };
      if (Array.isArray(media)) {
        payload.media = media;
        const firstImg = media.find(m => m.type === 'image');
        if (firstImg && firstImg.url) payload.imageUrl = firstImg.url;
      }
      const post = await Post.create(payload);

      // Notify subscribers only for blogs when published
      if (post.category === 'blog' && post.published) {
        try {
          const subs = await Subscriber.find({ confirmed: true }).select('email').lean();
          if (subs.length) {
            const toList = subs.map(s => s.email).join(',');
            const url = `${req.protocol}://${req.get('host')}/article/${post.slug}`;
            await sendMail({
              to: toList,
              subject: `New blog: ${post.title}`,
              text: `${post.excerpt || ''}\n\nRead more: ${url}`,
              html: `<p>${post.excerpt || ''}</p><p><a href="${url}">Read more</a></p>`,
            });
          }
        } catch (e) {
          // ignore email errors
        }
      }

      res.status(201).json(post);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Update
router.put('/:id', authRequired, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.title) {
      const slugBase = slugify(update.title, { lower: true, strict: true });
      let slug = slugBase;
      let i = 1;
      while (await Post.findOne({ slug, _id: { $ne: req.params.id } })) slug = `${slugBase}-${i++}`;
      update.slug = slug;
    }
    if (Array.isArray(update.media)) {
      const firstImg = update.media.find(m => m.type === 'image');
      if (firstImg && firstImg.url) update.imageUrl = firstImg.url;
    }
    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Like
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({ likes: post.likes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
