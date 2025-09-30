const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// Aggregate data for homepage sections
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '6');

    const [aiNews, aiTech, kTech, blogs, startups, articles, totals] = await Promise.all([
      Post.find({ category: 'ai_news', published: true }).sort({ createdAt: -1 }).limit(limit),
      Post.find({ category: 'ai_technology', published: true }).sort({ createdAt: -1 }).limit(limit),
      Post.find({ category: 'karnataka_tech', published: true }).sort({ createdAt: -1 }).limit(limit),
      Post.find({ category: 'blog', published: true }).sort({ createdAt: -1 }).limit(limit),
      Post.find({ category: 'ai_startup', published: true }).sort({ createdAt: -1 }).limit(limit),
      Post.find({ category: 'article', published: true }).sort({ createdAt: -1 }).limit(limit),
      Post.aggregate([
        { $match: { published: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = totals.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {});

    res.json({
      ai_news: { items: aiNews, total: counts['ai_news'] || 0 },
      ai_technology: { items: aiTech, total: counts['ai_technology'] || 0 },
      karnataka_tech: { items: kTech, total: counts['karnataka_tech'] || 0 },
      blogs: { items: blogs, total: counts['blog'] || 0 },
      ai_startups: { items: startups, total: counts['ai_startup'] || 0 },
      articles: { items: articles, total: counts['article'] || 0 },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
