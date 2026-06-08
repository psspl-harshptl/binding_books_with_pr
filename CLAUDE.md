# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server at http://localhost:3000
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

There are no tests or linters configured in this project.

## Architecture

Single-page cinematic landing site for "Binding With Books PR". Three source files plus `index.html`:

| File | Role |
|---|---|
| `index.html` | Six full-viewport `<section>` scenes: Hero → About (Timeline) → Services → What We Do (Pathways) → Testimonials → Contact |
| `src/main.js` | Orchestrator: initialises Lenis (smooth scroll), GSAP ScrollTrigger, cursor, mobile nav, services interactivity, and connects DOM scroll events back to the WebGL scene via the `webglInstance` API |
| `src/three-scene.js` | Three.js WebGL subsystem: procedural 3D book + 2 000-particle constellation system |
| `src/style.scss` | Full site styles — design tokens as CSS custom properties at `:root`, scoped section blocks |

### WebGL ↔ DOM contract

`initThreeScene()` returns a `webglInstance` object that `main.js` calls to synchronise the 3D canvas with scroll/DOM events:

- `updateScrollProgress(0–1)` — driven by a full-page GSAP scrub; repositions the book and morphs particles through six named shapes (`galaxy → timeline → services → pathways → orbit → gather`)
- `highlightTimelineNode(idx)` — pulsed when a `.timeline-step` enters the viewport
- `activatePathwayStream(idx)` — recolours a particle stream when a `.path-section` enters the viewport
- `highlightTestimonialStar(idx)` — scales a star mesh when a `.testimonial-card` scrubs in
- `startAnimation()` — called by the loader on completion; gates the render loop

### Key design decisions

- **Lenis + GSAP ticker integration**: `lenis.raf` is called inside `gsap.ticker.add`, making Lenis the scroll driver and allowing `ScrollTrigger.update` to be fed via Lenis' scroll event.
- **Particle morphing**: all six shape arrays are pre-computed once at init (`shapes.galaxy`, etc.). `morphParticles(source, target, ratio)` linearly interpolates between them by writing directly to `BufferAttribute` positions each scroll update—no GPU compute, purely CPU per-frame.
- **Book geometry**: the front cover and each page are individual `THREE.Group` pivots rotated on the Y-axis. Open ratio is derived from `scrollProgress` (opens 0→0.3, holds 0.3→0.85, closes 0.85→1.0).
- **Glassmorphism card pattern**: `.glass-panel` utility class used throughout; mouse position is tracked per-card via CSS custom properties `--mouse-x`/`--mouse-y` for the radial glow effect on `.service-card`.

### Design tokens (CSS custom properties)

Theme is Crimson (`#6e1a24`) + Rose Gold (`#c78d92`) + Pearl Cream (`#faf6f2`). All colour, font, and transition values are declared in `:root` inside `style.scss` — edit there, not inline.

Fonts loaded from Google Fonts: `Cinzel` (serif headings, `.font-serif`) and `Plus Jakarta Sans` (body, `--font-sans`).
