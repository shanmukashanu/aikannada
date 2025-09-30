const express = require('express');
const slugify = require('slugify');
const Post = require('../models/Post');

const router = express.Router();

function mapToCategory(topic) {
  switch ((topic || '').toLowerCase()) {
    case 'news':
    case 'ai_news':
      return 'ai_news';
    case 'tech':
    case 'technology':
    case 'ai_technology':
      return 'ai_technology';
    case 'article':
    case 'articles':
      return 'article';
    case 'blog':
    case 'blogs':
      return 'blog';
    default:
      return 'ai_news';
  }
}

// Import from GNews and store in DB
// GET /api/imports/gnews?topic=news|tech|article|blog&query=ai&max=10
router.get('/gnews', async (req, res) => {
  try {
    const apiKey = process.env.GNEWSIO_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'Missing GNEWSIO_API_KEY' });
    const { topic = 'news', query = 'artificial intelligence', max = '10' } = req.query;
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${encodeURIComponent(max)}&token=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'GNews error', details: text });
    }
    const data = await r.json();
    const cat = mapToCategory(topic);

    const created = [];
    for (const a of (data.articles || [])) {
      const title = a.title?.trim();
      if (!title) continue;
      const slugBase = slugify(title, { lower: true, strict: true });
      let slug = slugBase;
      let i = 1;
      while (await Post.findOne({ slug })) slug = `${slugBase}-${i++}`;
      const placeholder = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop';
      const imgUrl = a.image || placeholder;
      const media = [{ url: imgUrl, type: 'image' }];
      const payload = {
        title,
        category: cat,
        excerpt: a.description || '',
        content: `<p>${(a.description || '').replace(/</g, '&lt;')}</p><p><a href="${a.url}" target="_blank" rel="noopener">Source</a></p>`,
        author: a.source?.name || 'GNews',
        media,
        imageUrl: imgUrl,
        published: true,
        slug,
      };
      const doc = await Post.create(payload);
      created.push(doc);
    }
    res.json({ imported: created.length, items: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
