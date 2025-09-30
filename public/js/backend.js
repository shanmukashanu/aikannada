// Simple backend API helper
const API = (() => {
  let token = null;
  const base = '';

  function setToken(t) { token = t; }
  function getHeaders(json = true) {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async function updatePost(id, payload) {
    const res = await fetch(`${base}/api/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Update failed');
    }
    return res.json();
  }

  async function deletePost(id) {
    const res = await fetch(`${base}/api/posts/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  }

  async function uploadMulti(files, folder = 'ai-kannada') {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    form.append('folder', folder);
    const res = await fetch(`${base}/api/uploads/multi`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }

  async function login(email, password) {
    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.token);
    return data;
  }

  async function getHome(limit = 6) {
    const res = await fetch(`${base}/api/home?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load home');
    return res.json();
  }

  async function listPosts(params = {}) {
    const search = new URLSearchParams(params).toString();
    const res = await fetch(`${base}/api/posts?${search}`);
    if (!res.ok) throw new Error('Failed to load posts');
    return res.json();
  }

  async function getPostBySlug(slug) {
    const res = await fetch(`${base}/api/posts/${slug}`);
    if (!res.ok) throw new Error('Not found');
    return res.json();
  }

  async function likePost(id) {
    const res = await fetch(`${base}/api/posts/${id}/like`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to like');
    return res.json();
  }

  async function uploadImage(file, folder = 'ai-kannada') {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    const res = await fetch(`${base}/api/uploads/image`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }

  async function uploadVideo(file, folder = 'ai-kannada') {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    const res = await fetch(`${base}/api/uploads/video`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }

  async function createPost(payload) {
    const res = await fetch(`${base}/api/posts`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Create failed');
    }
    return res.json();
  }

  async function subscribe(email, name) {
    const res = await fetch(`${base}/api/subscriptions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ email, name })
    });
    return res.json();
  }

  async function listComments(postId) {
    const res = await fetch(`${base}/api/comments/post/${postId}`);
    if (!res.ok) throw new Error('Failed to load comments');
    return res.json();
  }

  async function addComment(postId, { name, email, content }) {
    const res = await fetch(`${base}/api/comments/post/${postId}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ name, email, content })
    });
    if (!res.ok) throw new Error('Failed to comment');
    return res.json();
  }

  // Admin comments
  async function listAllComments() {
    const res = await fetch(`${base}/api/comments`);
    if (!res.ok) throw new Error('Failed to load comments');
    return res.json();
  }

  async function deleteComment(id) {
    const res = await fetch(`${base}/api/comments/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to delete');
    return res.json();
  }

  return { setToken, login, getHome, listPosts, getPostBySlug, likePost, uploadImage, uploadVideo, uploadMulti, createPost, updatePost, deletePost, subscribe, listComments, addComment, listAllComments, deleteComment };
})();
