import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './globals.js';

export function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  // Use ScrollTrigger to toggle the visible class on the button
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom 20%', // When bottom of hero is 20% past viewport top
    onEnter: () => backToTopBtn.classList.add('visible'),
    onLeaveBack: () => backToTopBtn.classList.remove('visible')
  });

  // Smooth scroll back to top using Lenis on click
  backToTopBtn.addEventListener('click', () => {
    if (state.lenis) {
      state.lenis.scrollTo(0, {
        duration: 2.5,
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 // Smooth cubic ease-in-out
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
