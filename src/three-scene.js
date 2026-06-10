import * as THREE from 'three';
import { gsap } from 'gsap';

export function initThreeScene() {
  // Elements
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return null;

  // Scene & Camera Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Global variables
  let scrollProgress = 0;
  let time = 0;
  let introStarted = false;
  let colorsResetDone = false;
  let baseTestimonialOpacity = 0.0;

  const introState = {
    xOffset: 1.5,
    scale: 0
  };

  // Base scroll variables to prevent frame vibration/fighting
  let scrollBaseX = 2.2;
  let scrollBaseY = 0.3;
  let scrollBaseZ = 0;
  let scrollBaseRotX = 0.1;
  let scrollBaseRotY = 0.2;
  let scrollBaseRotZ = -0.05;

  // Mouse coordinates (for parallax and raycasting)
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const raycaster = new THREE.Raycaster();

  /* ==========================================================================
     Lighting System - Brightened & Warmed for Crimson & Cream Theme
     ========================================================================== */
  const ambientLight = new THREE.AmbientLight(0xfffbf7, 1.2); // Warm white fill
  scene.add(ambientLight);

  const mainLight = new THREE.SpotLight(0xffffff, 5.0, 15, Math.PI / 4, 0.5, 1);
  mainLight.position.set(2, 4, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const secondaryLight = new THREE.DirectionalLight(0xcfa87b, 2.5); // Champagne Gold soft fill
  secondaryLight.position.set(-4, -2, -3);
  scene.add(secondaryLight);

  /* ==========================================================================
     Procedural 3D Book Cover & Pages
     ========================================================================== */
  const bookGroup = new THREE.Group();
  scene.add(bookGroup);

  // Helper to draw corner gold foil ornaments
  function drawCornerAccents(ctx) {
    const margin = 40;
    const size = 15;
    ctx.strokeStyle = '#cfa87b'; // gold
    ctx.lineWidth = 1.5;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(margin + size, margin);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin, margin + size);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(512 - margin - size, margin);
    ctx.lineTo(512 - margin, margin);
    ctx.lineTo(512 - margin, margin + size);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(margin + size, 768 - margin);
    ctx.lineTo(margin, 768 - margin);
    ctx.lineTo(margin, 768 - margin + size);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(512 - margin - size, 768 - margin);
    ctx.lineTo(512 - margin, 768 - margin);
    ctx.lineTo(512 - margin, 768 - margin + size);
    ctx.stroke();
  }

  // Helper to draw a sharp 8-pointed gold star
  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = '#cfa87b';
    ctx.fill();
  }

  // Helper to draw clean high-quality typography on top of the book cover
  function drawCoverTypography(ctx) {
    // Enable drop shadow for text readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.textAlign = 'center';

    // 1. Top Label (Enlarged and spaced out)
    ctx.fillStyle = '#cfa87b'; // Champagne gold
    ctx.font = '600 18px Cinzel, serif';
    // Spaced out characters for a luxurious look
    ctx.fillText('B I N D I N G   W I T H   B O O K S   P R', 256, 110);

    // Subtle divider under label
    ctx.strokeStyle = 'rgba(207, 168, 123, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(140, 130);
    ctx.lineTo(372, 130);
    ctx.stroke();

    // 2. Main Title - "A Constellation of Stories"
    ctx.fillStyle = '#faf6f2'; // Warm cream
    ctx.font = 'bold 32px Cinzel, serif';
    ctx.fillText('A CONSTELLATION', 256, 230);
    ctx.font = 'italic bold 28px Cinzel, serif';
    ctx.fillText('OF', 256, 280);
    
    // Highlight "STORIES" in gold
    ctx.fillStyle = '#cfa87b';
    ctx.font = 'bold 44px Cinzel, serif';
    ctx.fillText('STORIES', 256, 345);

    // 3. Subtitle / Tagline
    ctx.fillStyle = '#d6b3bd'; // Rose gold
    ctx.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('A Literary Constellation', 256, 400);

    // Reset shadow for celestial drawings to keep them crisp
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 4. Center Constellation Drawing (Y = 505)
    const cy = 505;
    
    // Radial glow behind star
    const glowGrad = ctx.createRadialGradient(256, cy, 0, 256, cy, 50);
    glowGrad.addColorStop(0, 'rgba(207, 168, 123, 0.12)');
    glowGrad.addColorStop(1, 'rgba(207, 168, 123, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(256, cy, 50, 0, Math.PI * 2);
    ctx.fill();

    // Outer thin gold rings
    ctx.strokeStyle = 'rgba(207, 168, 123, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, cy, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(214, 179, 189, 0.15)';
    ctx.setLineDash([4, 4]); // Dotted ring
    ctx.beginPath();
    ctx.arc(256, cy, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Elegant gold star in the center
    drawStar(ctx, 256, cy, 8, 16, 6);

    // Small decorative orbit nodes (planets/stars) on the ring
    ctx.fillStyle = '#cfa87b';
    ctx.beginPath();
    ctx.arc(256 + Math.cos(Math.PI/4) * 45, cy + Math.sin(Math.PI/4) * 45, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d6b3bd';
    ctx.beginPath();
    ctx.arc(256 + Math.cos(5*Math.PI/4) * 45, cy + Math.sin(5*Math.PI/4) * 45, 2, 0, Math.PI * 2);
    ctx.fill();

    // Re-enable shadow for footer
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // 5. Author / Founder (at bottom)
    ctx.fillStyle = '#faf6f2';
    ctx.font = '600 16px Cinzel, serif';
    ctx.fillText('KRISHA PATEL', 256, 660);
  }

  // Helper to generate cover canvas texture - Luxury Crimson & Rose Gold Theme
  function createCoverTexture() {
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 768;
    const ctx = textCanvas.getContext('2d');

    // Create CanvasTexture
    const texture = new THREE.CanvasTexture(textCanvas);

    // Deep midnight indigo/crimson to black radial vignette background (luxury manual design)
    const grad = ctx.createRadialGradient(256, 384, 10, 256, 384, 450);
    grad.addColorStop(0, '#1c1b35'); // Deep indigo core
    grad.addColorStop(0.5, '#10111e'); // Vignette transition
    grad.addColorStop(1, '#08090f'); // Black edge
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // Luxury gold foil double borders
    ctx.strokeStyle = '#cfa87b';
    ctx.lineWidth = 3;
    ctx.strokeRect(25, 25, 462, 718);

    ctx.strokeStyle = 'rgba(214, 179, 189, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(33, 33, 446, 702);

    // Draw manual corner gold brackets
    drawCornerAccents(ctx);

    // Draw typography & starmap
    drawCoverTypography(ctx);

    texture.needsUpdate = true;
    return texture;
  }

  const coverTexture = createCoverTexture();
  const coverMaterial = new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const plainCoverMaterial = new THREE.MeshStandardMaterial({
    color: 0x121826, // Midnight Navy spine/borders to match branding cover
    roughness: 0.4,
    metalness: 0.1
  });

  const pageMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaf6f2, // Warm cream paper pages
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  // Front Cover Pivot & Mesh (Shifted forward to Z=0.085 to avoid page Z-fighting)
  const frontCoverPivot = new THREE.Group();
  frontCoverPivot.position.set(0, 0, 0.085); // hinge offset
  bookGroup.add(frontCoverPivot);

  const frontCoverMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 3.0, 0.08),
    [
      plainCoverMaterial, // Right edge
      plainCoverMaterial, // Left edge
      plainCoverMaterial, // Top edge
      plainCoverMaterial, // Bottom edge
      coverMaterial,      // Front cover map
      plainCoverMaterial  // Inside cover
    ]
  );
  frontCoverMesh.position.set(-1.0, 0, 0); // Offset geometry to pivot edge
  frontCoverPivot.add(frontCoverMesh);

  // Back Cover (fixed, Shifted backward to Z=-0.095 to prevent Z-fighting)
  const backCoverMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 3.0, 0.08),
    plainCoverMaterial
  );
  backCoverMesh.position.set(-1.0, 0, -0.095);
  bookGroup.add(backCoverMesh);

  // Spine (Slightly wider Z-profile to fully encase covers)
  const spineMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 3.0, 0.22),
    plainCoverMaterial
  );
  spineMesh.position.set(0, 0, 0);
  bookGroup.add(spineMesh);

  // Fanning Pages Setup (Perfectly centered in Z to sit between covers without overlap)
  const pageMeshes = [];
  const totalPages = 14;
  const pageThickness = 0.005;

  for (let i = 0; i < totalPages; i++) {
    const pagePivot = new THREE.Group();
    // Offset page pivots in Z from -0.045 to 0.033 (prevents overlap)
    pagePivot.position.set(0, 0, -0.045 + (i * 0.006));
    bookGroup.add(pagePivot);

    const pageMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.92, 2.9, pageThickness),
      pageMaterial
    );
    pageMesh.position.set(-0.96, 0, 0); // hinge offset
    pagePivot.add(pageMesh);
    pageMeshes.push(pagePivot);
  }

  // Initial Book orientation - Right-side offset for hero section
  bookGroup.position.set(2.2, 0.3, 0);
  bookGroup.rotation.set(0.1, 0.2, -0.05);
  bookGroup.scale.set(0, 0, 0);
  bookGroup.visible = window.innerWidth > 768;

  /* ==========================================================================
     Particle Constellation System (2000 Crimson & Rose Gold Stars)
     ========================================================================== */
  const totalParticles = 120;
  const particleGeometry = new THREE.BufferGeometry();

  const currentPositions = new Float32Array(totalParticles * 3);
  const targetPositions = new Float32Array(totalParticles * 3);
  const particleColors = new Float32Array(totalParticles * 3);

  // Helper: Create circular glow particle texture in warm rose gold
  function createParticleTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const ctx = pCanvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(235, 128, 160, 0.85)'); // Soft Rose Pink glow
    grad.addColorStop(0.5, 'rgba(18, 24, 38, 0.25)'); // Subtle Navy border
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(pCanvas);
  }

  // Base configurations of shapes
  const shapes = {
    galaxy: [],      // Shape 0: Hero Galaxy
    timeline: [],    // Shape 1: About milestones
    services: [],    // Shape 2: Services clusters
    pathways: [],    // Shape 3: What We Do streams
    orbit: [],       // Shape 4: Testimonials ring
    gather: [],      // Shape 5: Contact core
    bookCluster: [], // Clustered dots inside the book
    baseColors: []   // Base particle colors
  };

  // 1. Generate Galaxy shape targets (Wide, elegant random starfield backdrop)
  for (let i = 0; i < totalParticles; i++) {
    const x = (Math.random() - 0.5) * 11;
    const y = (Math.random() - 0.5) * 7;
    const z = (Math.random() - 0.5) * 6;
    shapes.galaxy.push({ x, y, z });
  }

  // Generate Book Cluster shape targets (concentrated inside fanning pages of the book)
  for (let i = 0; i < totalParticles; i++) {
    const x = -0.2 - Math.random() * 1.6;
    const y = (Math.random() - 0.5) * 2.4;
    const z = (Math.random() - 0.5) * 0.1;
    shapes.bookCluster.push({ x, y, z });
  }

  // Generate particle spawn delays for staggered fanning-out effect
  const particleDelays = new Float32Array(totalParticles);
  for (let i = 0; i < totalParticles; i++) {
    particleDelays[i] = Math.random() * 0.5; // Stagger up to 50% of the transition time
  }

  // 2. Timeline Step node positions (forms a vertical S-curve sitting right on top of the HTML timeline path)
  const timelineNodes = [
    { x: 0.05, y: 1.6, z: -1.0 }, // Step 1
    { x: 0.15, y: 0.8, z: -1.0 },  // Step 2
    { x: 0.05, y: 0.0, z: -1.0 },  // Step 3
    { x: 0.15, y: -0.8, z: -1.0 }, // Step 4
    { x: 0.05, y: -1.6, z: -1.0 }  // Step 5
  ];

  // Draw timelines paths in space
  for (let i = 0; i < totalParticles; i++) {
    const nodeIdx = i % timelineNodes.length;
    const baseNode = timelineNodes[nodeIdx];
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const dist = 0.15 + Math.random() * 0.5;

    const x = baseNode.x + dist * Math.sin(phi) * Math.cos(theta);
    const y = baseNode.y + dist * Math.sin(phi) * Math.sin(theta);
    const z = baseNode.z + dist * Math.cos(phi);
    shapes.timeline.push({ x, y, z });
  }

  // 3. Services Grid cluster positions
  const serviceClusters = [
    { x: -2.5, y: 1.5, z: -1.5 },
    { x: 0.0, y: 1.5, z: -1.0 },
    { x: 2.5, y: 1.5, z: -1.5 },
    { x: -2.5, y: -1.5, z: -1.0 },
    { x: 0.0, y: -1.5, z: -1.5 },
    { x: 2.5, y: -1.5, z: -1.0 }
  ];

  for (let i = 0; i < totalParticles; i++) {
    const clusterIdx = i % serviceClusters.length;
    const center = serviceClusters[clusterIdx];
    const theta = Math.random() * Math.PI * 2;
    const dist = 0.1 + Math.random() * 0.6;

    const x = center.x + Math.cos(theta) * dist;
    const y = center.y + Math.sin(theta) * dist;
    const z = center.z + (Math.random() - 0.5) * 0.6;
    shapes.services.push({ x, y, z });
  }

  // 4. Pathways Bezier curves
  const curves = [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-1.5, 1.2, 0.5),
      new THREE.Vector3(-3.0, 2.0, -1.0)
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, -1.0, 0.8),
      new THREE.Vector3(2.8, -2.0, -0.5)
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.5, 0.2, 1.5),
      new THREE.Vector3(1.8, 1.0, 0.2)
    ])
  ];

  for (let i = 0; i < totalParticles; i++) {
    const pathIdx = i % 3;
    const t = Math.random();
    const curve = curves[pathIdx];
    const point = curve.getPoint(t);
    shapes.pathways.push({
      x: point.x + (Math.random() - 0.5) * 0.3,
      y: point.y + (Math.random() - 0.5) * 0.3,
      z: point.z + (Math.random() - 0.5) * 0.3
    });
  }

  // 5. Testimonial Orbit ring
  for (let i = 0; i < totalParticles; i++) {
    const angle = (i / totalParticles) * Math.PI * 2;
    const radius = 4.2 + (Math.random() - 0.5) * 0.8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 2.5;
    shapes.orbit.push({ x, y, z });
  }

  // 6. Contact gather sphere
  for (let i = 0; i < totalParticles; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const dist = Math.random() * 0.22;

    shapes.gather.push({
      x: dist * Math.sin(phi) * Math.cos(theta),
      y: dist * Math.sin(phi) * Math.sin(theta) + 0.3,
      z: dist * Math.cos(phi)
    });
  }

  // Curated Alabaster, Gold & Crimson particle color blends
  const themeColors = [
    new THREE.Color(0xa83d5a), // Cranberry Crimson
    new THREE.Color(0x8a96e8), // Lavender Blue
    new THREE.Color(0x121826), // Midnight Navy
    new THREE.Color(0xcfa87b)  // Champagne Gold
  ];

  for (let i = 0; i < totalParticles; i++) {
    currentPositions[i * 3] = shapes.galaxy[i].x;
    currentPositions[i * 3 + 1] = shapes.galaxy[i].y;
    currentPositions[i * 3 + 2] = shapes.galaxy[i].z;

    targetPositions[i * 3] = shapes.galaxy[i].x;
    targetPositions[i * 3 + 1] = shapes.galaxy[i].y;
    targetPositions[i * 3 + 2] = shapes.galaxy[i].z;

    const activeColor = themeColors[Math.floor(Math.random() * themeColors.length)];
    shapes.baseColors.push(activeColor.clone());

    particleColors[i * 3] = activeColor.r;
    particleColors[i * 3 + 1] = activeColor.g;
    particleColors[i * 3 + 2] = activeColor.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.13, // Slightly larger stardust particles
    map: createParticleTexture(),
    vertexColors: true,
    blending: THREE.NormalBlending, // Normal blending makes particles visible on light gradient backgrounds
    transparent: true,
    opacity: 0, // Set initial opacity to 0 to hide on load
    depthWrite: false,
    sizeAttenuation: true
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.visible = false; // Set initial visibility to false to hide on load
  scene.add(particleSystem);



  /* ==========================================================================
     Testimonial Galaxy Stars
     ========================================================================== */
  const testimonialStars = [];
  const starGeo = new THREE.SphereGeometry(0.15, 16, 16);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const mesh = new THREE.Mesh(
      starGeo,
      new THREE.MeshBasicMaterial({
        color: 0xcfa87b, // Champagne Gold testimonial nodes
        transparent: true,
        opacity: 0
      })
    );
    const randomY = (Math.random() - 0.5) * 1.5;
    mesh.position.set(Math.cos(angle) * 3.8, randomY, Math.sin(angle) * 3.8);
    mesh.userData = { 
      initialY: randomY,
      active: false
    };
    scene.add(mesh);
    testimonialStars.push(mesh);
  }

  /* ==========================================================================
     Interaction & Raycasting
     ========================================================================== */
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 1.2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 1.2;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* ==========================================================================
     State Updates based on Scroll - Extended Fanning Book Timeline
     ========================================================================== */
  let sectionProgressMarkers = [0.0, 0.18, 0.38, 0.58, 0.75, 0.90];

  function setSectionMarkers(markers) {
    if (Array.isArray(markers) && markers.length === 6) {
      sectionProgressMarkers = markers;
    }
  }

  function updateStateForScroll(prog) {
    scrollProgress = prog;

    // Calculate dynamic book open ratio.
    // Opens 0.0-0.2, stays open 0.2-0.90, closes 0.90-1.0.
    let openRatio = 1.0;
    if (prog <= 0.2) {
      openRatio = prog / 0.2; // opens continuously
    } else if (prog >= 0.90) {
      openRatio = Math.max(0.0, 1.0 - ((prog - 0.90) / 0.10)); // closes in final contact scene
    }

    // Apply fanning open/close rotations to front cover & pages
    frontCoverPivot.rotation.y = Math.PI * openRatio;
    pageMeshes.forEach((page, idx) => {
      const factor = idx / (totalPages + 1);
      page.rotation.y = Math.PI * factor * openRatio;
    });

    // Book 3D Coordinates & rotations
    let bx = 0.0, by = 0.0, bz = 0.0;
    let ry = 0.2;

    const wScale = Math.max(0.6, Math.min(window.innerWidth / 1440, 1.15));
    const isMobile = window.innerWidth <= 768;

    // Helper to project screen pixel coordinates to Three.js coordinates at depth Z
    const getThreeXFromPixel = (px, z = 0) => {
      const visibleHeight = 2 * Math.tan(30 * Math.PI / 180) * (5.5 - z);
      return (px - window.innerWidth / 2) * (visibleHeight / window.innerHeight);
    };

    // Closed book meshes are offset by -1.0 local, so closed book center at px requires pivot = targetX + 1.0
    const getClosedBookX = (px) => {
      return getThreeXFromPixel(px, 0) + 1.0;
    };

    // 1. Hero X position (center in the space to the right of the text content)
    let heroX = 2.6 * wScale;
    if (!isMobile) {
      const heroText = document.querySelector('.hero-text-content');
      if (heroText) {
        const rect = heroText.getBoundingClientRect();
        const targetPx = rect.right + (window.innerWidth - rect.right) / 2;
        heroX = getClosedBookX(targetPx);
      }
    }

    // 2. Services X position (center in the spacer column)
    let servicesX = -2.6 * wScale;
    if (!isMobile) {
      const servicesSpace = document.querySelector('.services-book-space');
      if (servicesSpace) {
        const rect = servicesSpace.getBoundingClientRect();
        const targetPx = rect.left + rect.width / 2;
        servicesX = getThreeXFromPixel(targetPx, 0);
      }
    }

    // 3. Communities X position (center in the spacer column)
    let communitiesX = 2.6 * wScale;
    if (!isMobile) {
      const pathwaysSpace = document.querySelector('.pathways-book-space');
      if (pathwaysSpace) {
        const rect = pathwaysSpace.getBoundingClientRect();
        const targetPx = rect.left + rect.width / 2;
        communitiesX = getThreeXFromPixel(targetPx, 0);
      }
    }

    // 4. Testimonials X position (center in the spacer column)
    let testimonialsX = -2.6 * wScale;
    if (!isMobile) {
      const testimonialsSpace = document.querySelector('.testimonials-book-space');
      if (testimonialsSpace) {
        const rect = testimonialsSpace.getBoundingClientRect();
        const targetPx = rect.left + rect.width / 2;
        testimonialsX = getThreeXFromPixel(targetPx, 0);
      }
    }

    // 5. Founder X & Y position (center inside the gold portal frame)
    let founderX = 2.8 * wScale;
    let founderY = 0.0;
    if (!isMobile) {
      const portal = document.querySelector('.portrait-gold-portal');
      if (portal) {
        const rect = portal.getBoundingClientRect();
        const targetPxX = rect.left + rect.width / 2;
        const targetPxY = rect.top + rect.height / 2;
        founderX = getThreeXFromPixel(targetPxX, -1.5);
        const visibleHeightAtFounder = 2 * Math.tan(30 * Math.PI / 180) * (5.5 - (-1.5));
        founderY = -(targetPxY - window.innerHeight / 2) * (visibleHeightAtFounder / window.innerHeight);
      }
    }

    // 6. Contact X & Y position (center inside the closing book placeholder)
    let contactX = 2.6 * wScale;
    let contactY = 0.3;
    if (!isMobile) {
      const contactSpace = document.querySelector('.closing-book-placeholder');
      if (contactSpace) {
        const rect = contactSpace.getBoundingClientRect();
        const targetPxX = rect.left + rect.width / 2;
        const targetPxY = rect.top + rect.height / 2;
        contactX = getThreeXFromPixel(targetPxX, 0);
        const visibleHeightAtContact = 2 * Math.tan(30 * Math.PI / 180) * 5.5;
        contactY = -(targetPxY - window.innerHeight / 2) * (visibleHeightAtContact / window.innerHeight);
      }
    }

    // Define states for key sections
    const states = {
      hero: {
        bx: isMobile ? 0.0 : heroX,
        by: isMobile ? -0.5 : 0.0,
        bz: 0.0,
        ry: 0.2
      },
      services: {
        bx: isMobile ? 0.0 : servicesX,
        by: isMobile ? 0.3 : 0.0,
        bz: 0.0,
        ry: Math.PI * 0.8
      },
      communities: {
        bx: isMobile ? 0.0 : communitiesX,
        by: isMobile ? 0.3 : 0.0,
        bz: 0.0,
        ry: 0.2
      },
      testimonials: {
        bx: isMobile ? 0.0 : testimonialsX,
        by: isMobile ? 0.3 : 0.0,
        bz: 0.0,
        ry: Math.PI * 0.8
      },
      founder: {
        bx: isMobile ? 0.0 : founderX,
        by: isMobile ? 0.0 : founderY,
        bz: -1.5,
        ry: Math.PI * 0.35
      },
      contact: {
        bx: isMobile ? 0.0 : contactX,
        by: isMobile ? 0.3 : contactY,
        bz: 0.0,
        ry: 0.2
      }
    };

    // Interpolation Helper
    function lerp(start, end, amt) {
      return start + (end - start) * amt;
    }

    function interpolateStates(stateA, stateB, amt) {
      bx = lerp(stateA.bx, stateB.bx, amt);
      by = lerp(stateA.by, stateB.by, amt);
      bz = lerp(stateA.bz, stateB.bz, amt);
      ry = lerp(stateA.ry, stateB.ry, amt);
    }

    const m = sectionProgressMarkers;
    const tWidth = 0.04; // Transition scroll range (starts at m[i] - tWidth and completes at m[i])

    if (prog <= m[1] - tWidth) {
      // Hero steady
      bx = states.hero.bx;
      by = states.hero.by;
      bz = states.hero.bz;
      ry = states.hero.ry;
    }
    else if (prog > m[1] - tWidth && prog <= m[1]) {
      // Hero -> Services transition (pre-section boundary)
      const r = (prog - (m[1] - tWidth)) / tWidth;
      interpolateStates(states.hero, states.services, r);
    }
    else if (prog > m[1] && prog <= m[2] - tWidth) {
      // Services steady
      bx = states.services.bx;
      by = states.services.by;
      bz = states.services.bz;
      ry = states.services.ry;
    }
    else if (prog > m[2] - tWidth && prog <= m[2]) {
      // Services -> Communities transition (pre-section boundary)
      const r = (prog - (m[2] - tWidth)) / tWidth;
      interpolateStates(states.services, states.communities, r);
    }
    else if (prog > m[2] && prog <= m[3] - tWidth) {
      // Communities steady
      bx = states.communities.bx;
      by = states.communities.by;
      bz = states.communities.bz;
      ry = states.communities.ry;
    }
    else if (prog > m[3] - tWidth && prog <= m[3]) {
      // Communities -> Testimonials transition (pre-section boundary)
      const r = (prog - (m[3] - tWidth)) / tWidth;
      interpolateStates(states.communities, states.testimonials, r);
    }
    else if (prog > m[3] && prog <= m[4]) {
      // Testimonials -> Founder transition
      // We calculate a dynamic unpin range based on viewport height relative to total scroll height
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const unpinRange = totalScroll > 0 ? window.innerHeight / totalScroll : 0.12;

      const transitionStart = m[4] - unpinRange;
      const transitionDuration = unpinRange * 0.55;
      const transitionEnd = transitionStart + transitionDuration;

      if (prog <= transitionStart) {
        // Testimonials steady (keep on left while pinned)
        bx = states.testimonials.bx;
        by = states.testimonials.by;
        bz = states.testimonials.bz;
        ry = states.testimonials.ry;
      } else if (prog > transitionStart && prog <= transitionEnd) {
        // Dynamic early transition to the right side
        const r = (prog - transitionStart) / transitionDuration;
        interpolateStates(states.testimonials, states.founder, r);
      } else {
        // Already fully transitioned to the right side (founder state)
        bx = states.founder.bx;
        by = states.founder.by;
        bz = states.founder.bz;
        ry = states.founder.ry;
      }
    }
    else if (prog > m[4] && prog <= m[5] - tWidth) {
      // Founder steady (Mobile starts sliding away in the second half of Founder)
      const mid = m[4] + (m[5] - tWidth - m[4]) / 2;
      if (isMobile) {
        if (prog <= mid) {
          bx = states.founder.bx;
          by = states.founder.by;
          bz = states.founder.bz;
          ry = states.founder.ry;
        } else {
          const r2 = (prog - mid) / ((m[5] - tWidth) - mid);
          bx = 0.0;
          by = 0.0 - r2 * 4.0; // Slide down out of viewport
          bz = -1.5 - r2 * 5.0; // Push deep
          ry = Math.PI * 0.65;
        }
      } else {
        bx = states.founder.bx;
        by = states.founder.by;
        bz = states.founder.bz;
        ry = states.founder.ry;
      }
    }
    else if (prog > m[5] - tWidth && prog <= m[5]) {
      // Founder -> Contact transition (pre-section boundary)
      const r = (prog - (m[5] - tWidth)) / tWidth;

      if (isMobile) {
        // On mobile, rise from the bottom to contact position
        bx = 0.0;
        by = -4.0 + r * 4.3; // Rises back to 0.3
        bz = -6.5 + r * 6.5; // Moves to 0.0
        ry = Math.PI * 0.65 + r * (0.2 - Math.PI * 0.65);
      } else {
        interpolateStates(states.founder, states.contact, r);
      }
    }
    else {
      // Contact steady
      bx = states.contact.bx;
      by = states.contact.by;
      bz = states.contact.bz;
      ry = states.contact.ry;
    }

    scrollBaseX = bx;
    scrollBaseY = by;
    scrollBaseZ = bz;
    scrollBaseRotY = ry;
    scrollBaseRotZ = -0.05 * (1.0 - openRatio);
    bookGroup.visible = !isMobile;

    // Rotate slightly on final Contact close
    if (prog >= m[5]) {
      const r = (prog - m[5]) / (1.0 - m[5] || 0.1);
      scrollBaseRotX = r * 0.05;
    } else {
      scrollBaseRotX = 0;
    }

    // Set particle morphs and star opacities using the dynamic section bounds
    if (prog <= m[1]) {
      if (prog > 0.12) {
        // Reset colors once when exiting the spawn zone
        if (!colorsResetDone) {
          const colorAttr = particleGeometry.attributes.color;
          for (let i = 0; i < totalParticles; i++) {
            const baseColor = shapes.baseColors[i];
            colorAttr.setXYZ(i, baseColor.r, baseColor.g, baseColor.b);
          }
          colorAttr.needsUpdate = true;
          colorsResetDone = true;
        }
        morphParticles('galaxy', 'services', 0.0);
      } else {
        colorsResetDone = false;
      }
      baseTestimonialOpacity = 0.0;
    } else if (prog > m[1] && prog <= m[2]) {
      const r = (prog - m[1]) / (m[2] - m[1]);
      morphParticles('galaxy', 'services', r);
      baseTestimonialOpacity = 0.0;
    } else if (prog > m[2] && prog <= m[3]) {
      const r = (prog - m[2]) / (m[3] - m[2]);
      morphParticles('services', 'pathways', r);
      baseTestimonialOpacity = 0.0;
    } else if (prog > m[3] && prog <= m[4]) {
      const r = (prog - m[3]) / (m[4] - m[3]);
      morphParticles('pathways', 'orbit', r);
      baseTestimonialOpacity = r * 0.8;
    } else if (prog > m[4] && prog <= m[5]) {
      const r = (prog - m[4]) / (m[5] - m[4]);
      morphParticles('orbit', 'timeline', r);
      baseTestimonialOpacity = (1.0 - r) * 0.8;
    } else {
      const r = Math.min(1.0, (prog - m[5]) / (1.0 - m[5] || 0.1));
      morphParticles('timeline', 'gather', r);
      baseTestimonialOpacity = 0.0;
    }
  }

  // Linear interpolation morphing function
  function morphParticles(sourceKey, targetKey, ratio) {
    const posAttr = particleGeometry.attributes.position;
    const sourceArr = shapes[sourceKey];
    const targetArr = shapes[targetKey];

    const clampRatio = Math.max(0, Math.min(ratio, 1.0));

    for (let i = 0; i < totalParticles; i++) {
      const src = sourceArr[i];
      const dest = targetArr[i];

      posAttr.setXYZ(
        i,
        src.x + (dest.x - src.x) * clampRatio,
        src.y + (dest.y - src.y) * clampRatio,
        src.z + (dest.z - src.z) * clampRatio
      );
    }
    posAttr.needsUpdate = true;
  }

  /* ==========================================================================
     External API Hooks
     ========================================================================== */
  function highlightTimelineNode(idx) {
    if (idx < 0 || idx >= timelineNodes.length) return;

    // Stardust golden flare near active node position
    const targetNodePos = timelineNodes[idx];
    const colorAttr = particleGeometry.attributes.color;
    const activeColor = new THREE.Color(0xffe29a); // Bright starlight gold
    const defaultColors = [
      new THREE.Color(0xa83d5a), // Cranberry Crimson
      new THREE.Color(0x8a96e8)  // Lavender Blue
    ];

    for (let i = 0; i < totalParticles; i++) {
      const posAttr = particleGeometry.attributes.position;
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      const pz = posAttr.getZ(i);

      const dist = Math.hypot(px - targetNodePos.x, py - targetNodePos.y, pz - targetNodePos.z);
      if (dist < 1.0) {
        colorAttr.setXYZ(i, activeColor.r, activeColor.g, activeColor.b);
      } else {
        const randColor = defaultColors[i % defaultColors.length];
        colorAttr.setXYZ(i, randColor.r, randColor.g, randColor.b);
      }
    }
    colorAttr.needsUpdate = true;
  }

  function activatePathwayStream(idx) {
    const colorAttr = particleGeometry.attributes.color;
    const activeColor = themeColors[0]; // Highlight stream in Crimson
    const defaultLavender = themeColors[1];
    const defaultCream = themeColors[2];

    for (let i = 0; i < totalParticles; i++) {
      if (i % 3 === idx) {
        colorAttr.setXYZ(i, activeColor.r, activeColor.g, activeColor.b);
      } else {
        const defaultColor = i % 2 === 0 ? defaultLavender : defaultCream;
        colorAttr.setXYZ(i, defaultColor.r, defaultColor.g, defaultColor.b);
      }
    }
    colorAttr.needsUpdate = true;
  }

  function highlightTestimonialStar(idx) {
    testimonialStars.forEach((star, index) => {
      star.userData.active = (index === idx);
    });
  }

  /* ==========================================================================
     Animation Loop
     ========================================================================== */
  function animate() {
    requestAnimationFrame(animate);

    time += 0.005;

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    if (introStarted) {
      // Smooth floating offset in Y
      const floatY = Math.sin(time * 3.0) * 0.08;

      // Smooth mouse parallax rotation offsets
      const mouseRotX = mouse.y * 0.15;
      const mouseRotY = mouse.x * 0.15;

      // Set combined position and rotation to prevent scroll fighting/vibration
      bookGroup.position.set(scrollBaseX + introState.xOffset, scrollBaseY + floatY, scrollBaseZ);
      bookGroup.scale.set(introState.scale, introState.scale, introState.scale);
      bookGroup.rotation.set(
        scrollBaseRotX + mouseRotX,
        scrollBaseRotY + mouseRotY,
        scrollBaseRotZ
      );

      // Manage particle system visibility and opacity to prevent showing dots initially
      if (scrollProgress < 0.015) {
        particleSystem.visible = false;
        particleMaterial.opacity = 0;
      } else {
        particleSystem.visible = true;
        if (scrollProgress <= 0.08) {
          particleMaterial.opacity = (scrollProgress - 0.015) / 0.065;
        } else {
          particleMaterial.opacity = 1.0;
        }
      }

      // Floating dust rotation in space
      // Scale down the particle system rotation when scrollProgress is small to keep particles inside the fanning book
      const rotationScale = Math.max(0.0, Math.min((scrollProgress - 0.02) / 0.10, 1.0));
      particleSystem.rotation.y = time * 0.08 * rotationScale;
      particleSystem.rotation.x = Math.sin(time * 0.05) * 0.04 * rotationScale;

      // When in the birth spawn zone (hero screen), update particle positions and colors to fly out from the fanning pages
      if (scrollProgress <= 0.12) {
        bookGroup.updateMatrixWorld(true);
        particleSystem.updateMatrixWorld(true);

        const posAttr = particleGeometry.attributes.position;
        const colorAttr = particleGeometry.attributes.color;
        const spawnProgress = scrollProgress / 0.12;
        const tempVec = new THREE.Vector3();

        for (let i = 0; i < totalParticles; i++) {
          // 1. Get cluster coordinate inside the book in local space of bookGroup
          tempVec.set(
            shapes.bookCluster[i].x,
            shapes.bookCluster[i].y,
            shapes.bookCluster[i].z
          );

          // 2. Transform local book position to world coordinates
          tempVec.applyMatrix4(bookGroup.matrixWorld);

          // 3. Transform world coordinates to local coordinates of particleSystem
          particleSystem.worldToLocal(tempVec);

          // 4. Staggered individual progress
          const delay = particleDelays[i];
          const p_i = Math.max(0.0, Math.min((spawnProgress - delay) / (1.0 - delay), 1.0));

          // 5. Interpolate position
          const targetX = shapes.galaxy[i].x;
          const targetY = shapes.galaxy[i].y;
          const targetZ = shapes.galaxy[i].z;

          posAttr.setXYZ(
            i,
            tempVec.x + (targetX - tempVec.x) * p_i,
            tempVec.y + (targetY - tempVec.y) * p_i,
            tempVec.z + (targetZ - tempVec.z) * p_i
          );

          // 6. Set color directly (no black multiplication to avoid black dots on light background)
          const baseColor = shapes.baseColors[i];
          colorAttr.setXYZ(
            i,
            baseColor.r,
            baseColor.g,
            baseColor.b
          );
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
      }

      // Floating testimonial stars rotation with bounded sin float and smooth 3D active scale/opacity transitions
      testimonialStars.forEach((star, index) => {
        star.position.y = star.userData.initialY + Math.sin(time * 2.0 + index) * 0.06;
        star.rotation.y += 0.01;

        // Target scale and opacity based on active focus and section progress
        let targetScale = 1.0;
        let targetOpacity = baseTestimonialOpacity * 0.45; // Faint background stars

        if (star.userData.active) {
          targetScale = 2.2;
          targetOpacity = 1.0;
        }

        // Smoothly interpolate (lerp) scale and opacity
        star.scale.x += (targetScale - star.scale.x) * 0.1;
        star.scale.y += (targetScale - star.scale.y) * 0.1;
        star.scale.z += (targetScale - star.scale.z) * 0.1;

        star.material.opacity += (targetOpacity - star.material.opacity) * 0.1;
      });

      raycaster.setFromCamera(mouse, camera);
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bookGroup.visible = window.innerWidth > 768;
  });

  function startAnimation() {
    introStarted = true;

    // Smooth cinematic fade-in/slide-in for the book to match hero text reveal timing
    gsap.to(introState, {
      scale: 1,
      xOffset: 0,
      duration: 1.8,
      ease: 'power3.out',
      delay: 0.6
    });
  }

  animate();

  return {
    updateScrollProgress: updateStateForScroll,
    highlightTimelineNode,
    activatePathwayStream,
    highlightTestimonialStar,
    setSectionMarkers,
    startAnimation
  };
}
