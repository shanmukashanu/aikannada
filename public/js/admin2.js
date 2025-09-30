document.addEventListener('DOMContentLoaded', () => {
  const state = { activeView: 'create' };
  const catMap = { articles: 'article', news: 'ai_news', blogs: 'blog', tech: 'ai_technology' };
  const $ = (s) => document.querySelector(s);

  const templates = {
    postForm: `
      <div class="card shadow-sm">
        <div class="card-header fw-semibold">Create / Edit Post</div>
        <div class="card-body">
          <form id="postForm">
            <input type="hidden" id="postId">
            <div class="mb-2"><label class="form-label">Title</label><input id="postTitle" class="form-control"></div>
            <div class="mb-2"><label class="form-label">Category</label><select id="postCategory" class="form-select"><option value="article">Article</option><option value="ai_news">News</option><option value="blog">Blog</option><option value="ai_technology">Tech</option></select></div>
            <div class="mb-2"><label class="form-label">Excerpt</label><textarea id="postExcerpt" class="form-control" rows="2"></textarea></div>
            <div class="mb-2"><label class="form-label">Content</label><textarea id="postContent" class="form-control" rows="6"></textarea></div>
            <div class="mb-2"><label class="form-label">Media</label><input id="postMedia" class="form-control" type="file" multiple></div>
            <div class="mb-3"><label class="form-label">Author</label><input id="postAuthor" class="form-control"></div>
            <button type="submit" class="btn btn-success">Save</button>
            <button type="button" id="postReset" class="btn btn-secondary">Reset</button>
          </form>
        </div>
      </div>`,
    importForm: `
      <div class="card shadow-sm">
        <div class="card-header fw-semibold">Import from API</div>
        <div class="card-body">
          <form id="importForm">
            <div class="input-group"><select id="impTopic" class="form-select"><option value="news">News</option><option value="tech">Tech</option></select><input id="impQuery" class="form-control" placeholder="Query..."><input id="impMax" type="number" value="10" class="form-control"><button type="submit" class="btn btn-primary">Import</button></div>
          </form>
          <div id="importStatus" class="mt-2 small text-muted"></div>
        </div>
      </div>`,
    postList: (items, view, category) => items.map(p => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div><h5 class="card-title mb-0">${p.title}</h5><p class="card-text small text-muted">${new Date(p.createdAt).toLocaleString()}</p></div>
          <div><button class="btn btn-sm btn-primary me-2" data-edit='${JSON.stringify(p)}'>Edit</button><button class="btn btn-sm btn-danger" data-del="${p._id}">Delete</button></div>
        </div>
      </div>`).join(''),
    contactList: items => items.map(c => `
      <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">${c.name} <span class="small text-muted">(${c.email})</span></h5>
          <p class="card-text">${c.message}</p>
          <button class="btn btn-sm btn-primary" data-reply='${JSON.stringify(c)}'>Reply</button>
          <button class="btn btn-sm btn-danger" data-cdel="${c._id}">Delete</button>
        </div>
      </div>`).join(''),
    commentList: items => items.map(c => `
      <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">${c.name} <span class="small text-muted">(${c.email})</span></h5>
          <p class="card-text">${c.content}</p>
          <button class="btn btn-sm btn-danger" data-cdel="${c._id}">Delete</button>
        </div>
      </div>`).join(''),
  };

  function renderView(viewId, content) { $(`#view-${viewId}`).innerHTML = content; }

  function switchView(view) {
    state.activeView = view;
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === view));
    document.querySelectorAll('.view-panel').forEach(p => p.classList.toggle('active', p.id === `view-${view}`));
    loadViewContent(view);
  }

  function loadViewContent(view) {
    if (catMap[view]) loadPosts(view, catMap[view]);
    else if (view === 'contacts') loadContacts();
    else if (view === 'comments') loadComments();
    else if (view === 'create') renderView('create', templates.postForm);
    else if (view === 'api') renderView('api', templates.importForm);
  }

  async function savePost(e) {
    e.preventDefault();
    const id = $('#postId').value;
    const payload = { title: $('#postTitle').value, category: $('#postCategory').value, excerpt: $('#postExcerpt').value, content: $('#postContent').value, author: $('#postAuthor').value };
    const files = $('#postMedia').files;
    if (files.length) payload.media = (await API.uploadMulti(files)).media;
    await (id ? API.updatePost(id, payload) : API.createPost(payload));
    switchView(Object.keys(catMap).find(k => catMap[k] === payload.category));
  }

  async function importPosts(e) {
    e.preventDefault();
    $('#importStatus').textContent = 'Importing...';
    const res = await fetch(`/api/imports/gnews?topic=${$('#impTopic').value}&query=${$('#impQuery').value}&max=${$('#impMax').value}`);
    const data = await res.json();
    $('#importStatus').textContent = `Imported ${data.imported || 0} posts.`;
  }

  async function loadPosts(view, category) {
    renderView(view, 'Loading...');
    const { items } = await API.listPosts({ category, limit: 100 });
    renderView(view, templates.postList(items, view, category));
  }

  async function loadContacts() {
    renderView('contacts', 'Loading...');
    const items = await (await fetch('/api/contact')).json();
    renderView('contacts', templates.contactList(items));
  }

  async function loadComments() {
    renderView('comments', 'Loading...');
    const items = await (await fetch('/api/comments')).json();
    renderView('comments', templates.commentList(items));
  }

  function handleEditPost(p) {
    switchView('create');
    setTimeout(() => { // Wait for render
      $('#postId').value = p._id;
      $('#postTitle').value = p.title;
      $('#postCategory').value = p.category;
      $('#postExcerpt').value = p.excerpt;
      $('#postContent').value = p.content;
      $('#postAuthor').value = p.author;
    }, 0);
  }

  function handleReply(c) {
    $('#replyId').value = c._id;
    $('#replySubject').value = `Re: Contact from ${c.name}`;
    $('#replyMessage').value = `\n\n---\nOriginal Message:\n${c.message}`;
    new bootstrap.Modal($('#replyModal')).show();
  }

  document.addEventListener('click', async (e) => {
    const editData = e.target.closest('[data-edit]')?.dataset.edit;
    const delId = e.target.closest('[data-del]')?.dataset.del;
    const cdelId = e.target.closest('[data-cdel]')?.dataset.cdel;
    const replyData = e.target.closest('[data-reply]')?.dataset.reply;

    if (editData) handleEditPost(JSON.parse(editData));
    if (delId && confirm('Delete post?')) { await API.deletePost(delId); loadViewContent(state.activeView); }
    if (cdelId && confirm('Delete?')) {
      if (state.activeView === 'comments') { await API.deleteComment(cdelId); loadComments(); }
      else if (state.activeView === 'contacts') { await fetch(`/api/contact/${cdelId}`, { method: 'DELETE' }); loadContacts(); }
    }
    if (replyData) handleReply(JSON.parse(replyData));
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'postForm') savePost(e);
    if (e.target.id === 'importForm') importPosts(e);
  });

  $('#sendReply')?.addEventListener('click', async () => {
    const id = $('#replyId').value, subject = $('#replySubject').value, message = $('#replyMessage').value;
    $('#replyStatus').textContent = 'Sending...';
    const res = await fetch(`/api/contact/${id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, message }) });
    $('#replyStatus').textContent = res.ok ? 'Sent.' : 'Failed.';
    if (res.ok) setTimeout(() => bootstrap.Modal.getInstance($('#replyModal'))?.hide(), 500);
  });

  document.querySelectorAll('.sidebar .nav-link').forEach(l => l.addEventListener('click', (e) => { e.preventDefault(); switchView(l.dataset.view); }));
  switchView('create');
});
