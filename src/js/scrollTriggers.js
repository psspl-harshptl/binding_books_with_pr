import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './globals.js';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function initScrollTriggers() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:100%;background:linear-gradient(90deg,#6e1a24,#c78d92);transform-origin:left center;transform:scaleX(0);z-index:9997;pointer-events:none';
  document.body.appendChild(progressBar);

  // Helper to register slide up triggers from bottom-to-top
  function registerBottomToTopReveal(target, startPercent = '88%', endPercent = '12%', yOffset = 120) {
    const responsiveY = window.innerWidth <= 768 ? Math.min(yOffset, 40) : yOffset;
    gsap.fromTo(target,
      { opacity: 0, y: responsiveY },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: target,
          start: `top ${startPercent}`,
          end: `bottom ${endPercent}`,
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Reveal Section Titles and Descriptions on scroll (from bottom to top)
  // Skip the testimonials and about headers — they are animated inside their pinned timelines.
  document.querySelectorAll('.section-header').forEach(header => {
    if (header.closest('#testimonials')) return;
    registerBottomToTopReveal(header, '88%', '12%', 100);
  });

  // Reveal main layout containers
  registerBottomToTopReveal('.services-grid', '88%', '12%', 120);
  registerBottomToTopReveal('.pathways-wrapper', '88%', '12%', 120);

  // Testimonials wrapper uses a non-reversing reveal so the header/title
  // stays visible while the section is pinned for the conveyor belt scroll.
  gsap.fromTo('.testimonials-space-wrapper',
    { opacity: 0, y: 120 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.testimonials-space-wrapper',
        start: 'top 88%',
        end: 'bottom 12%',
        toggleActions: 'play none none reverse'
      }
    }
  );

  gsap.fromTo('.contact-card',
    { opacity: 0, y: window.innerWidth <= 768 ? 40 : 120 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-card',
        start: 'top 88%',
        end: 'bottom 12%',
        toggleActions: 'play none none reverse'
      }
    }
  );

  // Scroll scrub parallax on the founder portrait frame (desktop/tablet only)
  if (document.querySelector('.portrait-frame')) {
    const mmPortrait = gsap.matchMedia();
    mmPortrait.add("(min-width: 769px)", () => {
      gsap.fromTo('.portrait-frame',
        { y: 60, scale: 0.96 },
        {
          y: -60,
          scale: 1.03,
          ease: 'none',
          scrollTrigger: {
            trigger: '.portrait-container',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      );
    });
  }

  // About section sticky header slide-up and steps container dynamic scroll to prevent vertical clipping (desktop/tablet only)
  const aboutEl = document.getElementById('about');
  const aboutHeader = document.querySelector('#about .section-header');
  const stepsContainer = document.querySelector('#about .timeline-steps');

  if (aboutEl && aboutHeader && stepsContainer) {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const getStepsOverflow = () => {
        const container = document.querySelector('#about .about-container');
        if (!container) return 0;

        const containerH = container.offsetHeight;

        // Calculate current transform Y of the steps container to compute baseline rects
        const style = window.getComputedStyle(stepsContainer);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const currentY = matrix.m42 || 0;

        const stepsRect = stepsContainer.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const stepsTopRelative = stepsRect.top - containerRect.top - currentY;
        const stepsBottomRelative = stepsTopRelative + stepsContainer.offsetHeight;

        const paddingBottom = parseFloat(window.getComputedStyle(container).paddingBottom) || 24;

        // Compute overflow with extra safety spacing at the bottom of the viewport
        const overflow = stepsBottomRelative - containerH + paddingBottom + 16;
        return Math.max(0, overflow);
      };

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: () => {
            const headerContainer = document.querySelector('#about .section-header-container');
            return `top+=${headerContainer ? headerContainer.offsetHeight : 0} top`;
          },
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      aboutTl.to(stepsContainer, {
        y: () => -getStepsOverflow(),
        duration: 1.0,
        ease: 'none'
      }, 0);
    });
  }

  // Service Cards staggered slide-up releases inside the grid
  gsap.fromTo('.service-card',
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse'
      }
    }
  );

  // Dynamic light-sweep and inner glow scroll triggers for each service card
  document.querySelectorAll('.service-card').forEach((card) => {
    gsap.set(card, {
      '--shimmer-x': '-100%',
      '--shimmer-opacity': 0,
      '--glow-opacity': 0,
      '--glow-x': '0%',
      '--glow-y': '20%',
      '--glow-brightness': 0.12
    });

    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });

    cardTl.to(card, {
      '--shimmer-x': '120%',
      '--glow-x': '100%',
      '--glow-y': '80%',
      duration: 1.0,
      ease: 'none'
    }, 0)
      .to(card, {
        '--shimmer-opacity': 1,
        '--glow-opacity': 0.8,
        duration: 0.3,
        ease: 'power1.out'
      }, 0)
      .to(card, {
        '--shimmer-opacity': 0,
        '--glow-opacity': 0,
        duration: 0.3,
        ease: 'power1.in'
      }, 0.7);
  });

  // Dynamic light-sweep and inner glow scroll triggers for each pathway card
  document.querySelectorAll('.path-section').forEach((card) => {
    gsap.set(card, {
      '--shimmer-x': '-100%',
      '--shimmer-opacity': 0,
      '--glow-opacity': 0,
      '--glow-x': '0%',
      '--glow-y': '20%',
      '--glow-brightness': 0.12
    });

    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });

    cardTl.to(card, {
      '--shimmer-x': '120%',
      '--glow-x': '100%',
      '--glow-y': '80%',
      duration: 1.0,
      ease: 'none'
    }, 0)
      .to(card, {
        '--shimmer-opacity': 1,
        '--glow-opacity': 0.8,
        duration: 0.3,
        ease: 'power1.out'
      }, 0)
      .to(card, {
        '--shimmer-opacity': 0,
        '--glow-opacity': 0,
        duration: 0.3,
        ease: 'power1.in'
      }, 0.7);
  });

  // Pathways staggered reveals from bottom to top
  gsap.fromTo('.path-section',
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.15,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: {
        trigger: '.pathways-wrapper',
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse'
      }
    }
  );

  // Set pathway highlight triggers individually
  const paths = document.querySelectorAll('.path-section');
  paths.forEach((path, index) => {
    ScrollTrigger.create({
      trigger: path,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => {
        path.classList.add('active-path');
        if (state.webglInstance && state.webglInstance.activatePathwayStream) {
          state.webglInstance.activatePathwayStream(index);
        }
      },
      onLeaveBack: () => {
        path.classList.remove('active-path');
      }
    });
  });

  // Testimonials pinned conveyor belt – columns move in OPPOSITE directions
  // while the section stays pinned so the user reads every review.
  const container = document.querySelector('.testimonials-cards-container');
  const leftCol = document.querySelector('.testimonials-col-left');
  const rightCol = document.querySelector('.testimonials-col-right');

  if (container && leftCol && rightCol) {
    const mm = gsap.matchMedia();

    // Hover stars logic for non-desktop (tablet/mobile) where scroll pin is inactive
    const allCards = container.querySelectorAll('.testimonial-card');
    allCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 1024) {
          const starIdx = parseInt(card.getAttribute('data-index') || '0', 10);
          if (state.webglInstance && state.webglInstance.highlightTestimonialStar) {
            state.webglInstance.highlightTestimonialStar(starIdx);
          }
        }
      });

      card.addEventListener('mouseleave', () => {
        if (window.innerWidth <= 1024) {
          if (state.webglInstance && state.webglInstance.highlightTestimonialStar) {
            state.webglInstance.highlightTestimonialStar(-1);
          }
        }
      });
    });

    // Mobile/Tablet (<= 1024px) horizontal pinned scrolling timeline
    mm.add("(max-width: 1024px)", () => {
      const getHorizontalOverflow = () => {
        const containerW = container.offsetWidth;
        const totalWidth = leftCol.offsetWidth + rightCol.offsetWidth + 24; // 24px is 1.5rem gap
        return Math.max(0, totalWidth - containerW + 32);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top top',
          end: () => {
            const containerW = container.offsetWidth;
            const overflow = getHorizontalOverflow();
            return `+=${overflow + containerW * 0.8}`;
          },
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            // Highlight the testimonial card closest to the container center horizontally
            const allCards = container.querySelectorAll('.testimonial-card');
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.left + containerRect.width / 2;

            let closestCard = null;
            let closestDist = Infinity;

            allCards.forEach(card => {
              const cardRect = card.getBoundingClientRect();
              const cardCenter = cardRect.left + cardRect.width / 2;
              const dist = Math.abs(cardCenter - centerX);

              if (cardRect.right > containerRect.left && cardRect.left < containerRect.right) {
                if (dist < closestDist) {
                  closestDist = dist;
                  closestCard = card;
                }
              }
            });

            allCards.forEach(c => c.classList.remove('active-testimonial'));

            if (closestCard) {
              closestCard.classList.add('active-testimonial');
              const starIdx = parseInt(closestCard.getAttribute('data-index') || '0', 10);
              if (state.webglInstance && state.webglInstance.highlightTestimonialStar) {
                state.webglInstance.highlightTestimonialStar(starIdx);
              }
            } else if (state.webglInstance && state.webglInstance.highlightTestimonialStar) {
              state.webglInstance.highlightTestimonialStar(-1);
            }
          }
        }
      });

      const header = document.querySelector('#testimonials .section-header');
      if (header) {
        tl.to(header, {
          y: -80,
          opacity: 0,
          duration: 0.25,
          ease: 'power1.out'
        }, 0);
      }

      tl.to(container, {
        y: -30,
        duration: 0.25,
        ease: 'power1.out'
      }, 0);

      // Translate both columns to the left
      tl.to([leftCol, rightCol], {
        x: () => -getHorizontalOverflow(),
        duration: 1.0,
        ease: 'none'
      }, 0);
    });

    // Pinned conveyor belt timeline only active on desktop (> 1024px)
    mm.add("(min-width: 1025px)", () => {
      // Helper functions to dynamically calculate overflows on window resize
      const getLeftOverflow = () => Math.max(0, leftCol.scrollHeight - container.offsetHeight);
      const getRightOverflow = () => Math.max(0, rightCol.scrollHeight - container.offsetHeight);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top top',
          end: () => {
            const containerH = container.offsetHeight;
            const maxOverflow = Math.max(getLeftOverflow(), getRightOverflow());
            return `+=${maxOverflow + containerH * 0.85}`;
          },
          pin: true,
          scrub: 0.3, // Reduced scrub delay to prevent lag when reversing scroll direction
          anticipatePin: 1,
          invalidateOnRefresh: true, // Recalculate values dynamically on window resize
          onUpdate: () => {
            // Highlight the testimonial card closest to the container center
            const allCards = container.querySelectorAll('.testimonial-card');
            const containerRect = container.getBoundingClientRect();
            const centerY = containerRect.top + containerRect.height / 2;

            let closestCard = null;
            let closestDist = Infinity;

            allCards.forEach(card => {
              const cardRect = card.getBoundingClientRect();
              const cardCenter = cardRect.top + cardRect.height / 2;
              const dist = Math.abs(cardCenter - centerY);

              if (cardRect.bottom > containerRect.top && cardRect.top < containerRect.bottom) {
                if (dist < closestDist) {
                  closestDist = dist;
                  closestCard = card;
                }
              }
            });

            allCards.forEach(c => c.classList.remove('active-testimonial'));

            if (closestCard) {
              closestCard.classList.add('active-testimonial');
              const starIdx = parseInt(closestCard.getAttribute('data-index') || '0', 10);
              if (state.webglInstance && state.webglInstance.highlightTestimonialStar) {
                state.webglInstance.highlightTestimonialStar(starIdx);
              }
            } else if (state.webglInstance && state.webglInstance.highlightTestimonialStar) {
              state.webglInstance.highlightTestimonialStar(-1);
            }
          }
        }
      });

      // Scroll up the section header and slide up the cards container to fully cover the viewport
      const header = document.querySelector('#testimonials .section-header');
      if (header) {
        tl.to(header, {
          y: -160,
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out'
        }, 0);
      }

      tl.to(container, {
        y: -140,
        duration: 0.3,
        ease: 'power1.out'
      }, 0);

      // Left column scrolls UPWARD: starts at natural position (first cards
      // visible), ends shifted up so last cards are visible.
      tl.to(leftCol,
        { y: () => -getLeftOverflow(), duration: 1.0, ease: 'none' },
        0
      );

      // Right column scrolls DOWNWARD (opposite): starts shifted up so last
      // cards are visible, ends at natural position showing first cards.
      tl.from(rightCol,
        { y: () => -getRightOverflow(), duration: 1.0, ease: 'none' },
        0
      );
    });
  }

  // Track scroll position to update WebGL Scene
  ScrollTrigger.create({
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      progressBar.style.transform = `scaleX(${self.progress})`;
      if (state.webglInstance && state.webglInstance.updateScrollProgress) {
        state.webglInstance.updateScrollProgress(self.progress);
      }
    }
  });

  // Fade out WebGL canvas when entering the footer
  gsap.to('#webgl-canvas', {
    opacity: 0,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: '#cinematic-footer',
      start: 'top bottom', // when the top of the footer enters the bottom of the viewport
      end: 'top 60%',      // when the top of the footer reaches 60% of the viewport height
      scrub: true
    }
  });

  // Animate section taglines with border-left sweep on scroll enter
  document.querySelectorAll('.section-tagline').forEach(tagline => {
    ScrollTrigger.create({
      trigger: tagline,
      start: 'top 88%',
      onEnter: () => tagline.classList.add('tagline-revealed'),
      onLeaveBack: () => tagline.classList.remove('tagline-revealed'),
    });
  });

  // Dynamic header nav active link highlights on scroll
  const sections = ['hero', 'services', 'what-we-do', 'testimonials', 'about', 'contact'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => activateNavLink(id),
      onEnterBack: () => activateNavLink(id)
    });
  });

  function activateNavLink(id) {
    const links = document.querySelectorAll('.nav-links .nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    });
  }
}
