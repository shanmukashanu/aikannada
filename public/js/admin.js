document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('admin-root');
  if (!root) return;

  const state = { activePanel: 'create' };

  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => el[key] = value);
    children.forEach(child => el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child));
    return el;
  }

  function render() {
    root.innerHTML = '';
    const sidebar = h('div', { className: 'sidebar' }, [
      h('h2', { style: 'padding: 0 16px; color: white;' }, 'AIK Admin'),
      ...['create', 'articles', 'blogs', 'tech', 'news', 'api'].map(id =>
        h('a', { href: '#', id: `nav-${id}`, className: state.activePanel === id ? 'active' : '' }, id.charAt(0).toUpperCase() + id.slice(1))
      )
    ]);

    const main = h('div', { className: 'main-content' }, [
      renderCreatePanel(),
      renderListPanel('articles', 'article'),
      renderListPanel('blogs', 'blog'),
      renderListPanel('tech', 'ai_technology'),
      renderListPanel('news', 'ai_news'),
      renderApiPanel(),
    ]);

    root.append(sidebar, main);
    attachListeners();
    if (state.activePanel.includes('List')) {
      loadPosts(state.activePanel.split('List')[0], state.activePanel.split('List')[0]);
    }
  }

  function renderCreatePanel() {
    return h('div', { id: 'create', className: `content-panel ${state.activePanel === 'create' ? 'active' : ''}` }, [
      h('div', { className: 'form-section' }, [
        h('h3', {}, 'Create / Edit Post'),
        h('form', { id: 'postForm' }, [
          h('input', { type: 'hidden', id: 'postId' }),
          ...Object.entries({ title: 'text', category: 'select', excerpt: 'textarea', content: 'textarea', author: 'text', imageUrl: 'url', videoUrl: 'url' }).map(([key, type]) =>
            h('div', { className: 'form-group' }, [
              h('label', { htmlFor: `post-${key}` }, key.charAt(0).toUpperCase() + key.slice(1)),
              type === 'select' ? h('select', { id: `post-${key}`, className: 'form-control' }, [
                h('option', { value: '' }, 'Select...'),
                ...['article', 'blog', 'ai_technology', 'ai_news'].map(c => h('option', { value: c }, c))
              ]) :
              type === 'textarea' ? h('textarea', { id: `post-${key}`, className: 'form-control' }) :
              h('input', { type, id: `post-${key}`, className: 'form-control' })
            ])
          ),
          h('div', { className: 'form-group' }, [
            h('label', { htmlFor: 'post-imageFile' }, 'Upload Image'),
            h('input', { type: 'file', id: 'post-imageFile', accept: 'image/*' })
          ]),
          h('div', { className: 'form-group' }, [
            h('label', { htmlFor: 'post-videoFile' }, 'Upload Video'),
            h('input', { type: 'file', id: 'post-videoFile', accept: 'video/*' })
          ]),
          h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Post')
        ])
      ])
    ]);
  }

  function renderListPanel(id, category) {
    return h('div', { id, className: `content-panel ${state.activePanel === id ? 'active' : ''}` }, [
      h('div', { className: 'list-section' }, [
        h('h3', {}, `${id.charAt(0).toUpperCase() + id.slice(1)} List`),
        h('div', { id: `${id}-list` }, 'Loading...')
      ])
    ]);
  }

  function renderApiPanel() {
    return h('div', { id: 'api', className: `content-panel ${state.activePanel === 'api' ? 'active' : ''}` }, [
      h('div', { className: 'form-section' }, [
        h('h3', {}, 'API Import'),
        h('form', { id: 'importForm' }, [
          h('select', { id: 'import-category' }, ['news', 'tech', 'articles', 'blogs'].map(c => h('option', { value: c }, c))),
          h('input', { id: 'import-query', placeholder: 'e.g., artificial intelligence' }),
          h('input', { id: 'import-max', type: 'number', value: 10 }),
          h('button', { type: 'submit' }, 'Import')
        ]),
        h('div', { id: 'import-result' })
      ])
    ]);
  }

  function attachListeners() {
    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        state.activePanel = e.target.id.replace('nav-', '');
        render();
      });
    });

    const postForm = document.getElementById('postForm');
    if (postForm) postForm.addEventListener('submit', handlePostFormSubmit);

    const importForm = document.getElementById('importForm');
    if (importForm) importForm.addEventListener('submit', handleImportFormSubmit);
  }

  async function handlePostFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('postId').value;
    const payload = {};
    ['title', 'category', 'excerpt', 'content', 'author', 'imageUrl', 'videoUrl'].forEach(key => {
      payload[key] = document.getElementById(`post-${key}`).value;
    });
    // Handle file uploads separately if needed, using API.upload...
    try {
      if (id) await API.updatePost(id, payload); else await API.createPost(payload);
      alert('Post saved');
      state.activePanel = payload.category === 'ai_news' ? 'news' : payload.category === 'ai_technology' ? 'tech' : payload.category;
      render();
    } catch (err) { alert('Save failed'); }
  }

  async function handleImportFormSubmit(e) {
    e.preventDefault();
    const topic = document.getElementById('import-category').value;
    const query = document.getElementById('import-query').value;
    const max = document.getElementById('import-max').value;
    try {
      const res = await fetch(`/api/imports/gnews?topic=${topic}&query=${query}&max=${max}`);
      const data = await res.json();
      document.getElementById('import-result').textContent = `Imported ${data.imported || 0} posts.`;
      // Refresh relevant list
    } catch (err) { alert('Import failed'); }
  }

  async function loadPosts(panelId, category) {
    const container = document.getElementById(`${panelId}-list`);
    if (!container) return;
    try {
      const { items } = await API.listPosts({ category, limit: 100 });
      container.innerHTML = '';
      items.forEach(p => {
        const itemEl = h('div', { className: 'article-item' }, [
          h('h4', {}, p.title),
          h('p', {}, `${p.category} - ${new Date(p.createdAt).toLocaleDateString()}`),
          h('button', {}, 'Edit'),
          h('button', {}, 'Delete')
        ]);
        itemEl.querySelector('button:first-of-type').addEventListener('click', () => editPost(p));
        itemEl.querySelector('button:last-of-type').addEventListener('click', () => deletePost(p._id, panelId, category));
        container.appendChild(itemEl);
      });
    } catch (err) { container.textContent = 'Failed to load posts.'; }
  }

  function editPost(post) {
    state.activePanel = 'create';
    render();
    setTimeout(() => { // Wait for render
      document.getElementById('postId').value = post._id;
      Object.keys(post).forEach(key => {
        const el = document.getElementById(`post-${key}`);
        if (el) el.value = post[key];
      });
    }, 0);
  }

  async function deletePost(id, panelId, category) {
    if (!confirm('Are you sure?')) return;
    try {
      await API.deletePost(id);
      alert('Post deleted');
      loadPosts(panelId, category);
    } catch (err) { alert('Delete failed'); }
  }

  render();
});
