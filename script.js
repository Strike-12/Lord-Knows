/**
 * LORD KNOWS CLOTHING // CLIENT-SIDE JAVASCRIPT
 * Handles Jan 1, 2027 Countdown, App Storage Sync, User Picture Uploads, Gallery & Cart
 */

// Global State
window.LK_STATE = {
  countdownTarget: new Date('2027-01-01T00:00:00Z').getTime(),
  images: [],
  products: [],
  activeFilter: 'all',
  cart: JSON.parse(localStorage.getItem('LK_CART') || '[]')
};

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initAppStorage();
  initPictureUploader();
  initGalleryControls();
  initLightbox();
  initRSVPForm();
  initContactForm();
  initCart();
  initMobileMenu();
});

// ==========================================
// 1. COUNTDOWN ENGINE (January 1, 2027)
// ==========================================
function initCountdown() {
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  const tickerEl = document.getElementById('top-countdown-ticker');

  // Fetch configured target from server or fallback to Jan 1, 2027
  fetch('/api/countdown')
    .then(res => res.json())
    .then(data => {
      if (data.countdown && data.countdown.targetDate) {
        window.LK_STATE.countdownTarget = new Date(data.countdown.targetDate).getTime();
      }
    })
    .catch(() => {
      window.LK_STATE.countdownTarget = new Date('2027-01-01T00:00:00Z').getTime();
    });

  function update() {
    const now = new Date().getTime();
    const distance = window.LK_STATE.countdownTarget - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      if (tickerEl) tickerEl.textContent = 'DROP LIVE NOW';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);

    if (tickerEl) {
      tickerEl.textContent = `DROP IN: ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
  }

  update();
  setInterval(update, 1000);
}

// ==========================================
// 2. APP STORAGE SYNC & DATA FETCHING
// ==========================================
async function initAppStorage() {
  try {
    const res = await fetch('/api/storage');
    if (res.ok) {
      const { data } = await res.json();
      if (data) {
        window.LK_STATE.images = data.images || [];
        window.LK_STATE.products = data.products || [];
        localStorage.setItem('LK_STORAGE_CACHE', JSON.stringify(data));
        renderGallery();
        renderProducts();
        return;
      }
    }
  } catch (err) {
    console.warn('Using cached App Storage:', err);
  }

  // Fallback to cache if offline
  const cached = localStorage.getItem('LK_STORAGE_CACHE');
  if (cached) {
    const data = JSON.parse(cached);
    window.LK_STATE.images = data.images || [];
    window.LK_STATE.products = data.products || [];
    renderGallery();
    renderProducts();
  }
}

// ==========================================
// 3. PICTURE UPLOADER ("Add my own pictures")
// ==========================================
function initPictureUploader() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('picture-file-input');
  const uploadForm = document.getElementById('user-picture-upload-form');
  const previewBox = document.getElementById('upload-file-preview');
  const statusBox = document.getElementById('upload-status-message');

  if (!uploadForm || !fileInput) return;

  // Drag and drop events
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    dropzone.addEventListener('click', () => {
      fileInput.click();
    });
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handleFileSelection(fileInput.files[0]);
    }
  });

  function handleFileSelection(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    if (previewBox) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      previewBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; justify-content:center;">
          <span>Selected: <strong>${file.name}</strong> (${sizeMb} MB)</span>
          <button type="button" id="clear-selected-file" style="color:var(--accent-red); font-weight:700; margin-left:0.5rem;">✕ Remove</button>
        </div>
      `;
      document.getElementById('clear-selected-file')?.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewBox.innerHTML = '';
      });
    }
  }

  // Handle Form Submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files || !fileInput.files[0]) {
      if (statusBox) {
        statusBox.innerHTML = '<span style="color:var(--accent-amber)">Please select an image file first.</span>';
      }
      return;
    }

    const file = fileInput.files[0];
    const title = document.getElementById('upload-pic-title')?.value || file.name;
    const category = document.getElementById('upload-pic-category')?.value || 'User Uploads';
    const caption = document.getElementById('upload-pic-caption')?.value || '';
    const uploader = document.getElementById('upload-pic-author')?.value || 'Lord Knows Member';

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'UPLOADING TO APP STORAGE...';
    }

    if (statusBox) {
      statusBox.innerHTML = '<span style="color:var(--text-secondary)">Uploading picture...</span>';
    }

    const formData = new FormData();
    formData.append('picture', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('caption', caption);
    formData.append('uploader', uploader);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // Success
        if (statusBox) {
          statusBox.innerHTML = '<span style="color:#22c55e">✓ Picture added to App Storage & Gallery!</span>';
        }
        uploadForm.reset();
        if (previewBox) previewBox.innerHTML = '';

        // Add to state and re-render
        if (result.image) {
          window.LK_STATE.images.unshift(result.image);
          renderGallery();
        } else {
          initAppStorage();
        }

        // Jump to gallery
        const gallerySection = document.getElementById('gallery-section');
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      if (statusBox) {
        statusBox.innerHTML = `<span style="color:var(--accent-red)">Upload error: ${err.message}</span>`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'UPLOAD PICTURE';
      }
    }
  });
}

// ==========================================
// 3B. REAL MEDIA UPLOADER (No AI - Profile & Drawings)
// ==========================================
function initRealMediaUploader() {
  const heroPhotoFrame = document.getElementById('hero-photo-frame');
  const mediaCardProfile = document.getElementById('media-card-profile');
  const mediaCardDrawings = document.getElementById('media-card-drawings');

  // Helper toast for user actions
  function showUploaderToast(msg, isError = false) {
    let toast = document.getElementById('uploader-live-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'uploader-live-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        background: #121118;
        border: 1px solid var(--border-prominent);
        box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 15px var(--accent-purple-glow);
        color: #fff;
        padding: 12px 18px;
        border-radius: 8px;
        font-family: var(--font-body);
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: transform 0.25s ease, opacity 0.25s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.style.borderColor = isError ? 'var(--accent-red)' : 'var(--accent-purple)';
    toast.innerHTML = isError
      ? `<span style="color:var(--accent-red); font-size:1.1rem;">⚠</span> <span>${escapeHtml(msg)}</span>`
      : `<span style="color:#22c55e; font-size:1.1rem;">✓</span> <span>${escapeHtml(msg)}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
      }
    }, 4500);
  }

  // Convert any image file (JPEG, PNG, HEIC, WEBP, etc.) to standard JPEG in browser
  async function normalizeToJpeg(file) {
    if (!file) return null;
    return new Promise((resolve) => {
      // First try standard FileReader to Image canvas
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const normFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
                resolve(normFile);
              } else {
                resolve(file);
              }
            }, 'image/jpeg', 0.95);
          } catch (err) {
            console.warn('Canvas conversion note:', err);
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }

  // Upload function for profile photo
  async function uploadProfilePhoto(file) {
    if (!file) return;
    showUploaderToast('Converting and uploading photo...');
    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('photo', readyFile);

      const res = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showUploaderToast(data.message || 'Real profile photo updated!');
        const freshUrl = data.url || `/assets/images/elsen_profile.jpg?t=${Date.now()}`;
        document.querySelectorAll('img[src*="elsen_profile.jpg"]').forEach(img => {
          img.src = freshUrl;
        });
      } else {
        throw new Error(data.message || 'Failed to update photo');
      }
    } catch (err) {
      console.error(err);
      showUploaderToast(err.message || 'Failed to upload photo', true);
    }
  }

  // Upload function for drawings
  async function uploadDrawing(file) {
    if (!file) return;
    showUploaderToast('Converting and uploading drawing...');
    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('drawing', readyFile);

      const res = await fetch('/api/profile/upload-drawing', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showUploaderToast(data.message || 'Real drawing updated!');
        const freshUrl = data.url || `/assets/images/elsen_drawings.jpg?t=${Date.now()}`;
        document.querySelectorAll('img[src*="elsen_drawings.jpg"]').forEach(img => {
          img.src = freshUrl;
        });
      } else {
        throw new Error(data.message || 'Failed to update drawing');
      }
    } catch (err) {
      console.error(err);
      showUploaderToast(err.message || 'Failed to upload drawing', true);
    }
  }

  // Upload function for Reselling Clothes & Shoes
  async function uploadResellingPhoto(file) {
    if (!file) return;
    showUploaderToast('Converting and uploading clothes & shoes photo...');
    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('photo', readyFile);

      const res = await fetch('/api/reselling/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showUploaderToast(data.message || 'Clothes & shoes photo updated!');
        const freshUrl = data.url || `/assets/images/reselling_clothes_shoes.jpg?t=${Date.now()}`;
        document.querySelectorAll('img[src*="reselling_clothes_shoes.jpg"]').forEach(img => {
          img.src = freshUrl;
        });
      } else {
        throw new Error(data.message || 'Failed to update reselling photo');
      }
    } catch (err) {
      console.error(err);
      showUploaderToast(err.message || 'Failed to upload clothes photo', true);
    }
  }

  // Hero frame, Media cards, and Reselling frames (Clean display mode - no public upload buttons)
  // All photo management is securely housed in the private /admin.html dashboard
}

// ==========================================
// 4. GALLERY RENDERING & FILTERS
// ==========================================
function initGalleryControls() {
  const filterBtns = document.querySelectorAll('.filter-pill');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.LK_STATE.activeFilter = btn.dataset.filter || 'all';
      renderGallery();
    });
  });
}

function renderGallery() {
  const galleryGrid = document.getElementById('media-gallery-grid');
  if (!galleryGrid) return;

  const filter = window.LK_STATE.activeFilter;
  let items = window.LK_STATE.images;

  if (filter === 'user') {
    items = items.filter(img => img.isUserUpload || img.category === 'User Uploads');
  } else if (filter !== 'all') {
    items = items.filter(img => img.category && img.category.toLowerCase() === filter.toLowerCase());
  }

  if (items.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: 8px;">
        <p style="font-size:1.1rem; margin-bottom: 0.5rem; text-transform:uppercase; font-family:var(--font-display);">No pictures in this category yet</p>
        <p style="font-size:0.9rem;">Upload your own pictures using the box above to see them here immediately!</p>
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = items.map(img => `
    <div class="gallery-item" data-id="${img.id}">
      <div class="gallery-thumb-container" onclick="openLightbox('${img.id}')">
        <img src="${img.url}" alt="${img.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'" />
        <span class="gallery-badge ${img.isUserUpload ? 'badge-user' : ''}">
          ${img.isUserUpload ? '★ USER UPLOAD' : (img.category || 'GALLERY')}
        </span>
      </div>
      <div class="gallery-info">
        <h4 class="gallery-title">${escapeHtml(img.title)}</h4>
        <p class="gallery-caption">${escapeHtml(img.caption || '')}</p>
        <div class="gallery-meta">
          <span>BY: ${escapeHtml(img.uploader || 'Lord Knows')}</span>
          <span>${img.date || '2026-09-18'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 5. LIGHTBOX MODAL
// ==========================================
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

window.openLightbox = function(id) {
  const modal = document.getElementById('lightbox-modal');
  const imgData = window.LK_STATE.images.find(img => img.id === id);
  if (!modal || !imgData) return;

  const content = document.getElementById('lightbox-body');
  if (content) {
    content.innerHTML = `
      <div style="background:#000; display:flex; justify-content:center; align-items:center; min-height:360px; max-height:65vh; overflow:hidden;">
        <img src="${imgData.url}" alt="${imgData.title}" style="max-height:65vh; width:auto; object-fit:contain;" />
      </div>
      <div style="padding: 1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-amber); text-transform:uppercase;">
            ${imgData.isUserUpload ? '★ User Upload' : imgData.category}
          </span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${imgData.date}</span>
        </div>
        <h2 style="font-family:var(--font-display); font-size:1.5rem; text-transform:uppercase; margin-bottom:0.5rem;">
          ${escapeHtml(imgData.title)}
        </h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">${escapeHtml(imgData.caption || 'Archival picture representation')}</p>
        <div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:0.75rem;">
          Uploaded by: <strong style="color:var(--accent-white);">${escapeHtml(imgData.uploader)}</strong>
        </div>
      </div>
    `;
  }

  modal.classList.add('open');
};

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('open');
}

// ==========================================
// 6. PRODUCTS RENDERING & CART
// ==========================================
function renderProducts() {
  const grid = document.getElementById('products-catalog-grid');
  if (!grid) return;

  const products = window.LK_STATE.products;
  if (!products || products.length === 0) return;

  grid.innerHTML = products.map(prod => `
    <div class="product-card">
      <div class="product-image-box">
        <img src="${prod.image}" alt="${prod.name}" loading="lazy" />
      </div>
      <div class="product-details">
        <span class="product-cat">${prod.category}</span>
        <h3 class="product-title">${escapeHtml(prod.name)}</h3>
        <div class="product-price">$${prod.price} USD</div>
        <p class="product-desc">${escapeHtml(prod.description)}</p>
        <div class="product-actions">
          <button class="action-btn btn-primary" style="width:100%; justify-content:center;" onclick="addToBag('${prod.id}')">
            ADD TO BAG
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.addToBag = function(productId) {
  const product = window.LK_STATE.products.find(p => p.id === productId);
  if (!product) return;

  window.LK_STATE.cart.push(product);
  localStorage.setItem('LK_CART', JSON.stringify(window.LK_STATE.cart));
  updateCartBadge();
  alert(`Added ${product.name} to bag!`);
};

function initCart() {
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('bag-count-badge');
  if (badge) {
    badge.textContent = window.LK_STATE.cart.length;
  }
}

// ==========================================
// 7. RSVP FORM FOR JAN 1 2027 DROP
// ==========================================
function initRSVPForm() {
  const rsvpForm = document.getElementById('rsvp-drop-form');
  const rsvpFeedback = document.getElementById('rsvp-feedback');
  if (!rsvpForm) return;

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('rsvp-email')?.value || '';
    const phone = document.getElementById('rsvp-phone')?.value || '';

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      const data = await res.json();
      if (rsvpFeedback) {
        rsvpFeedback.innerHTML = `<span style="color:#22c55e">${data.message || 'Confirmed for January 1, 2027 drop!'}</span>`;
      }
      rsvpForm.reset();
    } catch (err) {
      if (rsvpFeedback) {
        rsvpFeedback.innerHTML = `<span style="color:var(--accent-red)">Error signing up. Please try again.</span>`;
      }
    }
  });
}

// ==========================================
// 8. MOBILE NAVIGATION MENU
// ==========================================
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      if (nav.style.display === 'flex') {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.width = '100%';
        nav.style.background = 'var(--bg-surface-elevated)';
        nav.style.padding = '1.5rem';
        nav.style.borderBottom = '1px solid var(--border-prominent)';
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// 9. PUBLIC CONTACT FORM (/api/contact)
// ==========================================
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const contactFeedback = document.getElementById('contact-feedback');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('contact-first-name')?.value?.trim();
    const lastName = document.getElementById('contact-last-name')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    const reason = document.getElementById('contact-reason')?.value;
    const message = document.getElementById('contact-message')?.value?.trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (!firstName || !lastName || !email || !reason || !message) {
      if (contactFeedback) {
        contactFeedback.innerHTML = `<div class="form-alert error" style="background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); color:#fca5a5; padding:0.85rem 1rem; border-radius:6px; margin-top:1rem;">Please fill in all required fields.</div>`;
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (contactFeedback) {
        contactFeedback.innerHTML = `<div class="form-alert error" style="background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); color:#fca5a5; padding:0.85rem 1rem; border-radius:6px; margin-top:1rem;">Please enter a valid email address.</div>`;
      }
      return;
    }

    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Message...';
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, reason, message })
      });

      const data = await res.json();

      if (res.status === 201) {
        const targetEmail = 'keenelsen2@gmail.com';
        const emailSubject = encodeURIComponent(`Website Inquiry from ${firstName} ${lastName} [${reason}]`);
        const emailBody = encodeURIComponent(`Hi Elsen,\n\nYou received a new message from your website portfolio:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nReason: ${reason}\n\nMessage:\n${message}\n\n--\nSent via Elsen Keena Portfolio`);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${emailSubject}&body=${emailBody}`;
        const mailtoUrl = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`;

        if (contactFeedback) {
          contactFeedback.innerHTML = `
            <div class="form-alert success" style="background:rgba(168,85,247,0.15); border:1px solid var(--accent-purple); color:#e9d5ff; padding:1.5rem; border-radius:8px; margin-top:1.25rem; box-shadow:0 0 20px var(--accent-purple-glow);">
              <div style="font-weight:800; font-size:1.15rem; color:#fff; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.5rem;">
                <span>✓</span> <span>Message Logged &amp; Ready for Delivery</span>
              </div>
              <p style="margin:0 0 0.85rem 0; font-size:0.92rem; color:var(--text-secondary); line-height:1.5;">
                Thank you, <strong style="color:#ffffff;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</strong>. Your contact inquiry has been recorded and addressed to <strong style="color:var(--accent-purple-light);">${targetEmail}</strong>.
              </p>
              
              <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin:1rem 0;">
                <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-primary" style="padding:0.65rem 1.25rem; font-size:0.85rem; text-decoration:none;">
                  <span>✉ Open in Gmail to Send Direct</span> ↗
                </a>
                <a href="${mailtoUrl}" class="action-btn btn-secondary" style="padding:0.65rem 1.25rem; font-size:0.85rem; text-decoration:none;">
                  <span>📧 Send via Default Mail App</span>
                </a>
              </div>

              <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); border-top:1px solid rgba(168,85,247,0.2); padding-top:0.65rem; margin-top:0.75rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                <span>Saved to App Storage (Ref: <code>${escapeHtml(data.id)}</code>)</span>
                <span>${new Date(data.submittedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          `;
        }

        // Also prompt mailto dispatch
        try {
          window.open(gmailUrl, '_blank');
        } catch (e) {
          // Fallback if popup blocked
        }

        contactForm.reset();
      } else {
        if (contactFeedback) {
          contactFeedback.innerHTML = `
            <div class="form-alert error" style="background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); color:#fca5a5; padding:0.85rem 1rem; border-radius:6px; margin-top:1rem;">
              <strong>Submission Failed:</strong> ${escapeHtml(data.error || 'Unable to submit your message. Please check your inputs and try again.')}
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      if (contactFeedback) {
        contactFeedback.innerHTML = `
          <div class="form-alert error" style="background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); color:#fca5a5; padding:0.85rem 1rem; border-radius:6px; margin-top:1rem;">
            <strong>Server/Network Error:</strong> Could not connect to the contact endpoint. Please try again.
          </div>
        `;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}
