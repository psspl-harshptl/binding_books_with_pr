import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './globals.js';

export function initLoader() {
  const loader = document.getElementById('loader');
  const loaderBar = document.querySelector('.loader-bar');
  const loaderText = document.querySelector('.loader-text');

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);

      // Load completed
      setTimeout(() => {
        loaderText.textContent = "Opening the pages...";
        setTimeout(() => {
          // Fade out preloader
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
            // Recalculate ScrollTrigger positions now that DOM layout is stable
            ScrollTrigger.refresh();
            // Start entrance animations
            playHeroIntro();
            // Start WebGL rendering
            if (state.webglInstance && state.webglInstance.startAnimation) {
              state.webglInstance.startAnimation();
            }
          }, 800);
        }, 500);
      }, 200);
    }
    loaderBar.style.width = `${progress}%`;
  }, 100);
}

export function playHeroIntro() {
  const tl = gsap.timeline();

  // Fade in elements
  tl.fromTo('.logo', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
    .fromTo('.nav-link', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.6')
    .fromTo('.header-cta', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .fromTo('.hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.4')
    .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.8')
    .fromTo('.hero-actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
    .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.4')
    .fromTo('.hero-stats', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');
}
