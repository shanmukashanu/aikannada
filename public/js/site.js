// Site wiring for dynamic backend
(async function () {
  // Render media block (image/video or auto-rotating carousel)
  function mediaHtml(p) {
    const cover = p.imageUrl || (p.media && p.media.find(m=>m.type==='image')?.url) || p.media?.[0]?.url;
    const items = Array.isArray(p.media) ? p.media.slice(0, 10) : [];
    if (items.length > 1) {
      const id = `m_${p._id || p.slug || Math.random().toString(36).slice(2)}`;
      const slides = items.map((m, idx) => m.type === 'video'
        ? `<video class="slide" controls preload="metadata" style="width:100%;height:240px;object-fit:contain;display:${idx===0?'block':'none'}"><source src="${m.url}" type="video/mp4"></video>`
        : `<img class="slide" src="${m.url}" alt="media" style="width:100%;height:240px;object-fit:contain;display:${idx===0?'block':'none'}">`
      ).join('');
      return `<div class="media-carousel" data-id="${id}">${slides}</div>`;
    }
    if (cover) {
      const isVideo = p.videoUrl || (items[0]?.type === 'video');
      if (isVideo) {
        const url = p.videoUrl || items[0].url;
        return `<video controls preload="metadata" style="width:100%; height:240px; object-fit:contain;"><source src="${url}" type="video/mp4"></video>`;
      }
      return `<img src="${cover}" alt="${escapeHtml(p.title)}" loading="lazy" style="width:100%;height:240px;object-fit:contain;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop';">`;
    }
    // Fallback placeholder
    return `<img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" alt="placeholder" loading="lazy" style="width:100%;height:240px;object-fit:cover;">`;
  }

  // Magazine population
  async function populateMagazine() {
    const news1 = document.getElementById('mag-news-1');
    const news2 = document.getElementById('mag-news-2');
    const techFeature = document.getElementById('mag-tech-feature');
    const ab1 = document.getElementById('mag-ab-1');
    const ab2 = document.getElementById('mag-ab-2');
    const newsRow = document.getElementById('mag-news-row');
    const techRow = document.getElementById('mag-tech-row');
    const blogsRow = document.getElementById('mag-blogs-row');
    if (!news1 && !techFeature) return; // not on home
    try {
      const data = await API.getHome(12);
      const news = data.ai_news?.items || [];
      const tech = data.ai_technology?.items || [];
      const articles = data.articles?.items || [];
      const blogs = data.blogs?.items || [];

      // helper backfill to avoid gaps
      const used = new Set();
      function safePick(arr, idx, fallbackPool = []) {
        const item = arr[idx];
        if (item) { used.add(item._id); return item; }
        const fb = fallbackPool.find(x => !used.has(x._id));
        if (fb) { used.add(fb._id); return fb; }
        return null;
      }

      const pool = [...news, ...tech, ...articles, ...blogs];

      const n1 = safePick(news, 0, pool);
      const n2 = safePick(news, 1, pool);
      if (news1) news1.innerHTML = n1 ? cardHtml(n1) : '';
      if (news2) news2.innerHTML = n2 ? cardHtml(n2) : '';
      const t1 = safePick(tech, 0, pool);
      if (techFeature) techFeature.innerHTML = t1
        ? `<div class="card">${mediaHtml(tech[0])}<div class="card-content"><span class="category">${displayCategory(tech[0].category)}</span><h3><a href="/article/${tech[0].slug}">${escapeHtml(tech[0].title)}</a></h3><div class="card-meta"><span>${new Date(tech[0].createdAt).toLocaleDateString()}</span><span style="display:flex;align-items:center;gap:6px;color:#e11d48;"><i class='fas fa-heart'></i>${tech[0].likes||0}</span></div></div></div>`
        : '';
      const abCombined = [safePick(articles,0,pool), safePick(blogs,0,pool)].filter(Boolean);
      if (ab1) ab1.innerHTML = abCombined[0] ? cardHtml(abCombined[0]) : '';
      if (ab2) ab2.innerHTML = abCombined[1] ? cardHtml(abCombined[1]) : '';

      if (newsRow) newsRow.innerHTML = news.slice(2, 6).map(cardHtml).join('');
      if (techRow) techRow.innerHTML = tech.slice(1, 5).map(cardHtml).join('');
      if (blogsRow) blogsRow.innerHTML = blogs.slice(0, 4).map(cardHtml).join('');
    } catch (e) {
      // console.error(e);
    }
  }

  // Below-grid sections population (3 each) and redirect loaders
  async function populateSections() {
    const newsGrid = document.getElementById('news-sec-grid');
    const techGrid = document.getElementById('tech-sec-grid');
    const articlesGrid = document.getElementById('articles-sec-grid');
    const blogsGrid = document.getElementById('blogs-sec-grid');
    if (!newsGrid && !techGrid && !articlesGrid && !blogsGrid) return;
    try {
      const data = await API.getHome(12);
      if (newsGrid) newsGrid.innerHTML = (data.ai_news?.items || []).slice(0,3).map(cardHtml).join('');
      if (techGrid) techGrid.innerHTML = (data.ai_technology?.items || []).slice(0,3).map(cardHtml).join('');
      if (articlesGrid) articlesGrid.innerHTML = (data.articles?.items || []).slice(0,3).map(cardHtml).join('');
      if (blogsGrid) blogsGrid.innerHTML = (data.blogs?.items || []).slice(0,3).map(cardHtml).join('');
    } catch(_){}

    // Wire buttons to redirect
    const btn = (id, href) => { const el = document.getElementById(id); el && (el.onclick = () => { window.location.href = href; }); };
    btn('news-more', '/ai-news.html');
    btn('tech-more', '/ai-tech.html');
    btn('articles-more', '/articles.html');
    btn('blogs-more', '/blogs.html');
  }

  // Helper to create a card element for a Post
  function cardHtml(p) {
    const href = `/post.html?slug=${encodeURIComponent(p.slug)}`;
    const cat = displayCategory(p.category);
    const date = new Date(p.createdAt || Date.now()).toLocaleDateString();
    const excerpt = p.excerpt || '';
    const media = mediaHtml(p);
    const canComment = (p.category === 'article' || p.category === 'blog');
    return `
      <article class="card" data-id="${p._id}" data-slug="${p.slug}">
        <div class="card-img">
          ${media}
        </div>
        <div class="card-content">
          <span class="category">${cat}</span>
          <h3>${escapeHtml(p.title)}</h3>
          ${excerpt ? `<p class="article-excerpt">${escapeHtml(excerpt)}</p>` : ''}
          <div class="card-meta" style="display:flex;flex-direction:column;align-items:flex-start;gap:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
              <span>${date}</span>
              <div style="display:flex;align-items:center;gap:12px">
                <button class="btn-like" data-like="${p._id}" title="Like" style="display:inline-flex;align-items:center;gap:6px;background:none;border:0;color:#e11d48;cursor:pointer;"><i class="fas fa-heart"></i><span class="like-count">${p.likes||0}</span></button>
                ${canComment ? `<button class="btn-toggle-comments" data-toggle-comments="${p._id}" title="Comments" style="display:inline-flex;align-items:center;gap:6px;background:none;border:0;color:#0ea5e9;cursor:pointer;"><i class=\"fas fa-comments\"></i></button>` : ''}
              </div>
            </div>
            <div style="width:100%;margin-top:8px;">
              <a class="read-more" href="${href}" style="display:inline-block;width:100%;text-align:center;padding:8px;background-color:#f0f0f0;border-radius:4px;text-decoration:none;color:#333;">View More →</a>
            </div>
          </div>
          ${canComment ? `
          <div class="comments">
            <div class="comments-panel" id="c_${p._id}" style="display:none;border-top:1px solid var(--border);margin-top:.5rem;padding-top:.5rem">
              <form class="comment-form" data-post="${p._id}" style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:.5rem">
                <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                  <input name="name" placeholder="Name" required class="form-control" style="flex:1;min-width:140px;padding:.5rem;border:1px solid var(--border);border-radius:6px;">
                  <input name="email" type="email" placeholder="Email" required class="form-control" style="flex:1;min-width:180px;padding:.5rem;border:1px solid var(--border);border-radius:6px;">
                </div>
                <textarea name="content" placeholder="Write a comment" rows="2" required style="padding:.5rem;border:1px solid var(--border);border-radius:6px;"></textarea>
                <div style="display:flex;gap:.5rem;align-items:center">
                  <button type="submit" class="btn btn-primary btn-sm" style="padding:.4rem .8rem">Post</button>
                  <button type="button" class="btn btn-outline btn-sm" data-hide-comments="${p._id}" style="padding:.4rem .8rem">Hide</button>
                </div>
              </form>
              <div class="comment-list" data-list="${p._id}" style="display:grid;gap:.5rem"></div>
            </div>
          </div>` : ''}
        </div>
      </article>
    `;
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"]+/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[s]));
  }

  function displayCategory(c) {
    switch (c) {
      case 'ai_news': return 'AI News';
      case 'ai_technology': return 'AI Technology';
      case 'article': return 'Articles';
      case 'karnataka_tech': return 'Karnataka Tech';
      case 'blog': return 'Blogs';
      case 'ai_startup': return 'AI Startups';
      default: return c;
    }
  }

  // Homepage population
  async function populateHome() {
    const mixed = document.getElementById('mixed-grid');
    if (!mixed) return;
    try {
      // Fetch at least one page from each category to ensure variety
      const [newsRes, techRes, artRes, blogRes] = await Promise.all([
        API.listPosts({ category: 'ai_news', limit: 12 }),
        API.listPosts({ category: 'ai_technology', limit: 12 }),
        API.listPosts({ category: 'article', limit: 12 }),
        API.listPosts({ category: 'blog', limit: 12 }),
      ]);
      const news = newsRes.items || [];
      const tech = techRes.items || [];
      const arts = artRes.items || [];
      const blogs = blogRes.items || [];

      // Start with one from each non-empty category
      const pick = [];
      if (news[0]) pick.push(news[0]);
      if (tech[0]) pick.push(tech[0]);
      if (arts[0]) pick.push(arts[0]);
      if (blogs[0]) pick.push(blogs[0]);

      // Fill the rest by global recency
      const all = [...news, ...tech, ...arts, ...blogs]
        .sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
      const used = new Set(pick.map(p=>p._id));
      for (const p of all) {
        if (pick.length >= 6) break;
        if (used.has(p._id)) continue;
        pick.push(p); used.add(p._id);
      }
      mixed.innerHTML = pick.slice(0,6).map(cardHtml).join('');
    } catch (e) {
      // console.error(e);
    }
  }

  // Detailed Post Page
  async function populatePostDetail() {
    const container = document.getElementById('post-detail');
    if (!container) return;
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    if (!slug) { container.innerHTML = '<div class="error-message">Post not found</div>'; return; }
    try {
      const p = await API.getPostBySlug(slug);
      const cat = p.category;
      const media = mediaHtml(p).replace(/height:240px/g, 'height:420px');
      const title = `<h1>${escapeHtml(p.title)}</h1>`;
      const meta = `<div class="detail-meta"><span>${new Date(p.createdAt).toLocaleString()}</span><span>${displayCategory(cat)}</span><span>${p.author || ''}</span></div>`;
      const content = `<div class="detail-content">${p.content || ''}</div>`;
      // Layout variations by category
      let body = '';
      if (cat === 'ai_news') {
        body = `<div class="layout-news">${title}${meta}<div class="detail-grid"><div class="detail-main">${media}${content}</div><aside class="detail-aside"><div class="card">Quick facts</div></aside></div></div>`;
      } else if (cat === 'ai_technology') {
        body = `<div class="layout-tech">${title}${meta}<div class="detail-main">${media}${content}</div></div>`;
      } else if (cat === 'article') {
        body = `<div class="layout-article">${title}${meta}<div class="detail-main two-col">${media}${content}</div></div>`;
      } else if (cat === 'blog') {
        body = `<div class="layout-blog">${title}${meta}<div class="detail-main">${media}${content}</div></div>`;
      } else {
        body = `${title}${meta}${media}${content}`;
      }
      container.innerHTML = `
        <div class="post-wrapper">
          ${body}
          <div class="fab-col">
            <button class="fab like" id="fab-like" title="Like"><i class="fas fa-heart"></i><span class="count">${p.likes||0}</span></button>
            <button class="fab comment" id="fab-comment" title="Comments"><i class="fas fa-comments"></i></button>
          </div>
          <div id="detail-comments" class="detail-comments" style="display:none">
            <form id="detail-comment-form" data-post="${p._id}" class="comment-form" style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem">
              <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                <input name="name" placeholder="Name" required class="form-control" style="flex:1;min-width:140px;padding:.5rem;border:1px solid var(--border);border-radius:6px;">
                <input name="email" type="email" placeholder="Email" required class="form-control" style="flex:1;min-width:180px;padding:.5rem;border:1px solid var(--border);border-radius:6px;">
              </div>
              <textarea name="content" placeholder="Write a comment" rows="3" required style="padding:.5rem;border:1px solid var(--border);border-radius:6px;"></textarea>
              <div><button class="btn btn-primary" type="submit">Post Comment</button></div>
            </form>
            <div id="detail-comment-list" style="display:grid;gap:.75rem"></div>
          </div>
        </div>`;

      // Like FAB
      document.getElementById('fab-like')?.addEventListener('click', async () => {
        try {
          const { likes } = await API.likePost(p._id);
          const countEl = document.querySelector('#fab-like .count');
          if (countEl) countEl.textContent = likes;
        } catch(_){}
      });
      // Comments FAB toggle & load
      document.getElementById('fab-comment')?.addEventListener('click', async () => {
        const box = document.getElementById('detail-comments');
        const isOpen = box.style.display !== 'none';
        box.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) {
          try {
            const items = await API.listComments(p._id);
            const list = document.getElementById('detail-comment-list');
            if (list) list.innerHTML = items.map(c => `<div style="border:1px solid var(--border);border-radius:6px;padding:.5rem"><strong>${escapeHtml(c.name)}</strong><div style="font-size:.95rem;color:#475569">${escapeHtml(c.content)}</div></div>`).join('');
          } catch(_){}
        }
      });
      // Detail comment submit
      document.getElementById('detail-comment-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        try {
          await API.addComment(p._id, data);
          form.reset();
          const items = await API.listComments(p._id);
          const list = document.getElementById('detail-comment-list');
          if (list) list.innerHTML = items.map(c => `<div style="border:1px solid var(--border);border-radius:6px;padding:.5rem"><strong>${escapeHtml(c.name)}</strong><div style="font-size:.95rem;color:#475569">${escapeHtml(c.content)}</div></div>`).join('');
        } catch(_){}
      });
    } catch (e) {
      container.innerHTML = '<div class="error-message">Failed to load post</div>';
    }
  }

  // Newsletter subscription forms
  function wireSubscriptions() {
    document.querySelectorAll('form.newsletter-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value.trim();
        if (!email) return;
        try {
          await API.subscribe(email);
          form.reset();
          alert('Subscribed successfully!');
        } catch (err) {
          alert('Subscription failed.');
        }
      });
    });
  }

  // Category listing pages
  async function populateListingByCategory() {
    // Map filenames to categories
    const path = window.location.pathname;
    let category = null;
    if (path.endsWith('/ai-news.html')) category = 'ai_news';
    else if (path.endsWith('/ai-tech.html')) category = 'ai_technology';
    else if (path.endsWith('/articles.html')) category = 'article';
    else if (path.endsWith('/blogs.html')) category = 'blog';

    if (!category) return;

    const grid = document.querySelector('.grid') || document.getElementById('blogList') || document.getElementById('postsList');
    if (!grid) return;
    // Switch to masonry columns for nicer packing
    grid.classList.add('masonry');
    try {
      let { items } = await API.listPosts({ category, limit: 48 });
      if (!items.length) {
        // Auto-import from GNews then re-fetch
        const topicMap = { ai_news: 'news', ai_technology: 'tech', article: 'article', blog: 'blog' };
        try { await fetch(`/api/imports/gnews?topic=${topicMap[category]}&query=ai&max=12`); } catch(_){}
        const res2 = await API.listPosts({ category, limit: 48 });
        items = res2.items || [];
      }
      grid.innerHTML = items.map(cardHtml).join('');
      // Learning path filter for AI Tech
      if (category === 'ai_technology') {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.addEventListener('click', () => {
          buttons.forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          const label = (btn.textContent || '').toLowerCase();
          if (label.includes('all')) { grid.innerHTML = items.map(cardHtml).join(''); return; }
          const filtered = items.filter(p => (p.title||'').toLowerCase().includes(label) || (p.excerpt||'').toLowerCase().includes(label));
          grid.innerHTML = (filtered.length? filtered: items).map(cardHtml).join('');
        }));
      }
    } catch (e) {
      // console.error(e);
    }
  }

  // Article detail like/comments wiring can be added later on dedicated detail template

  document.addEventListener('DOMContentLoaded', function () {
    wireSubscriptions();
    populateHome();
    // magazine removed on new home
    populateSections();
    populateListingByCategory();
    populatePostDetail();
    // Auto rotate carousels
    setInterval(()=>{
      document.querySelectorAll('.media-carousel').forEach(car => {
        const slides = car.querySelectorAll('.slide');
        if (slides.length < 2) return;
        let idx = Array.from(slides).findIndex(s => s.style.display !== 'none');
        if (idx === -1) idx = 0;
        slides[idx].style.display = 'none';
        const next = (idx + 1) % slides.length;
        slides[next].style.display = 'block';
      });
    }, 5000);

    // Like handler for cards (event delegation)
    document.body.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-like');
      if (!btn) return;
      e.preventDefault();
      const postId = btn.getAttribute('data-like');
      if (!postId) return;
      try {
        const { likes } = await API.likePost(postId);
        const countEl = btn.querySelector('.like-count');
        if (countEl) countEl.textContent = likes;
      } catch (_) {}
    });

    // Card click opens detail on listing pages (ignore clicks on like/read-more/comments)
    document.body.addEventListener('click', (e) => {
      const card = e.target.closest('article.card');
      if (!card) return;
      if (e.target.closest('.btn-like') || e.target.closest('.read-more') || e.target.closest('.btn-toggle-comments') || e.target.closest('.comment-form') || e.target.closest('[data-hide-comments]')) return;
      const slug = card.getAttribute('data-slug');
      if (slug) window.location.href = `/post.html?slug=${encodeURIComponent(slug)}`;
    });

    // Toggle comments panel
    document.body.addEventListener('click', async (e) => {
      const toggle = e.target.closest('[data-toggle-comments]');
      if (toggle) {
        const id = toggle.getAttribute('data-toggle-comments');
        const panel = document.getElementById(`c_${id}`);
        if (!panel) return;
        const visible = panel.style.display !== 'none';
        panel.style.display = visible ? 'none' : 'block';
        if (!visible) {
          try {
            const items = await API.listComments(id);
            const list = panel.querySelector(`[data-list="${id}"]`);
            if (list) list.innerHTML = items.map(c => `<div style="border:1px solid var(--border);border-radius:6px;padding:.5rem"><strong>${escapeHtml(c.name)}</strong><div style="font-size:.9rem;color:#475569">${escapeHtml(c.content)}</div></div>`).join('');
          } catch(_){}
        }
      }
      const hideBtn = e.target.closest('[data-hide-comments]');
      if (hideBtn) {
        const id = hideBtn.getAttribute('data-hide-comments');
        const panel = document.getElementById(`c_${id}`);
        if (panel) panel.style.display = 'none';
      }
    });

    // Submit comment
    document.body.addEventListener('submit', async (e) => {
      const form = e.target.closest('.comment-form');
      if (!form) return;
      e.preventDefault();
      const postId = form.getAttribute('data-post');
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        await API.addComment(postId, data);
        form.reset();
        const list = form.parentElement.querySelector(`[data-list="${postId}"]`);
        if (list) {
          const items = await API.listComments(postId);
          list.innerHTML = items.map(c => `<div style="border:1px solid var(--border);border-radius:6px;padding:.5rem"><strong>${escapeHtml(c.name)}</strong><div style="font-size:.9rem;color:#475569">${escapeHtml(c.content)}</div></div>`).join('');
        }
      } catch(_){}
    });
  });
})();
