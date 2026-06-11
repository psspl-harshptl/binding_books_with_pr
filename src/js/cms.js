import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './globals.js';

const SESSION_TOKEN_KEY = 'bwb_admin_token';

export function initCMS() {
  fetchTestimonials()
    .then(testimonials => {
      if (testimonials) {
        applyTestimonialsToDOM(testimonials);
      }
      createCMSDOM();
    })
    .catch(err => {
      console.error("Failed to initialize testimonials from backend server:", err);
      createCMSDOM();
    });
}

async function fetchTestimonials() {
  try {
    const res = await fetch('/api/testimonials');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching testimonials from API:", e);
    return null;
  }
}

function getAuthHeaders() {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Helper to extract first and last word initials (e.g. "Sarah J. Maas" -> "SM")
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);
  return (firstInitial + lastInitial).toUpperCase();
}

// Helper to render premium SVG gradient stars for half-star values
function renderStars(rating, idPrefix) {
  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    const starIndex = i;
    let fill = 0;
    if (rating >= starIndex + 1) {
      fill = 100;
    } else if (rating > starIndex) {
      fill = (rating - starIndex) * 100; // e.g. 0.5 * 100 = 50%
    }
    
    const gradId = `${idPrefix}-star-grad-${starIndex}`;
    starsHtml += `
      <svg class="cms-star-svg" viewBox="0 0 24 24" width="18" height="18" style="vertical-align: middle; margin-right: 2px;">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="${fill}%" stop-color="var(--accent-gold)" />
            <stop offset="${fill}%" stop-color="rgba(168, 61, 90, 0.12)" />
          </linearGradient>
        </defs>
        <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" fill="url(#${gradId})" />
      </svg>
    `;
  }
  return starsHtml;
}

export function applyTestimonialsToDOM(testimonials) {
  const leftCol = document.querySelector('.testimonials-col-left');
  const rightCol = document.querySelector('.testimonials-col-right');
  
  if (!leftCol || !rightCol) return;
  
  leftCol.innerHTML = '';
  rightCol.innerHTML = '';
  
  testimonials.forEach((testimonial, index) => {
    let avatarMarkup = '';
    if (testimonial.avatar && (testimonial.avatar.startsWith('data:') || testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/'))) {
      avatarMarkup = `<img src="${escapeHTML(testimonial.avatar)}" class="author-avatar-img" alt="${escapeHTML(testimonial.name)}" />`;
    } else {
      avatarMarkup = escapeHTML(testimonial.avatar || getInitials(testimonial.name));
    }

    const cardMarkup = `
      <div class="testimonial-card glass-panel" data-index="${index}">
        <div class="star-rating" style="display: flex; margin-bottom: 0.75rem;">
          ${renderStars(testimonial.stars, `landing-${index}`)}
        </div>
        <p class="testimonial-quote">"${escapeHTML(testimonial.quote)}"</p>
        <div class="testimonial-author">
          <div class="author-avatar">${avatarMarkup}</div>
          <div class="author-info">
            <strong>${escapeHTML(testimonial.name)}</strong>
            <span>${escapeHTML(testimonial.subtitle)}</span>
          </div>
        </div>
      </div>
    `;
    
    if (index % 2 === 0) {
      leftCol.insertAdjacentHTML('beforeend', cardMarkup);
    } else {
      rightCol.insertAdjacentHTML('beforeend', cardMarkup);
    }
  });

  const container = document.querySelector('.testimonials-cards-container');
  if (container) {
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
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createCMSDOM() {
  if (document.getElementById('cms-trigger')) return;

  // 1. Floating Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.id = 'cms-trigger';
  triggerBtn.className = 'cms-trigger-btn';
  triggerBtn.setAttribute('aria-label', 'Open Testimonial Admin Login');
  triggerBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `;
  document.body.appendChild(triggerBtn);

  // 2. Modal Overlay Structure
  const modal = document.createElement('div');
  modal.id = 'cms-modal';
  modal.className = 'cms-modal';
  modal.innerHTML = `
    <div class="cms-modal-content glass-panel" data-lenis-prevent>
      <button class="cms-close-btn" id="cms-close" aria-label="Close Modal">&times;</button>
      
      <!-- View 1: Admin Login -->
      <div id="cms-login-view">
        <h2 class="cms-modal-title font-serif">Admin Login</h2>
        <p class="cms-modal-subtitle">Authorized access only. Enter admin passkey.</p>
        <form id="cms-login-form" class="cms-form">
          <div class="cms-form-group">
            <label for="field-login-pass">Admin Password</label>
            <input type="password" id="field-login-pass" required placeholder="••••••••">
          </div>
          <div id="login-error-msg" class="cms-error-msg" style="display: none; color: #d94343; font-size: 0.85rem; margin-top: -0.5rem; font-weight: 500;"></div>
          <button type="submit" class="cms-btn cms-btn-primary" style="width: 100%; margin-top: 0.5rem;">Access Panel</button>
        </form>
      </div>

      <!-- View 2: CMS Main Panel -->
      <div id="cms-main-view" style="display: none;">
        <h2 class="cms-modal-title font-serif">Testimonials Admin</h2>
        <p class="cms-modal-subtitle" style="margin-bottom: 1.5rem;">Configure site reviews dynamically — <span class="cms-logout-link" id="cms-logout-btn">Logout</span></p>
        <div class="cms-testimonials-list" id="cms-list"></div>
        <div class="cms-actions">
          <button class="cms-btn cms-btn-primary" id="cms-add-btn">+ Add Testimonial</button>
          <button class="cms-btn cms-btn-secondary" id="cms-reset-btn">Reset Defaults</button>
        </div>
      </div>
      
      <!-- View 3: Testimonial Add/Edit Form -->
      <div id="cms-form-view" style="display: none;">
        <h2 class="cms-modal-title font-serif" id="cms-form-title">Add Testimonial</h2>
        <p class="cms-modal-subtitle" id="cms-form-subtitle">Enter details below</p>
        <form id="cms-testimonial-form" class="cms-form">
          <div class="cms-form-fields">
            <input type="hidden" id="field-index" value="">
            
            <div class="cms-form-group">
              <label for="field-name">Author Name</label>
              <input type="text" id="field-name" required placeholder="e.g. Sarah J. Maas">
            </div>
            
            <div class="cms-form-group">
              <label for="field-subtitle">Author Role / Subtitle</label>
              <input type="text" id="field-subtitle" required placeholder="e.g. Fantasy Author">
            </div>

            <!-- Custom Image Upload & Preview Row -->
            <div class="cms-form-group">
              <label>Avatar Photo</label>
              <div class="cms-upload-row">
                <div class="cms-avatar-preview" id="cms-preview-avatar">SJM</div>
                <div class="cms-upload-actions">
                  <button type="button" class="cms-btn-upload" id="cms-upload-trigger-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload Image
                  </button>
                  <button type="button" class="cms-btn-remove" id="cms-clear-image-btn" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Remove
                  </button>
                  <input type="file" id="field-image-input" accept="image/*" style="display: none;">
                  <input type="hidden" id="field-avatar-data" value="">
                </div>
              </div>
            </div>

            <!-- Half-Star Interactive Selector -->
            <div class="cms-form-group">
              <label>Rating: <span id="cms-star-value" class="gold-text" style="font-weight: 700;">5.0</span> Stars</label>
              <div class="cms-star-selector" id="cms-star-selector">
                ${renderSelectorStars()}
              </div>
              <input type="hidden" id="field-stars" value="5.0">
            </div>
            
            <div class="cms-form-group">
              <label for="field-quote">Quote</label>
              <textarea id="field-quote" required rows="4" placeholder="Write the review here..."></textarea>
            </div>
          </div>
          
          <div class="cms-form-actions">
            <button type="submit" class="cms-btn cms-btn-primary" id="cms-save-btn">Save Changes</button>
            <button type="button" class="cms-btn cms-btn-secondary" id="cms-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>

      <!-- View 4: Canvas Reposition / Zoom Crop View -->
      <div id="cms-crop-view" style="display: none; text-align: center;">
        <h2 class="cms-modal-title font-serif">Adjust Profile Photo</h2>
        <p class="cms-modal-subtitle">Drag image to center, slide zoom bar to adjust</p>
        
        <div class="cms-crop-box-container" id="cms-crop-container-box">
          <img id="cms-crop-image-element" src="" style="position: absolute; top: 0; left: 0; transform-origin: top left; cursor: move; pointer-events: none; max-width: none; max-height: none;" />
          <div class="cms-crop-circle-mask"></div>
        </div>

        <div class="cms-form-group" style="margin: 1.5rem 0;">
          <label for="cms-crop-zoom-slider" style="margin-bottom: 0.5rem; display: block;">Zoom Size</label>
          <input type="range" id="cms-crop-zoom-slider" min="1.0" max="4.0" step="0.05" value="1.0" style="width: 100%; cursor: pointer;">
        </div>

        <div class="cms-form-actions" style="justify-content: center;">
          <button type="button" class="cms-btn cms-btn-primary" id="cms-crop-apply-btn">Apply & Crop</button>
          <button type="button" class="cms-btn cms-btn-secondary" id="cms-crop-cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Selector stars initial elements setup
  setupStarSelectorEvents();

  // Grab element hooks
  const closeBtn = document.getElementById('cms-close');
  const triggerBtnEl = document.getElementById('cms-trigger');
  
  const loginView = document.getElementById('cms-login-view');
  const loginForm = document.getElementById('cms-login-form');
  const loginError = document.getElementById('login-error-msg');
  
  const mainView = document.getElementById('cms-main-view');
  const addBtn = document.getElementById('cms-add-btn');
  const resetBtn = document.getElementById('cms-reset-btn');
  const logoutBtn = document.getElementById('cms-logout-btn');
  
  const formView = document.getElementById('cms-form-view');
  const testimonialForm = document.getElementById('cms-testimonial-form');
  const cancelBtn = document.getElementById('cms-cancel-btn');
  
  // Image upload elements
  const uploadTrigger = document.getElementById('cms-upload-trigger-btn');
  const clearImgBtn = document.getElementById('cms-clear-image-btn');
  const fileInput = document.getElementById('field-image-input');
  const avatarPreview = document.getElementById('cms-preview-avatar');
  const avatarData = document.getElementById('field-avatar-data');
  const nameInput = document.getElementById('field-name');

  // Cropping view elements
  const cropView = document.getElementById('cms-crop-view');
  const cropContainer = document.getElementById('cms-crop-container-box');
  const cropImage = document.getElementById('cms-crop-image-element');
  const zoomSlider = document.getElementById('cms-crop-zoom-slider');
  const cropApplyBtn = document.getElementById('cms-crop-apply-btn');
  const cropCancelBtn = document.getElementById('cms-crop-cancel-btn');

  // Cropping state parameters
  let rawImageSrc = '';
  let panX = 0;
  let panY = 0;
  let scale = 1.0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let imgLayoutW = 0;
  let imgLayoutH = 0;

  // Lock scrolling helper
  const lockScroll = () => {
    document.body.classList.add('cms-modal-open');
    if (state.lenis) state.lenis.stop();
  };

  const unlockScroll = () => {
    document.body.classList.remove('cms-modal-open');
    if (state.lenis) state.lenis.start();
  };

  // Open CMS Modal
  triggerBtnEl.addEventListener('click', () => {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    modal.classList.add('active');
    lockScroll();
    
    if (token) {
      loginView.style.display = 'none';
      mainView.style.display = 'block';
      formView.style.display = 'none';
      cropView.style.display = 'none';
      renderCMSList();
    } else {
      loginView.style.display = 'block';
      mainView.style.display = 'none';
      formView.style.display = 'none';
      cropView.style.display = 'none';
      loginForm.reset();
      loginError.style.display = 'none';
    }
  });

  // Close CMS Dialog
  const closeModal = () => {
    modal.classList.remove('active');
    unlockScroll();
    setTimeout(() => {
      loginView.style.display = 'none';
      mainView.style.display = 'none';
      formView.style.display = 'none';
      cropView.style.display = 'none';
      testimonialForm.reset();
      loginForm.reset();
      loginError.style.display = 'none';
      avatarData.value = '';
      avatarPreview.innerHTML = 'SJM';
      clearImgBtn.style.display = 'none';
    }, 400);
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const password = document.getElementById('field-login-pass').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
        loginView.style.display = 'none';
        mainView.style.display = 'block';
        renderCMSList();
      } else {
        loginError.textContent = data.message || 'Access Denied. Check password.';
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.textContent = 'Server communication error.';
      loginError.style.display = 'block';
      console.error(err);
    }
  });

  // Logout Click
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    mainView.style.display = 'none';
    loginView.style.display = 'block';
    loginForm.reset();
  });

  // Upload trigger - prevent default form action
  uploadTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
  });

  // File change (opens Crop/Zoom View)
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        rawImageSrc = e.target.result;
        cropImage.src = rawImageSrc;
        
        // Switch to Crop View
        formView.style.display = 'none';
        cropView.style.display = 'block';

        const imgObj = new Image();
        imgObj.src = rawImageSrc;
        imgObj.onload = () => {
          const containerSize = 200;
          if (imgObj.width > imgObj.height) {
            imgLayoutH = containerSize;
            imgLayoutW = (imgObj.width / imgObj.height) * containerSize;
          } else {
            imgLayoutW = containerSize;
            imgLayoutH = (imgObj.height / imgObj.width) * containerSize;
          }
          
          cropImage.style.width = `${imgLayoutW}px`;
          cropImage.style.height = `${imgLayoutH}px`;
          
          panX = (containerSize - imgLayoutW) / 2;
          panY = (containerSize - imgLayoutH) / 2;
          scale = 1.0;
          zoomSlider.value = '1.0';
          
          updateCropTransform();
        };
      };
      reader.readAsDataURL(file);
    }
  });

  function updateCropTransform() {
    cropImage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  const startDrag = (clientX, clientY) => {
    isDragging = true;
    startX = clientX;
    startY = clientY;
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    panX += dx;
    panY += dy;
    startX = clientX;
    startY = clientY;
    updateCropTransform();
  };

  const stopDrag = () => {
    isDragging = false;
  };

  cropContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      moveDrag(e.clientX, e.clientY);
    }
  });
  window.addEventListener('mouseup', stopDrag);

  cropContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
  window.addEventListener('touchend', stopDrag);

  zoomSlider.addEventListener('input', () => {
    const prevScale = scale;
    scale = parseFloat(zoomSlider.value);
    
    const centerX = 100;
    const centerY = 100;
    panX = centerX - (centerX - panX) * (scale / prevScale);
    panY = centerY - (centerY - panY) * (scale / prevScale);

    updateCropTransform();
  });

  cropCancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cropView.style.display = 'none';
    formView.style.display = 'block';
    fileInput.value = '';
  });

  cropApplyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const imgObj = new Image();
    imgObj.src = rawImageSrc;
    imgObj.onload = () => {
      // The CSS transform is: translate(panX, panY) scale(scale) from top-left.
      // Container pixel (cx, cy) corresponds to image-display pixel:
      //   img_disp = (cx - panX) / scale
      // Image-display pixel to source pixel:
      //   src = img_disp * (naturalSize / layoutSize)
      //
      // For the full 200x200 container window (cx in [0,200]):
      const sx = (-panX / scale) * (imgObj.width / imgLayoutW);
      const sy = (-panY / scale) * (imgObj.height / imgLayoutH);
      const sWidth  = (200 / scale) * (imgObj.width  / imgLayoutW);
      const sHeight = (200 / scale) * (imgObj.height / imgLayoutH);

      // Draw those source pixels into the full 128x128 canvas output
      ctx.drawImage(imgObj, sx, sy, sWidth, sHeight, 0, 0, 128, 128);

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      avatarData.value = croppedBase64;
      avatarPreview.innerHTML = `<img src="${croppedBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      clearImgBtn.style.display = 'inline-block';

      cropView.style.display = 'none';
      formView.style.display = 'block';
    };
  });

  clearImgBtn.addEventListener('click', (e) => {
    e.preventDefault();
    avatarData.value = '';
    fileInput.value = '';
    clearImgBtn.style.display = 'none';
    const nameVal = nameInput.value.trim();
    avatarPreview.innerHTML = escapeHTML(nameVal ? getInitials(nameVal) : '??');
  });

  nameInput.addEventListener('input', () => {
    if (!avatarData.value) {
      const nameVal = nameInput.value.trim();
      avatarPreview.textContent = getInitials(nameVal);
    }
  });

  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('cms-form-title').textContent = 'Add Testimonial';
    document.getElementById('field-index').value = '';
    testimonialForm.reset();
    
    document.getElementById('field-stars').value = '5.0';
    updateSelectorStars(5.0);

    avatarData.value = '';
    avatarPreview.innerHTML = '??';
    clearImgBtn.style.display = 'none';

    mainView.style.display = 'none';
    formView.style.display = 'block';
  });

  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formView.style.display = 'none';
    mainView.style.display = 'block';
    testimonialForm.reset();
    
    avatarData.value = '';
    fileInput.value = '';
    clearImgBtn.style.display = 'none';
  });

  resetBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to reset the database to default testimonials? All custom modifications will be lost.')) {
      try {
        const res = await fetch('/api/testimonials/reset', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        
        if (res.status === 401) {
          handleAuthFailure();
          return;
        }

        const data = await res.json();
        if (data.success && data.testimonials) {
          applyTestimonialsToDOM(data.testimonials);
          renderCMSList();
          refreshScrollTrigger();
        }
      } catch (err) {
        alert('Failed to reset testimonials.');
        console.error(err);
      }
    }
  });

  testimonialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idxVal = document.getElementById('field-index').value;
    const name = nameInput.value.trim();
    const subtitle = document.getElementById('field-subtitle').value.trim();
    const stars = parseFloat(document.getElementById('field-stars').value || '5.0');
    const quote = document.getElementById('field-quote').value.trim();
    
    const avatar = avatarData.value || getInitials(name);
    const payload = { stars, quote, name, subtitle, avatar };

    let url = '/api/testimonials';
    let method = 'POST';

    if (idxVal !== '') {
      const idx = parseInt(idxVal, 10);
      url = `/api/testimonials?index=${idx}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        handleAuthFailure();
        return;
      }

      const data = await res.json();
      if (data.success && data.testimonials) {
        applyTestimonialsToDOM(data.testimonials);
        renderCMSList();
        
        formView.style.display = 'none';
        mainView.style.display = 'block';
        testimonialForm.reset();
        
        avatarData.value = '';
        fileInput.value = '';
        clearImgBtn.style.display = 'none';
        
        refreshScrollTrigger();
      } else {
        alert(data.message || 'Operation failed.');
      }
    } catch (err) {
      alert('Network transmission failed.');
      console.error(err);
    }
  });
}

async function renderCMSList() {
  const listContainer = document.getElementById('cms-list');
  if (!listContainer) return;

  listContainer.innerHTML = '<p class="cms-loading-state" style="padding: 2.5rem; text-align: center; color: var(--text-dark-3); font-style: italic;">Synchronizing database...</p>';

  const testimonials = await fetchTestimonials();
  listContainer.innerHTML = '';

  if (!testimonials || testimonials.length === 0) {
    listContainer.innerHTML = '<p class="cms-empty-state">No testimonials stored in the database.</p>';
    return;
  }

  testimonials.forEach((t, i) => {
    let avatarMarkup = '';
    if (t.avatar && (t.avatar.startsWith('data:') || t.avatar.startsWith('http') || t.avatar.startsWith('/'))) {
      avatarMarkup = `<img src="${escapeHTML(t.avatar)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
    } else {
      avatarMarkup = escapeHTML(t.avatar || getInitials(t.name));
    }

    const item = document.createElement('div');
    item.className = 'cms-testimonial-item';
    item.innerHTML = `
      <div class="cms-item-avatar">${avatarMarkup}</div>
      <div class="cms-item-info">
        <strong>${escapeHTML(t.name)}</strong>
        <span>${escapeHTML(t.subtitle)}</span>
      </div>
      <div class="cms-item-actions">
        <button class="cms-item-btn cms-edit" data-idx="${i}" title="Edit" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px;">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
        <button class="cms-item-btn cms-delete" data-idx="${i}" title="Delete" style="color: #c44747;" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px;">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;
    listContainer.appendChild(item);
  });

  listContainer.querySelectorAll('.cms-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const t = testimonials[idx];
      
      if (t) {
        document.getElementById('field-index').value = idx;
        document.getElementById('field-name').value = t.name;
        document.getElementById('field-subtitle').value = t.subtitle;
        
        document.getElementById('field-stars').value = t.stars;
        updateSelectorStars(t.stars);

        const avatarDataInput = document.getElementById('field-avatar-data');
        const avatarPreview = document.getElementById('cms-preview-avatar');
        const clearImgBtn = document.getElementById('cms-clear-image-btn');

        if (t.avatar && (t.avatar.startsWith('data:') || t.avatar.startsWith('http') || t.avatar.startsWith('/'))) {
          avatarDataInput.value = t.avatar;
          avatarPreview.innerHTML = `<img src="${t.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
          clearImgBtn.style.display = 'inline-block';
        } else {
          avatarDataInput.value = '';
          avatarPreview.innerHTML = escapeHTML(t.avatar || getInitials(t.name));
          clearImgBtn.style.display = 'none';
        }

        document.getElementById('field-quote').value = t.quote;

        document.getElementById('cms-form-title').textContent = 'Edit Testimonial';
        document.getElementById('cms-main-view').style.display = 'none';
        document.getElementById('cms-form-view').style.display = 'block';
      }
    });
  });

  listContainer.querySelectorAll('.cms-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const name = testimonials[idx].name;
      
      if (confirm(`Are you sure you want to delete ${name}'s testimonial from the server database?`)) {
        try {
          const res = await fetch(`/api/testimonials?index=${idx}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });

          if (res.status === 401) {
            handleAuthFailure();
            return;
          }

          const data = await res.json();
          if (data.success && data.testimonials) {
            applyTestimonialsToDOM(data.testimonials);
            renderCMSList();
            refreshScrollTrigger();
          }
        } catch (err) {
          alert('Failed to delete testimonial from backend.');
          console.error(err);
        }
      }
    });
  });
}

function handleAuthFailure() {
  alert('Admin session expired. Please log in again.');
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  document.getElementById('cms-form-view').style.display = 'none';
  document.getElementById('cms-main-view').style.display = 'none';
  document.getElementById('cms-login-view').style.display = 'block';
  document.getElementById('cms-login-form').reset();
}

function refreshScrollTrigger() {
  try {
    ScrollTrigger.refresh();
  } catch (e) {
    console.warn("Could not refresh ScrollTrigger", e);
  }
}

function renderSelectorStars() {
  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    const gradId = `selector-grad-${i}`;
    starsHtml += `
      <svg class="selector-star-svg" data-idx="${i}" viewBox="0 0 24 24" width="28" height="28" style="cursor: pointer; margin-right: 6px; transition: transform 0.2s ease;">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="100%" stop-color="var(--accent-gold)" />
            <stop offset="100%" stop-color="rgba(168, 61, 90, 0.12)" />
          </linearGradient>
        </defs>
        <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" fill="url(#${gradId})" />
      </svg>
    `;
  }
  return starsHtml;
}

function updateSelectorStars(rating) {
  for (let i = 0; i < 5; i++) {
    const grad = document.getElementById(`selector-grad-${i}`);
    if (!grad) continue;
    const stops = grad.querySelectorAll('stop');
    let fill = 0;
    if (rating >= i + 1) {
      fill = 100;
    } else if (rating > i) {
      fill = (rating - i) * 100;
    }
    stops[0].setAttribute('offset', `${fill}%`);
    stops[1].setAttribute('offset', `${fill}%`);
  }
  const displayVal = document.getElementById('cms-star-value');
  if (displayVal) {
    displayVal.textContent = rating.toFixed(1);
  }
}

function setupStarSelectorEvents() {
  const selector = document.getElementById('cms-star-selector');
  if (!selector) return;

  selector.addEventListener('mousemove', (e) => {
    const rect = selector.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = rect.width;
    const singleStarWidth = totalWidth / 5;
    
    const rawRating = x / singleStarWidth;
    const starIndex = Math.floor(rawRating);
    const starFraction = rawRating % 1;
    
    let rating = starIndex + (starFraction < 0.5 ? 0.5 : 1.0);
    rating = Math.max(0.5, Math.min(5.0, rating));
    
    updateSelectorStars(rating);
  });

  selector.addEventListener('mouseleave', () => {
    const currentRating = parseFloat(document.getElementById('field-stars').value || '5.0');
    updateSelectorStars(currentRating);
  });

  selector.addEventListener('click', (e) => {
    e.preventDefault();
    const rect = selector.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = rect.width;
    const singleStarWidth = totalWidth / 5;
    
    const rawRating = x / singleStarWidth;
    const starIndex = Math.floor(rawRating);
    const starFraction = rawRating % 1;
    
    let rating = starIndex + (starFraction < 0.5 ? 0.5 : 1.0);
    rating = Math.max(0.5, Math.min(5.0, rating));
    
    document.getElementById('field-stars').value = rating.toString();
    updateSelectorStars(rating);
  });
}
