import { state } from './globals.js';

export function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('nav-links-mobile-active');
    toggle.classList.toggle('mobile-toggle-active');

    // Toggle scroll lock on body
    if (nav.classList.contains('nav-links-mobile-active')) {
      document.body.style.overflow = 'hidden';
      if (state.lenis) state.lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (state.lenis) state.lenis.start();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-links-mobile-active');
      toggle.classList.remove('mobile-toggle-active');
      document.body.style.overflow = '';
      if (state.lenis) state.lenis.start();
    });
  });
}
