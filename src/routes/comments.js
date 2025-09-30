const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// List comments for a post by post id
router.get('/post/:postId', async (req, res) => {
  try {
    const items = await Comment.find({ post: req.params.postId, approved: true }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create comment for a post
router.post(
  '/post/:postId',
  [
    body('name').isString().notEmpty(),
    body('email').isEmail(),
    body('content').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const { name, email, content } = req.body;
      const comment = await Comment.create({ post: post.id, name, email, content, approved: true });
      res.status(201).json(comment);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Admin: list all comments
router.get('/', authRequired, async (req, res) => {
  try {
    const items = await Comment.find().sort({ createdAt: -1 }).limit(500);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: approve/unapprove
router.patch('/:id', authRequired, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true });
    if (!comment) return res.status(404).json({ error: 'Not found' });
    res.json(comment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
