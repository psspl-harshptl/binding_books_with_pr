import { gsap } from 'gsap';
import { state } from './globals.js';

export function initServicesLogic() {
  const serviceCards = document.querySelectorAll('.service-card');
  const arcCard = document.querySelector('.service-card[data-service="arc"]');
  const arcShowcase = document.getElementById('arc-showcase-container');
  const closeShowcase = document.querySelector('.close-showcase-btn');
  const runSim = document.querySelector('.run-sim-btn');

  // Mouse hover glowing variables update
  serviceCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  if (arcCard && arcShowcase) {
    arcCard.addEventListener('click', () => {
      arcShowcase.classList.remove('arc-showcase-hidden');
      setTimeout(() => {
        if (state.lenis) {
          state.lenis.scrollTo(arcShowcase, { offset: -100, duration: 1.5 });
        }
      }, 100);
    });
  }

  if (closeShowcase && arcShowcase) {
    closeShowcase.addEventListener('click', () => {
      arcShowcase.classList.add('arc-showcase-hidden');
    });
  }

  if (runSim) {
    runSim.addEventListener('click', () => {
      const simWrapper = document.querySelector('.arc-simulation');
      if (simWrapper) {
        if (simWrapper.classList.contains('sim-active')) return;

        simWrapper.classList.add('sim-active');
        runSim.textContent = "Simulating Campaign...";
        runSim.disabled = true;

        const requestsObj = { val: 0 };
        const reviewsObj = { val: 0 };

        gsap.to(requestsObj, {
          val: 165,
          duration: 3,
          ease: 'power2.out',
          onUpdate: () => {
            document.getElementById('sim-requests-count').textContent = Math.floor(requestsObj.val);
          }
        });

        gsap.to(reviewsObj, {
          val: 142,
          duration: 3,
          ease: 'power2.out',
          delay: 0.8,
          onUpdate: () => {
            document.getElementById('sim-reviews-count').textContent = Math.floor(reviewsObj.val);
          },
          onComplete: () => {
            setTimeout(() => {
              simWrapper.classList.remove('sim-active');
              runSim.textContent = "Rerun Simulation";
              runSim.disabled = false;
            }, 1500);
          }
        });
      }
    });
  }
}
