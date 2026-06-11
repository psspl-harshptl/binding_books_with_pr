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

  // Initialize smooth scrolling for all anchor links
  initSmoothScrolling();
}

function initSmoothScrolling() {
  const scrollLinks = document.querySelectorAll('a[href^="#"]');

  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return; // Ignore bare hashes

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Smoothly scroll to the target element
        if (state.lenis) {
          state.lenis.scrollTo(targetElement, {
            offset: 0,
            duration: 2.5,
            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 // Smooth cubic ease-in-out
          });
        } else {
          // Fallback if Lenis is not available
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

