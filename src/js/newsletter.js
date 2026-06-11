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
    const body = new URLSearchParams(formData);
    body.append('form-name', 'newsletter');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (response.ok) {
        status.style.color = '#2d7c43'; // Soft elegant green
        status.textContent = 'Thank you for subscribing! Welcome to our constellation. ✨';
        form.reset();
      } else {
        throw new Error('Network response not ok');
      }
    } catch (err) {
      status.style.color = '#c44747'; // Crimson red
      status.textContent = 'Something went wrong. Please try again.';
      console.error('Newsletter error:', err);
    }
  });
}
