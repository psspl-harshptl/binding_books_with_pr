import { state } from './globals.js';

export function initNewsletter() {
  const form = document.getElementById('contact-newsletter-form');
  const status = document.getElementById('contact-newsletter-status');

  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.style.display = 'block';
    status.style.color = 'var(--text-dark-2)';
    status.textContent = 'Subscribing...';

    const formData = new FormData(form);
    const email = formData.get('email');
    const honeypot = formData.get('bwb_honeypot') || '';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bwb_honeypot: honeypot })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        status.style.color = '#2d7c43'; // Soft elegant green
        status.textContent = 'Thank you for subscribing! Welcome to our constellation. ✨';
        form.reset();
      } else {
        throw new Error(data.message || `Network response not ok: ${response.status}`);
      }
    } catch (err) {
      status.style.color = '#c44747'; // Crimson red
      status.textContent = 'Something went wrong. Please try again.';
      console.error('Newsletter error:', err);
    }
  });
}
