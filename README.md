# Binding With Books PR

A breathtaking, award-winning cinematic book PR agency web application connecting indie authors, readers, and influencers through a magical constellation of stories. Founded by Krisha Patel.

This application is custom-built with a premium **Crimson & Pearl Rose** theme and features fully interactive 3D procedural scenes.

---

## 🌟 Key Features

* **Procedural 3D WebGL Scenery**: Custom 3D book cover rendering, starlight constellations, and camera parallax scrolling built on **Three.js**.
* **Unified Scroll Interactions**: Sequential, sync-drawn timeline nodes and staggered slide-in timelines driven by **GSAP** and **ScrollTrigger**.
* **Lenis Smooth Scroll**: Silky-smooth viewport easing and scroll locks for optimal responsiveness across devices.
* **ARC Campaign Simulator**: An interactive widget showing live count-up metrics for mock ARC request and review completions.
* **Testimonials Conveyor**: Pinned reviews scrolling in opposite vertical directions.
* **Fluid Custom Cursor**: Smooth lerp tracking cursor with magnet attraction variables.
* **Fully Modular Codebase**: Styles and behaviors split cleanly by feature concern for clean maintainability.

---

## 🛠️ Technology Stack

* **Build Tool**: [Vite](https://vitejs.dev/) (v5)
* **Styling**: [Sass/SCSS](https://sass-lang.com/)
* **3D Library**: [Three.js](https://threejs.org/)
* **Animations**: [GSAP](https://gsap.com/) & [ScrollTrigger](https://gsap.com/scrolltrigger/)
* **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/)

---

## 📂 Folder Structure

```text
e:/Book/
├── index.html            # Entry HTML Document
├── package.json          # Dependency Manifest & Scripts
├── vite.config.js        # Vite Settings
├── .gitignore            # Git exclusion rules
├── README.md             # Project Documentation
└── src/
    ├── main.js           # Thin entry bootstrapper
    ├── three-scene.js    # Three.js 3D subsystem orchestrator
    ├── styles/           # Styling modules
    │   ├── index.scss    # Master import manifest
    │   ├── _variables.scss
    │   ├── _reset.scss
    │   ├── _typography.scss
    │   ├── _layout.scss
    │   ├── _webgl.scss
    │   ├── _cursor.scss
    │   ├── _buttons.scss
    │   ├── _loader.scss
    │   ├── _nav.scss
    │   ├── _hero.scss
    │   ├── _about.scss
    │   ├── _services.scss
    │   ├── _pathways.scss
    │   ├── _testimonials.scss
    │   ├── _contact.scss
    │   ├── _footer.scss
    │   └── _animations.scss
    └── js/               # Logic submodules
        ├── globals.js    # Shared state singleton
        ├── lenis.js      # Smooth scroll setup
        ├── loader.js     # preloader timer & hero intro
        ├── cursor.js     # lerp cursor & magnetic buttons
        ├── nav.js        # Mobile drawer toggle locks
        ├── services.js   # glow card offsets & ARC simulator trigger
        ├── scrollTriggers.js # GSAP pinning, timeline parallax & sweeps
        ├── about.js      # scroll synchronizers for SVG paths
        ├── pathways.js   # 3D card tilt listeners
        ├── backToTop.js  # Back-to-top buttons behaviors
        └── sectionMarkers.js # WebGL scene marker sync
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Navigate to the project root directory.
2. Install the required Node packages:
   ```bash
   npm install
   ```

### Development

Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

### Production Build

Compile and minify the project assets for deployment:
```bash
npm run build
```
Vite will output the static files inside the `dist/` directory.

### Preview Production Build

Preview the compiled bundle locally:
```bash
npm run preview
```
