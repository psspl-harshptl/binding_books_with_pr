import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './globals.js';

export function initLenis() {
  state.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  state.lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    state.lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}
