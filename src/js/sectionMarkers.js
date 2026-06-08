import { state } from './globals.js';

export function getAbsoluteOffsetTop(el) {
  let target = el;
  // If GSAP pinned the element, its parent is the pin-spacer
  if (el.parentNode && el.parentNode.classList.contains('pin-spacer')) {
    target = el.parentNode;
  }
  let top = 0;
  while (target) {
    top += target.offsetTop || 0;
    target = target.offsetParent;
  }
  return top;
}

export function updateSectionMarkers() {
  const sections = ['hero', 'services', 'what-we-do', 'testimonials', 'about', 'contact'];
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (totalScroll <= 0) return;

  const markers = sections.map((id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    const offsetTop = getAbsoluteOffsetTop(el);
    return Math.max(0, Math.min(offsetTop / totalScroll, 1));
  });

  if (state.webglInstance && state.webglInstance.setSectionMarkers) {
    state.webglInstance.setSectionMarkers(markers);
    // Sync current progress immediately
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const currentProgress = totalScroll > 0 ? scrollTop / totalScroll : 0;
    state.webglInstance.updateScrollProgress(currentProgress);
  }
}
