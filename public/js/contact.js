document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('contactStatus');
  if (!form) return;

  function setStatus(msg, type = 'info') {
    statusEl.textContent = msg;
    statusEl.className = `small text-${type}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      setStatus('Sending...', 'secondary');
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send');
      }
      form.reset();
      setStatus('Message sent successfully. We will get back to you soon.', 'success');
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Try again.', 'danger');
    }
  });
});
