import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './globals.js';

export function initAboutSectionInteractions() {
  const path    = document.getElementById('timeline-scroll-path');
  const steps   = document.querySelectorAll('.timeline-step');
  const aboutEl = document.getElementById('about');
  if (!steps.length || !aboutEl) return;

  const mm = gsap.matchMedia();

  // Desktop/Tablet (> 768px) sticky behavior
  mm.add("(min-width: 769px)", () => {
    const SCROLL_PER_STEP = 350;
    const totalScroll     = steps.length * SCROLL_PER_STEP;
    aboutEl.style.height = `calc(100vh + ${totalScroll}px)`;

    let pLen = 0;
    if (path) {
      pLen = path.getTotalLength ? path.getTotalLength() : 600;
      path.style.strokeDasharray = `${pLen}px`;
      path.style.strokeDashoffset = `${pLen}px`;
    }

    const SPREAD_END   = 0.80;
    const stepThresholds = Array.from(steps).map((_, i) =>
      steps.length > 1 ? (i / (steps.length - 1)) * SPREAD_END : 0
    );

    function update() {
      const rect       = aboutEl.getBoundingClientRect();
      const scrolledIn = -rect.top;

      if (scrolledIn < 0) {
        steps.forEach((step, i) => {
          if (i === 0) {
            step.style.opacity   = '1';
            step.style.transform = 'translateY(0)';
          } else {
            step.style.opacity   = '0';
            step.style.transform = 'translateY(45px)';
          }
        });
        if (path) path.style.strokeDashoffset = `${pLen}px`;
        return;
      }

      const progress = Math.min(scrolledIn / totalScroll, 1);

      if (path) {
        path.style.strokeDashoffset = `${pLen * (1 - progress)}px`;
      }

      steps.forEach((step, i) => {
        if (i === 0) {
          step.style.opacity   = '1';
          step.style.transform = 'translateY(0)';
          return;
        }

        if (progress >= stepThresholds[i]) {
          if (step.style.opacity !== '1') {
            step.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            step.style.opacity    = '1';
            step.style.transform  = 'translateY(0)';
          }
        } else {
          if (step.style.opacity !== '0') {
            step.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            step.style.opacity    = '0';
            step.style.transform  = 'translateY(45px)';
          }
        }
      });

      let activeIdx = 0;
      stepThresholds.forEach((t, i) => { if (progress >= t) activeIdx = i; });
      steps.forEach((s, i) => s.classList.toggle('active-step', i === activeIdx));
      if (state.webglInstance && state.webglInstance.highlightTimelineNode) {
        state.webglInstance.highlightTimelineNode(activeIdx);
      }
    }

    if (state.lenis) state.lenis.on('scroll', update);
    window.addEventListener('scroll', update, { passive: true });
    setTimeout(update, 150);

    return () => {
      if (state.lenis) state.lenis.off('scroll', update);
      window.removeEventListener('scroll', update);
      aboutEl.style.height = '';
      steps.forEach(step => {
        step.style.opacity = '';
        step.style.transform = '';
        step.style.transition = '';
      });
    };
  });

  // Mobile (<= 768px) natural scrolling behavior with static cards
  mm.add("(max-width: 768px)", () => {
    steps.forEach(step => {
      step.style.opacity = '1';
      step.style.transform = 'translateY(0)';
      step.style.transition = 'none';
    });

    let pLen = 0;
    if (path) {
      pLen = path.getTotalLength ? path.getTotalLength() : 600;
      path.style.strokeDasharray = `${pLen}px`;
      path.style.strokeDashoffset = `${pLen}px`;
    }

    // Draw active SVG track line on scroll
    const timelineStepsContainer = document.querySelector('#about .timeline-steps');
    if (timelineStepsContainer && path) {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: timelineStepsContainer,
          start: 'top 75%',
          end: 'bottom 75%',
          scrub: true
        }
      });
    }

    // Highlight timeline nodes/steps as they cross center of viewport
    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 60%',
        end: 'bottom 60%',
        onEnter: () => {
          steps.forEach(s => s.classList.remove('active-step'));
          step.classList.add('active-step');
          if (state.webglInstance && state.webglInstance.highlightTimelineNode) {
            state.webglInstance.highlightTimelineNode(index);
          }
        },
        onEnterBack: () => {
          steps.forEach(s => s.classList.remove('active-step'));
          step.classList.add('active-step');
          if (state.webglInstance && state.webglInstance.highlightTimelineNode) {
            state.webglInstance.highlightTimelineNode(index);
          }
        }
      });
    });

    return () => {
      aboutEl.style.height = '';
      steps.forEach(step => {
        step.style.opacity = '';
        step.style.transform = '';
        step.style.transition = '';
        step.classList.remove('active-step');
      });
      if (path) {
        path.style.strokeDasharray = '';
        path.style.strokeDashoffset = '';
      }
    };
  });

  // ── Mouse-tilt on hover (only on desktop) ──
  steps.forEach(step => {
    step.addEventListener('mousemove', e => {
      if (window.innerWidth <= 768) return;
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
