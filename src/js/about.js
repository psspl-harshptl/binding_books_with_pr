import { gsap } from 'gsap';
import { state } from './globals.js';

export function initAboutSectionInteractions() {
  const path    = document.getElementById('timeline-scroll-path');
  const steps   = document.querySelectorAll('.timeline-step');
  const aboutEl = document.getElementById('about');
  if (!steps.length || !aboutEl) return;

  // ── Scroll space: 350px per step (1750px total for 5 steps) ─────────────
  const SCROLL_PER_STEP = 350;
  const totalScroll     = steps.length * SCROLL_PER_STEP;

  // Set section height to create scroll space (sticky container fills the viewport)
  aboutEl.style.height = `calc(100vh + ${totalScroll}px)`;

  // ── SVG path setup ────────────────────────────────────────────────────────
  let pLen = 0;
  if (path) {
    pLen = path.getTotalLength ? path.getTotalLength() : 600;
    path.style.strokeDasharray = `${pLen}px`;
    path.style.strokeDashoffset = `${pLen}px`;
  }

  // Steps spread: step[0] at 0%, step[N-1] at 88% of totalScroll
  // → only 12% (~210px) of dead scroll remains after last step appears
  const SPREAD_END   = 0.88;
  const stepThresholds = Array.from(steps).map((_, i) =>
    steps.length > 1 ? (i / (steps.length - 1)) * SPREAD_END : 0
  );

  // ── Core update — called on every scroll frame ────────────────────────────
  function update() {
    const rect       = aboutEl.getBoundingClientRect();
    const scrolledIn = -rect.top; // px scrolled past top of #about

    if (scrolledIn < 0) {
      // User hasn't reached the section yet → ensure all steps are hidden
      steps.forEach(s => {
        s.style.opacity   = '0';
        s.style.transform = 'translateY(45px)';
      });
      if (path) path.style.strokeDashoffset = `${pLen}px`;
      return;
    }

    const progress = Math.min(scrolledIn / totalScroll, 1); // 0 → 1

    // Draw SVG path
    if (path) {
      path.style.strokeDashoffset = `${pLen * (1 - progress)}px`;
    }

    // Reveal each step once its threshold is crossed
    steps.forEach((step, i) => {
      if (progress >= stepThresholds[i]) {
        // Snap in with a CSS transition (only applied once, on reveal)
        if (step.style.opacity !== '1') {
          step.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
          step.style.opacity    = '1';
          step.style.transform  = 'translateY(0)';
        }
      }
      // Once revealed, stays revealed (no reverse — mimics once:true)
    });

    // Active-step highlight: whichever step's threshold we just crossed
    let activeIdx = 0;
    stepThresholds.forEach((t, i) => { if (progress >= t) activeIdx = i; });
    steps.forEach((s, i) => s.classList.toggle('active-step', i === activeIdx));
    if (state.webglInstance && state.webglInstance.highlightTimelineNode) {
      state.webglInstance.highlightTimelineNode(activeIdx);
    }
  }

  // ── Attach to Lenis scroll (fires every RAF while scrolling) ─────────────
  if (state.lenis) state.lenis.on('scroll', update);
  // Fallback for non-Lenis or initial load
  window.addEventListener('scroll', update, { passive: true });
  // Run once on init (after a brief delay so layout is settled)
  setTimeout(update, 150);

  // ── Mouse-tilt on hover ───────────────────────────────────────────────────
  steps.forEach(step => {
    step.addEventListener('mousemove', e => {
      const r  = step.getBoundingClientRect();
      const rx = ((r.height / 2 - (e.clientY - r.top))  / (r.height / 2)) * 7;
      const ry = (((e.clientX - r.left) - r.width / 2)  / (r.width  / 2)) * -7;
      gsap.to(step, { rotateX: rx, rotateY: ry, transformPerspective: 1000, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    });
    step.addEventListener('mouseleave', () => {
      gsap.to(step, {
        rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto',
        onComplete: () => gsap.set(step, { clearProps: 'rotateX,rotateY' })
      });
    });
  });
}
