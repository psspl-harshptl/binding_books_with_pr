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

window.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCursor();
  initMobileMenu();
  initMagneticButtons();
  initServicesLogic();
  initAboutSectionInteractions();
  initPathwayInteractions();
  initBackToTop();

  // Initialize WebGL subsystem
  state.webglInstance = initThreeScene();

  // Set up loader, which triggers intros and un-locks 3D animation
  initLoader();

  // Connect GSAP triggers
  initScrollTriggers();

  // Register section markers calculations and updates
  setTimeout(updateSectionMarkers, 100);
  window.addEventListener('resize', updateSectionMarkers);
  ScrollTrigger.addEventListener('refresh', updateSectionMarkers);
});
