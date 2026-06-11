import './styles/index.scss';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initThreeScene } from './three-scene.js';
import { state } from './js/globals.js';
import { initLenis } from './js/lenis.js';
import { initLoader } from './js/loader.js';
import { initCursor, initMagneticButtons } from './js/cursor.js';
import { initMobileMenu } from './js/nav.js';
import { initServicesLogic } from './js/services.js';
import { initAboutSectionInteractions } from './js/about.js';
import { initPathwayInteractions } from './js/pathways.js';
import { initBackToTop } from './js/backToTop.js';
import { initScrollTriggers } from './js/scrollTriggers.js';
import { updateSectionMarkers } from './js/sectionMarkers.js';
import { initCMS } from './js/cms.js';
import { initNewsletter } from './js/newsletter.js';

window.addEventListener('DOMContentLoaded', () => {
  initCMS();
  initLenis();
  initCursor();
  initMobileMenu();
  initMagneticButtons();
  initServicesLogic();
  initAboutSectionInteractions();
  initPathwayInteractions();
  initBackToTop();
  initNewsletter();

  // Initialize WebGL subsystem
  try {
    state.webglInstance = initThreeScene();
  } catch (error) {
    console.error('WebGL initialization failed. Running website in 2D fallback mode:', error);
    state.webglInstance = null;
    
    // Hide WebGL canvas to prevent visual blocking
    const canvas = document.getElementById('webgl-canvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
  }

  // Set up loader, which triggers intros and un-locks 3D animation
  initLoader();

  // Connect GSAP triggers
  initScrollTriggers();

  // Register section markers calculations and updates
  setTimeout(updateSectionMarkers, 100);
  window.addEventListener('resize', updateSectionMarkers);
  ScrollTrigger.addEventListener('refresh', updateSectionMarkers);
});
