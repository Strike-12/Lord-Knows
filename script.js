/**
 * LORD KNOWS CLOTHING // CLIENT-SIDE JAVASCRIPT
 * Handles Jan 1, 2027 Countdown, App Storage Sync, User Picture Uploads, Gallery & Cart
 */

// Global State
window.LK_STATE = {
  countdownTarget: new Date('2027-01-01T00:00:00Z').getTime(),
  images: [],
  products: [],
  motionReels: [],
  activeFilter: 'all',
  cart: JSON.parse(localStorage.getItem('LK_CART') || '[]')
};

// Global Media Helpers
function isVideoMedia(itemOrUrl) {
  if (!itemOrUrl) return false;
  if (typeof itemOrUrl === 'object') {
    if (itemOrUrl.mediaType === 'video' || itemOrUrl.type === 'video' || itemOrUrl.isVideo) return true;
    itemOrUrl = itemOrUrl.url || itemOrUrl.filename || '';
  }
  if (typeof itemOrUrl !== 'string') return false;
  const cleanUrl = itemOrUrl.split('?')[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|ogv|ogg|mkv|avi)$/i.test(cleanUrl);
}
window.isVideoMedia = isVideoMedia;

function updateSlotMediaElement(targetEl, url, alt = '') {
  if (!targetEl) return;
  const isVid = isVideoMedia(url);
  const parent = (targetEl.tagName === 'IMG' || targetEl.tagName === 'VIDEO') 
    ? targetEl.parentElement 
    : targetEl;
  let current = parent.querySelector('img, video');
  if (!current && (targetEl.tagName === 'IMG' || targetEl.tagName === 'VIDEO')) {
    current = targetEl;
  }

  if (isVid) {
    if (current && current.tagName === 'VIDEO') {
      current.src = url;
      current.load();
      current.play().catch(() => {});
    } else {
      const video = document.createElement('video');
      video.src = url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = true;
      if (current) {
        video.id = current.id;
        video.className = current.className;
        video.style.cssText = current.style.cssText;
        parent.replaceChild(video, current);
      } else {
        parent.appendChild(video);
      }
      video.play().catch(() => {});
    }
  } else {
    if (current && current.tagName === 'IMG') {
      current.src = url;
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.alt = alt || 'Showcase media';
      if (current) {
        img.id = current.id;
        img.className = current.className;
        img.style.cssText = current.style.cssText;
        parent.replaceChild(img, current);
      } else {
        parent.appendChild(img);
      }
    }
  }
}
window.updateSlotMediaElement = updateSlotMediaElement;

// Helper to safely parse server responses, converting HTML error pages (e.g. 413, 502, 503, 404) into friendly error messages
async function safeParseJsonResponse(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {
      // Fall through to text parsing
    }
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // Non-JSON response (HTML or plain text)
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error('File exceeds upload limit (max 30MB). Please select a smaller photo or compressed video clip.');
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error('Server is currently starting up or busy. Please wait a few seconds and try again.');
    }
    if (res.status === 404) {
      throw new Error('Upload endpoint not found. Please refresh the page.');
    }
    const match = text.match(/<title>(.*?)<\/title>/i) || text.match(/<h[12]>(.*?)<\/h[12]>/i) || text.match(/<pre>(.*?)<\/pre>/i);
    const msg = match ? match[1].replace(/<[^>]*>/g, '').trim() : '';
    throw new Error(msg || `Server returned error status (${res.status}).`);
  }

  throw new Error('Received unexpected response format from server.');
}
window.safeParseJsonResponse = safeParseJsonResponse;

function validateUploadSize(file, maxMb = 30) {
  if (!file) return true;
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMb} MB). Maximum allowed upload size is ${maxMb} MB. Please select a smaller video clip or photo.`);
  }
  return true;
}
window.validateUploadSize = validateUploadSize;

// Global Image Normalizer Utility: Convert any image file to standard JPEG; pass video through as-is
async function normalizeToJpeg(file) {
  if (!file) return null;
  // If it's a video file, pass it directly through without canvas processing
  if (file.type && file.type.startsWith('video/')) {
    validateUploadSize(file, 30);
    return file;
  }
  const isVideoExt = /\.(mp4|webm|mov|m4v|ogg|ogv|avi|mkv)$/i.test(file.name || '');
  if (isVideoExt) {
    validateUploadSize(file, 30);
    return file;
  }
  validateUploadSize(file, 30);
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    return file;
  }
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 2400;
            let w = img.naturalWidth || img.width || 800;
            let h = img.naturalHeight || img.height || 1000;
            if (w > MAX_DIM || h > MAX_DIM) {
              if (w > h) {
                h = Math.round((h * MAX_DIM) / w);
                w = MAX_DIM;
              } else {
                w = Math.round((w * MAX_DIM) / h);
                h = MAX_DIM;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => {
              if (blob) {
                const normFile = new File([blob], (file.name || 'photo').replace(/\.[^/.]+$/, "") + '.jpg', { type: 'image/jpeg' });
                resolve(normFile);
              } else {
                resolve(file);
              }
            }, 'image/jpeg', 0.92);
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
    } catch (err) {
      console.warn('normalizeToJpeg fallback:', err);
      resolve(file);
    }
  });
}
window.normalizeToJpeg = normalizeToJpeg;

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initAppStorage();
  initPictureUploader();
  initMotionReels();
  initGalleryControls();
  initLightbox();
  initRSVPForm();
  initContactForm();
  initCart();
  initMobileMenu();
  initPhotoAreaControls();
  initBatchCustomOrder();
  initTheaterModal();
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
      const { data } = await safeParseJsonResponse(res);
      if (data) {
        window.LK_STATE.images = data.images || [];
        window.LK_STATE.products = data.products || [];
        window.LK_STATE.heroProfile = data.heroProfile || null;
        window.LK_STATE.motionReels = data.motionReels || [];
        if (data.heroProfile && data.heroProfile.url) {
          const heroImg = document.getElementById('hero-student-photo');
          if (heroImg) {
            updateSlotMediaElement(heroImg, data.heroProfile.url, 'Elsen Keena - Official Profile');
          }
        }
        localStorage.setItem('LK_STORAGE_CACHE', JSON.stringify(data));
        renderGallery();
        renderProducts();
        renderMotionReels();
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
    window.LK_STATE.heroProfile = data.heroProfile || null;
    window.LK_STATE.motionReels = data.motionReels || [];
    if (data.heroProfile && data.heroProfile.url) {
      const heroImg = document.getElementById('hero-student-photo');
      if (heroImg) {
        updateSlotMediaElement(heroImg, data.heroProfile.url, 'Elsen Keena - Official Profile');
      }
    }
    renderGallery();
    renderProducts();
    renderMotionReels();
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
    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg|ogv|mkv|avi)$/i.test(file.name);
    if (!isImg && !isVid) {
      alert('Please select a valid image or video file (JPG, PNG, WEBP, MP4, MOV, WEBM).');
      return;
    }
    if (previewBox) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      previewBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; justify-content:center;">
          <span>${isVid ? '🎬 Video' : '📷 Photo'} Selected: <strong>${file.name}</strong> (${sizeMb} MB)</span>
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
        statusBox.innerHTML = '<span style="color:var(--accent-amber)">Please select a photo or video file first.</span>';
      }
      return;
    }

    const file = fileInput.files[0];
    const isVid = isVideoMedia(file);
    const title = document.getElementById('upload-pic-title')?.value || file.name;
    const category = document.getElementById('upload-pic-category')?.value || (isVid ? 'Campaign' : 'User Uploads');
    const caption = document.getElementById('upload-pic-caption')?.value || '';
    const uploader = document.getElementById('upload-pic-author')?.value || 'Lord Knows Member';

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'UPLOADING TO APP STORAGE...';
    }

    if (statusBox) {
      statusBox.innerHTML = `<span style="color:var(--text-secondary)">Uploading ${isVid ? 'video' : 'picture'}...</span>`;
    }

    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('picture', readyFile);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('caption', caption);
      formData.append('uploader', uploader);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await safeParseJsonResponse(res);
      if (res.ok && result.success) {
        // Success
        if (statusBox) {
          statusBox.innerHTML = `<span style="color:#22c55e">✓ ${isVid ? 'Video' : 'Picture'} added to App Storage & Gallery!</span>`;
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
        submitBtn.textContent = 'UPLOAD MEDIA';
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

  // Upload function for profile photo or video
  async function uploadProfilePhoto(file) {
    if (!file) return;
    const isVid = isVideoMedia(file);
    showUploaderToast(isVid ? 'Uploading profile video...' : 'Optimizing and uploading profile photo...');
    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('photo', readyFile);

      const res = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok && data.success) {
        showUploaderToast(data.message || (isVid ? 'Real profile video updated!' : 'Real profile photo updated!'));
        const freshUrl = data.url || `/assets/images/hero_profile.jpg?t=${Date.now()}`;
        const heroPhoto = document.getElementById('hero-student-photo');
        if (heroPhoto) {
          updateSlotMediaElement(heroPhoto, freshUrl, 'Elsen Keena - Official Profile');
        }
      } else {
        throw new Error(data.message || 'Failed to update photo');
      }
    } catch (err) {
      console.error(err);
      showUploaderToast(err.message || 'Failed to upload photo', true);
    }
  }

  // Upload function for drawings (photo or video)
  async function uploadDrawing(file) {
    if (!file) return;
    const isVid = isVideoMedia(file);
    showUploaderToast(isVid ? 'Uploading drawing video...' : 'Optimizing and uploading drawing...');
    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('drawing', readyFile);

      const res = await fetch('/api/profile/upload-drawing', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok && data.success) {
        showUploaderToast(data.message || 'Real drawing updated!');
        const freshUrl = data.url || `/assets/images/elsen_drawings.jpg?t=${Date.now()}`;
        document.querySelectorAll('img[src*="elsen_drawings"], video[src*="elsen_drawings"]').forEach(el => {
          updateSlotMediaElement(el, freshUrl);
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
    const isVid = isVideoMedia(file);
    showUploaderToast(isVid ? 'Uploading clothes & shoes video...' : 'Optimizing and uploading clothes & shoes photo...');
    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('photo', readyFile);

      const res = await fetch('/api/reselling/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok && data.success) {
        showUploaderToast(data.message || 'Clothes & shoes media updated!');
        const freshUrl = data.url || `/assets/images/reselling_clothes_shoes.jpg?t=${Date.now()}`;
        document.querySelectorAll('img[src*="reselling_clothes_shoes"], video[src*="reselling_clothes_shoes"]').forEach(el => {
          updateSlotMediaElement(el, freshUrl);
        });
      } else {
        throw new Error(data.message || 'Failed to update reselling photo');
      }
    } catch (err) {
      console.error(err);
      showUploaderToast(err.message || 'Failed to upload clothes media', true);
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
        <p style="font-size:1.1rem; margin-bottom: 0.5rem; text-transform:uppercase; font-family:var(--font-display);">No media items in this category yet</p>
        <p style="font-size:0.9rem;">Upload your own photos and videos using the uploader above to see them here immediately!</p>
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = items.map((img, idx) => {
    const isVid = isVideoMedia(img);
    return `
    <div class="gallery-item photo-area-frame ${isVid ? 'gallery-item-video' : ''}" data-id="${img.id}">
      <div class="photo-area-controls" onclick="event.stopPropagation();">
        <span class="photo-order-badge">#${idx + 1} ${isVid ? '🎬 VIDEO' : '📷 PHOTO'}</span>
        <div class="photo-btn-group">
          <button class="photo-order-btn" onclick="moveGalleryItem('${img.id}', -1)" title="Move earlier in order" ${idx === 0 ? 'disabled' : ''}>◀</button>
          <button class="photo-order-btn" onclick="moveGalleryItem('${img.id}', 1)" title="Move later in order" ${idx === items.length - 1 ? 'disabled' : ''}>▶</button>
          <button class="photo-upload-btn" onclick="triggerReplacePhoto('${img.id}')" title="Upload new photo or video for this slot">📷/🎬 Replace</button>
        </div>
      </div>
      <div class="gallery-thumb-container" onclick="openLightbox('${img.id}')" style="position:relative; cursor:pointer;">
        ${isVid ? `
          <video src="${img.url}#t=0.001" preload="metadata" muted playsinline style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>
          <div class="video-play-overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); pointer-events:none;">
            <span style="background:rgba(168,85,247,0.9); color:#ffffff; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.15rem; padding-left:3px; box-shadow:0 0 15px var(--accent-purple-glow);">▶</span>
          </div>
        ` : `
          <img src="${img.url}" alt="${escapeHtml(img.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'" />
        `}
        <span class="gallery-badge ${img.isUserUpload ? 'badge-user' : ''}">
          ${img.isUserUpload ? (isVid ? '★ USER VIDEO' : '★ USER UPLOAD') : (isVid ? '🎬 VIDEO' : (img.category || 'GALLERY'))}
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
  `;}).join('');
}

window.moveGalleryItem = async function(id, direction) {
  const images = window.LK_STATE.images;
  const currentIndex = images.findIndex(img => img.id === id);
  if (currentIndex === -1) return;

  const targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= images.length) return;

  // Swap
  const [moved] = images.splice(currentIndex, 1);
  images.splice(targetIndex, 0, moved);

  renderGallery();
  showOrderToast(`Media item moved to position #${targetIndex + 1}!`);

  try {
    const orderedIds = images.map(img => img.id);
    await fetch('/api/storage/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds })
    });
  } catch (err) {
    console.error('Failed to save order to server:', err);
  }
};

window.triggerReplacePhoto = function(id) {
  let fileInput = document.getElementById('global-slot-replace-input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'global-slot-replace-input';
    fileInput.accept = 'image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  }

  fileInput.onchange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const isVid = isVideoMedia(file);
    const card = document.querySelector(`.gallery-item[data-id="${id}"]`);
    let spinner = null;
    if (card) {
      spinner = document.createElement('div');
      spinner.className = 'photo-uploading-spinner';
      spinner.innerHTML = `<div class="photo-spinner-ring"></div><span>Uploading replacement ${isVid ? 'video' : 'photo'}...</span>`;
      card.appendChild(spinner);
    }

    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('photo', readyFile);
      formData.append('slotId', id);

      const res = await fetch('/api/upload/slot', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);

      if (data.success) {
        const target = window.LK_STATE.images.find(img => img.id === id);
        if (target) {
          target.url = data.url;
          target.thumbnail = data.url;
          target.mediaType = data.mediaType;
        }
        renderGallery();
        showOrderToast(`${isVid ? 'Video' : 'Photo'} successfully replaced in this slot!`);
      } else {
        alert(data.message || 'Failed to replace media.');
      }
    } catch (err) {
      console.error('Media replacement error:', err);
      alert('Network error while uploading media.');
    } finally {
      if (spinner && spinner.parentElement) {
        spinner.remove();
      }
      fileInput.value = '';
    }
  };

  fileInput.click();
};

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

  const isVid = isVideoMedia(imgData);
  const content = document.getElementById('lightbox-body');
  if (content) {
    content.innerHTML = `
      <div style="background:#000; display:flex; justify-content:center; align-items:center; min-height:360px; max-height:65vh; overflow:hidden; position:relative;">
        ${isVid ? `
          <video src="${imgData.url}" controls autoplay playsinline style="max-height:65vh; width:100%; object-fit:contain;"></video>
        ` : `
          <img src="${imgData.url}" alt="${escapeHtml(imgData.title)}" style="max-height:65vh; width:auto; object-fit:contain;" />
        `}
      </div>
      <div style="padding: 1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-amber); text-transform:uppercase;">
            ${imgData.isUserUpload ? (isVid ? '★ User Video' : '★ User Upload') : (isVid ? '🎬 Archival Video' : imgData.category)}
          </span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${imgData.date || ''}</span>
        </div>
        <h2 style="font-family:var(--font-display); font-size:1.5rem; text-transform:uppercase; margin-bottom:0.5rem;">
          ${escapeHtml(imgData.title)}
        </h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">${escapeHtml(imgData.caption || (isVid ? 'Motion video reel representation' : 'Archival picture representation'))}</p>
        <div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:0.75rem;">
          Uploaded by: <strong style="color:var(--accent-white);">${escapeHtml(imgData.uploader || 'Elsen Keena')}</strong>
        </div>
      </div>
    `;
  }

  modal.classList.add('open');
};

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    const vid = modal.querySelector('video');
    if (vid) {
      try { vid.pause(); vid.src = ''; } catch(e){}
    }
    modal.classList.remove('open');
  }
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
      const data = await safeParseJsonResponse(res);
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

      const data = await safeParseJsonResponse(res);

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

// ========================================================
// 10. PHOTO AREA UPLOAD & CUSTOM REORDERING CONTROLS
// ========================================================
function showOrderToast(msg) {
  let toast = document.getElementById('order-notify-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'order-notify-toast';
    toast.className = 'order-notify-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${escapeHtml(msg)}</span>`;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// Global helper to bind drag & drop file upload to any photo/video container
function bindPhotoDropZone(container, onFileSelected) {
  if (!container) return;
  ['dragenter', 'dragover'].forEach(eventName => {
    container.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.add('photo-drag-active');
    });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    container.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove('photo-drag-active');
    });
  });
  container.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      const file = dt.files[0];
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg|ogv|mkv|avi)$/i.test(file.name);
      if (isImg || isVid) {
        onFileSelected(file);
      }
    }
  });
}

function initPhotoAreaControls() {
  // Helper to safely handle slot uploads with normalization and user feedback
  const uploadToSlot = async (file, slotId, targetImgEl, successMessage, extraUpdateCb) => {
    if (!file) return;
    const isVid = isVideoMedia(file);
    showOrderToast(isVid ? 'Uploading and optimizing video...' : 'Preparing and optimizing photo...', false);

    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append('photo', readyFile);
      formData.append('slotId', slotId);

      const res = await fetch('/api/upload/slot', { method: 'POST', body: formData });
      const data = await safeParseJsonResponse(res);
      if (res.ok && data.success) {
        if (targetImgEl) {
          updateSlotMediaElement(targetImgEl, data.url);
        }
        if (typeof extraUpdateCb === 'function') {
          extraUpdateCb(data);
        }
        showOrderToast(successMessage || (isVid ? 'Video updated successfully!' : 'Photo updated successfully!'));
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Slot upload error:', err);
      alert('Upload note: ' + (err.message || 'Could not complete upload.'));
    }
  };

  // 0. TOP HOMEPAGE HERO ACTION BAR UPLOAD BUTTON
  const heroTopActionInput = document.getElementById('hero-top-general-upload-input');
  if (heroTopActionInput) {
    heroTopActionInput.accept = 'image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
    heroTopActionInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const heroImg = document.getElementById('hero-student-photo');
        await uploadToSlot(file, 'hero-profile', heroImg, 'Official profile media updated from hero bar!');
        heroTopActionInput.value = '';
      }
    });
  }

  // 1. HERO PHOTO FRAME (Official Portrait / Video of Elsen Keena - Slot #1 Profile)
  const heroFrame = document.getElementById('hero-photo-frame');
  const heroImg = document.getElementById('hero-student-photo');
  if (heroFrame && heroImg) {
    heroFrame.classList.add('photo-area-frame');
    let fileInput = document.getElementById('hero-photo-file-input');
    
    // Ensure controls exist if not already in static HTML
    let controls = heroFrame.querySelector('.photo-area-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'photo-area-controls';
      controls.style.justifyContent = 'space-between';
      controls.innerHTML = `
        <span class="photo-order-badge">Slot #1 Profile</span>
        <label class="photo-upload-btn" id="btn-hero-photo-upload" for="hero-photo-file-input" style="cursor: pointer; margin: 0;">
          📷/🎬 Upload Photo or Video
          <input type="file" id="hero-photo-file-input" accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" />
        </label>
      `;
      heroFrame.appendChild(controls);
      fileInput = controls.querySelector('#hero-photo-file-input');
    }

    if (fileInput) {
      fileInput.accept = 'image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
    }

    const handleHeroFile = async (file) => {
      const isVid = isVideoMedia(file);
      let spinner = document.createElement('div');
      spinner.className = 'photo-uploading-spinner';
      spinner.innerHTML = `<div class="photo-spinner-ring"></div><span>Uploading profile ${isVid ? 'video' : 'photo'}...</span>`;
      heroFrame.appendChild(spinner);

      try {
        const currentHeroEl = heroFrame.querySelector('img, video') || heroImg;
        await uploadToSlot(file, 'hero-profile', currentHeroEl, 'Official profile media updated!');
      } finally {
        spinner.remove();
      }
    };

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleHeroFile(e.target.files[0]);
          fileInput.value = '';
        }
      });
    }

    const uploadLabel = heroFrame.querySelector('#btn-hero-photo-upload');
    if (uploadLabel && fileInput) {
      uploadLabel.addEventListener('click', (e) => {
        if (e.target !== fileInput && !fileInput.offsetParent) {
          try { fileInput.click(); } catch (err) {}
        }
      });
    }

    bindPhotoDropZone(heroFrame, handleHeroFile);
  }

  // 1B. SHOWCASE QUICK UPLOAD BUTTON (Featured Media Header)
  const showcaseQuickInput = document.getElementById('showcase-quick-upload-input');
  if (showcaseQuickInput) {
    showcaseQuickInput.accept = 'image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
    showcaseQuickInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const isVid = isVideoMedia(file);
        await uploadToSlot(file, 'general', null, `${isVid ? 'Video' : 'Photo'} uploaded to collection gallery!`, (data) => {
          if (window.LK_STATE && Array.isArray(window.LK_STATE.images) && data.image) {
            window.LK_STATE.images.unshift(data.image);
            if (typeof renderGallery === 'function') renderGallery();
          }
        });
        showcaseQuickInput.value = '';
      }
    });
  }

  // 2. RESELLING PHOTO/VIDEO FRAME (Sneaker Vault & Clothes)
  const resellFrame = document.getElementById('reselling-photo-frame');
  if (resellFrame) {
    resellFrame.classList.add('photo-area-frame');
    let fileInput = document.getElementById('resell-photo-file-input');

    let controls = resellFrame.querySelector('.photo-area-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'photo-area-controls';
      controls.style.justifyContent = 'space-between';
      controls.innerHTML = `
        <span class="photo-order-badge">Resale Inventory</span>
        <label class="photo-upload-btn" id="btn-resell-photo-upload" for="resell-photo-file-input" style="cursor: pointer; margin: 0;">
          📷/🎬 Upload Photo or Video
          <input type="file" id="resell-photo-file-input" accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" />
        </label>
      `;
      resellFrame.appendChild(controls);
      fileInput = controls.querySelector('#resell-photo-file-input');
    }

    if (fileInput) {
      fileInput.accept = 'image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
    }

    const handleResellFile = async (file) => {
      const isVid = isVideoMedia(file);
      let spinner = document.createElement('div');
      spinner.className = 'photo-uploading-spinner';
      spinner.innerHTML = `<div class="photo-spinner-ring"></div><span>Uploading reselling ${isVid ? 'video' : 'photo'}...</span>`;
      resellFrame.appendChild(spinner);

      try {
        const currentResellEl = resellFrame.querySelector('img, video') || resellFrame;
        await uploadToSlot(file, 'reselling', currentResellEl, 'Reselling vault media updated!', (data) => {
          const resellingCardEl = document.querySelector('#media-card-reselling img, #media-card-reselling video') || document.getElementById('media-card-reselling');
          if (resellingCardEl) updateSlotMediaElement(resellingCardEl, data.url);
        });
      } finally {
        spinner.remove();
      }
    };

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleResellFile(e.target.files[0]);
          fileInput.value = '';
        }
      });
    }

    const resellUploadBtn = resellFrame.querySelector('#btn-resell-photo-upload');
    if (resellUploadBtn && fileInput) {
      resellUploadBtn.addEventListener('click', (e) => {
        if (e.target !== fileInput && !fileInput.offsetParent) {
          try { fileInput.click(); } catch (err) {}
        }
      });
    }

    bindPhotoDropZone(resellFrame, handleResellFile);
  }

  // 3. HOMEPAGE SHOWCASE CARDS REORDERING & UPLOAD
  const showcaseGrid = document.getElementById('homepage-showcase-grid');
  if (showcaseGrid) {
    // Restore saved order if available
    const savedOrderJson = localStorage.getItem('LK_SHOWCASE_ORDER');
    if (savedOrderJson) {
      try {
        const savedOrder = JSON.parse(savedOrderJson);
        if (Array.isArray(savedOrder)) {
          savedOrder.forEach(id => {
            const card = document.getElementById(id);
            if (card && card.parentElement === showcaseGrid) {
              showcaseGrid.appendChild(card);
            }
          });
        }
      } catch (e) {
        console.warn('Could not parse saved showcase order:', e);
      }
    }

    const updateShowcaseControls = () => {
      const cards = Array.from(showcaseGrid.children).filter(el => el.classList.contains('gallery-item'));
      const total = cards.length;

      cards.forEach((card, index) => {
        card.classList.add('photo-area-frame');
        card.style.position = 'relative';

        let controls = card.querySelector('.photo-area-controls');
        if (!controls) {
          controls = document.createElement('div');
          controls.className = 'photo-area-controls';
          card.insertBefore(controls, card.firstChild);
        }

        const inputId = `slot-file-input-${card.id}-${index}`;
        controls.innerHTML = `
          <span class="photo-order-badge">Slot #${index + 1}</span>
          <div class="photo-btn-group">
            <button type="button" class="photo-order-btn btn-showcase-left" title="Move card earlier" ${index === 0 ? 'disabled' : ''}>◀</button>
            <button type="button" class="photo-order-btn btn-showcase-right" title="Move card later" ${index === total - 1 ? 'disabled' : ''}>▶</button>
            <label class="photo-upload-btn btn-showcase-upload" for="${inputId}" title="Upload photo or video for this card" style="cursor: pointer; margin: 0;">
              📷/🎬 Upload
              <input type="file" id="${inputId}" class="slot-file-input" accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" />
            </label>
          </div>
        `;

        const btnLeft = controls.querySelector('.btn-showcase-left');
        const btnRight = controls.querySelector('.btn-showcase-right');
        const labelUpload = controls.querySelector('.btn-showcase-upload');
        const fileInput = controls.querySelector(`#${inputId}`);

        btnLeft.onclick = (e) => {
          e.stopPropagation();
          if (index > 0) {
            showcaseGrid.insertBefore(card, cards[index - 1]);
            saveAndRefreshShowcaseOrder();
            showOrderToast(`Card moved to Slot #${index}!`);
          }
        };

        btnRight.onclick = (e) => {
          e.stopPropagation();
          if (index < total - 1) {
            showcaseGrid.insertBefore(cards[index + 1], card);
            saveAndRefreshShowcaseOrder();
            showOrderToast(`Card moved to Slot #${index + 2}!`);
          }
        };

        const handleCardUpload = async (file) => {
          const isVid = isVideoMedia(file);
          let spinner = document.createElement('div');
          spinner.className = 'photo-uploading-spinner';
          spinner.innerHTML = `<div class="photo-spinner-ring"></div><span>Uploading ${isVid ? 'video' : 'photo'}...</span>`;
          card.appendChild(spinner);

          try {
            const readyFile = await normalizeToJpeg(file);
            const formData = new FormData();
            formData.append('photo', readyFile);
            formData.append('slotId', card.id);
            const res = await fetch('/api/upload/slot', { method: 'POST', body: formData });
            const data = await safeParseJsonResponse(res);
            if (data.success) {
              const mediaEl = card.querySelector('img, video') || card;
              updateSlotMediaElement(mediaEl, data.url);
              // Card and Hero Profile are strictly independent: do not sync or overwrite hero-student-photo
              showOrderToast(`${isVid ? 'Video' : 'Photo'} uploaded for Slot #${index + 1}!`);
            } else {
              alert(data.message || 'Error updating slot media.');
            }
          } catch (e) {
            console.error('Upload error:', e);
            alert('Upload notice: ' + (e.message || 'Upload failed.'));
          } finally {
            spinner.remove();
          }
        };

        if (labelUpload && fileInput) {
          labelUpload.addEventListener('click', (e) => {
            if (e.target !== fileInput && !fileInput.offsetParent) {
              try { fileInput.click(); } catch (err) {}
            }
          });
        }

        if (fileInput) {
          fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
              handleCardUpload(e.target.files[0]);
              fileInput.value = '';
            }
          };
        }

        bindPhotoDropZone(card, handleCardUpload);
      });
    };

    const saveAndRefreshShowcaseOrder = () => {
      const currentCards = Array.from(showcaseGrid.children).filter(el => el.classList.contains('gallery-item'));
      const showcaseOrder = currentCards.map(c => c.id);
      localStorage.setItem('LK_SHOWCASE_ORDER', JSON.stringify(showcaseOrder));
      updateShowcaseControls();

      fetch('/api/storage/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseOrder })
      }).catch(err => console.warn('Could not save showcase order:', err));
    };

    updateShowcaseControls();
  }
}

// 4. CUSTOM SEQUENCE / BATCH UPLOADER (media.html)
function initBatchCustomOrder() {
  const fileInput = document.getElementById('batch-order-file-input');
  const selectBtn = document.getElementById('btn-select-batch-photos');
  const uploadBtn = document.getElementById('btn-upload-batch-photos');
  const countSpan = document.getElementById('batch-count');
  const queueContainer = document.getElementById('batch-queue-container');

  if (!fileInput || !selectBtn || !uploadBtn || !queueContainer) return;

  fileInput.accept = 'image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
  let queue = []; // array of { file, previewUrl, title, isVideo }

  selectBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg|ogv|mkv|avi)$/i.test(file.name);
      queue.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: isVid,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      });
    });

    fileInput.value = '';
    renderQueue();
  });

  function renderQueue() {
    if (queue.length === 0) {
      queueContainer.style.display = 'none';
      uploadBtn.style.display = 'none';
      return;
    }

    queueContainer.style.display = 'grid';
    uploadBtn.style.display = 'inline-flex';
    if (countSpan) countSpan.textContent = queue.length;

    queueContainer.innerHTML = queue.map((item, idx) => `
      <div class="queue-card">
        <div style="position:relative; aspect-ratio:1; background:#000; overflow:hidden; border-radius:6px;">
          ${item.isVideo ? `
            <video src="${item.previewUrl}" muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>
            <span style="position:absolute; bottom:4px; right:4px; font-size:0.65rem; background:rgba(0,0,0,0.85); color:var(--accent-amber); padding:2px 5px; border-radius:4px; font-family:var(--font-mono);">🎬 VIDEO</span>
          ` : `
            <img src="${item.previewUrl}" alt="${escapeHtml(item.title)}" class="queue-card-thumb" style="width:100%; height:100%; object-fit:cover;" />
          `}
          <span class="photo-order-badge" style="position:absolute; top:6px; left:6px;">Order #${idx + 1}</span>
        </div>
        <div class="queue-card-controls">
          <div style="font-size:0.75rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:90px;" title="${escapeHtml(item.title)}">
            ${escapeHtml(item.title)}
          </div>
          <div class="photo-btn-group" style="padding:2px;">
            <button class="photo-order-btn" style="width:24px; height:24px;" onclick="moveQueueItem(${idx}, -1)" title="Move left in sequence" ${idx === 0 ? 'disabled' : ''}>◀</button>
            <button class="photo-order-btn" style="width:24px; height:24px;" onclick="moveQueueItem(${idx}, 1)" title="Move right in sequence" ${idx === queue.length - 1 ? 'disabled' : ''}>▶</button>
            <button class="photo-order-btn" style="width:24px; height:24px; color:#ef4444;" onclick="removeQueueItem(${idx})" title="Remove">✕</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.moveQueueItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= queue.length) return;
    const [item] = queue.splice(index, 1);
    queue.splice(target, 0, item);
    renderQueue();
  };

  window.removeQueueItem = (index) => {
    URL.revokeObjectURL(queue[index].previewUrl);
    queue.splice(index, 1);
    renderQueue();
  };

  uploadBtn.addEventListener('click', async () => {
    if (queue.length === 0) return;

    uploadBtn.disabled = true;
    const originalText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<span>⚡ Uploading Media Sequence...</span>';

    try {
      const formData = new FormData();
      queue.forEach((item) => {
        formData.append('photos', item.file);
        formData.append('titles', item.title);
        formData.append('categories', item.isVideo ? 'Campaign' : 'User Uploads');
        formData.append('captions', `Uploaded in custom sequence.`);
      });

      const res = await fetch('/api/upload/batch', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);

      if (data.success) {
        queue.forEach(i => URL.revokeObjectURL(i.previewUrl));
        queue = [];
        renderQueue();

        if (Array.isArray(data.images)) {
          window.LK_STATE.images = data.images;
          renderGallery();
        }

        showOrderToast(`${data.newImages ? data.newImages.length : 'All'} media files (photos & videos) uploaded in your custom order!`);
        
        const galleryEl = document.getElementById('media-gallery-grid');
        if (galleryEl) {
          galleryEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        alert(data.message || 'Batch upload failed.');
      }
    } catch (err) {
      console.error('Batch upload error:', err);
      alert('Error uploading media in batch.');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = originalText;
    }
  });
}

// ==========================================
// MOTION REELS MANAGER (Archival Runway & Campaign Reels)
// ==========================================
function renderMotionReels() {
  const container = document.getElementById('motion-reels-grid');
  if (!container) return;

  const reels = window.LK_STATE.motionReels || [];

  if (reels.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--accent-purple); border-radius: 8px;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 0.75rem;">🎬</span>
        <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">
          No Motion Reels in Archive
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem; max-width: 480px; margin-left: auto; margin-right: auto;">
          Upload your runway footage, campaign reels, or clothing preview videos to display and stream them here in high-definition 4K.
        </p>
        <button class="action-btn btn-primary" onclick="window.toggleAddReelPanel(true)" style="padding: 0.65rem 1.5rem;">
          <span>🎬 + Add First Video Reel</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = reels.map((reel, idx) => {
    return `
      <div class="motion-reel-card" data-reel-id="${reel.id}" style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 4px 20px rgba(0,0,0,0.4); transition:transform 0.25s ease, border-color 0.25s ease;">
        <div class="motion-reel-container" style="aspect-ratio:16/9; background:#000000; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center;">
          <video class="motion-reel-video" style="width:100%; height:100%; object-fit:contain; background:#000000; display:block;" controls playsinline preload="metadata" poster="${escapeHtml(reel.poster || '')}">
            <source src="${reel.videoUrl}" type="video/mp4">
            <source src="${reel.videoUrl}" type="video/webm">
            Your browser does not support video streaming.
          </video>
          <button type="button" class="reel-fs-badge" onclick="window.openReelFullscreen('${reel.id}', event)" title="Watch in Fullscreen (100% Uncropped, Entire Video)">
            ⛶ Fullscreen
          </button>
        </div>
        
        <div style="padding: 1.25rem; display:flex; flex-direction:column; flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; gap:0.5rem; flex-wrap:wrap;">
            <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--accent-amber); text-transform:uppercase; letter-spacing:0.08em; background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:4px; border:1px solid rgba(245,158,11,0.25);">
              ${escapeHtml(reel.tag || 'Runway Cut')}
            </span>
            <div style="display:flex; gap:0.35rem; align-items:center; flex-wrap:wrap;">
              <button class="action-btn btn-outline" style="padding:0.25rem 0.6rem; font-size:0.7rem; color:var(--accent-purple-light); border-color:rgba(168,85,247,0.4);" onclick="window.openReelFullscreen('${reel.id}', event)" title="Watch in Fullscreen (Entire Frame Uncropped)">
                ⛶ Fullscreen
              </button>
              <button class="action-btn btn-outline" style="padding:0.25rem 0.6rem; font-size:0.7rem;" onclick="triggerReplaceReelVideo('${reel.id}')" title="Upload a different video for this reel">
                🔄 Replace
              </button>
              <button class="action-btn btn-outline" style="padding:0.25rem 0.6rem; font-size:0.7rem;" onclick="openEditReelModal('${reel.id}')" title="Edit title and description">
                ✏️ Edit
              </button>
              <button class="action-btn btn-outline btn-delete-reel" data-reel-id="${reel.id}" style="padding:0.25rem 0.65rem; font-size:0.7rem; color:var(--accent-red); border-color:rgba(239,68,68,0.35); cursor:pointer;" onclick="handleDeleteReelClick(this, '${reel.id}', event)" title="Remove reel from archive">
                🗑 Delete
              </button>
            </div>
          </div>

          <h3 style="font-family:var(--font-display); font-size:1.15rem; font-weight:800; text-transform:uppercase; margin:0.15rem 0 0.5rem; line-height:1.25;">
            ${escapeHtml(reel.title)}
          </h3>

          <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin:0 0 1rem; flex:1;">
            ${escapeHtml(reel.description || '')}
          </p>

          <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted); display:flex; justify-content:space-between; border-top:1px solid var(--border-subtle); padding-top:0.6rem; margin-top:auto;">
            <span>REEL #${idx + 1}</span>
            <span>${reel.date || '2026-09-24'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
window.renderMotionReels = renderMotionReels;

function initMotionReels() {
  const toggleBtn = document.getElementById('btn-toggle-add-reel');
  const panel = document.getElementById('add-reel-panel');
  const closeBtn = document.getElementById('btn-close-add-reel');
  const cancelBtn = document.getElementById('btn-cancel-add-reel');
  const form = document.getElementById('add-reel-form');
  const statusMsg = document.getElementById('add-reel-status-msg');

  window.toggleAddReelPanel = function(forceOpen) {
    if (!panel) return;
    const isVisible = panel.style.display !== 'none';
    const nextState = forceOpen !== undefined ? forceOpen : !isVisible;
    panel.style.display = nextState ? 'block' : 'none';
    if (nextState) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const titleInput = document.getElementById('reel-title-input');
      if (titleInput) titleInput.focus();
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => window.toggleAddReelPanel());
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.toggleAddReelPanel(false));
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => window.toggleAddReelPanel(false));
  }

  // Add reel form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('reel-file-input');
      const urlInput = document.getElementById('reel-url-input');
      const titleInput = document.getElementById('reel-title-input');
      const tagInput = document.getElementById('reel-tag-input');
      const posterInput = document.getElementById('reel-poster-input');
      const descInput = document.getElementById('reel-desc-input');
      const submitBtn = document.getElementById('btn-submit-add-reel');

      const file = fileInput && fileInput.files && fileInput.files[0];
      const videoUrl = urlInput ? urlInput.value.trim() : '';

      if (!file && !videoUrl) {
        alert('Please choose a video file (.mp4, .mov, .webm) or enter a video stream URL.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Uploading Video...</span>';
      }
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = 'var(--accent-purple-light)';
        statusMsg.textContent = '⏳ Streaming and saving video to assets/videos/...';
      }

      try {
        const formData = new FormData();
        if (file) {
          validateUploadSize(file, 35);
          formData.append('video', file);
        }
        if (videoUrl) formData.append('videoUrl', videoUrl);
        formData.append('title', titleInput ? titleInput.value.trim() : '');
        formData.append('tag', tagInput ? tagInput.value.trim() : 'Runway Cut');
        formData.append('description', descInput ? descInput.value.trim() : '');
        if (posterInput && posterInput.value.trim()) {
          formData.append('poster', posterInput.value.trim());
        }

        const res = await fetch('/api/reels', {
          method: 'POST',
          body: formData
        });

        const data = await safeParseJsonResponse(res);
        if (res.ok && data.success) {
          if (!Array.isArray(window.LK_STATE.motionReels)) {
            window.LK_STATE.motionReels = [];
          }
          if (data.reel) {
            window.LK_STATE.motionReels.unshift(data.reel);
          } else if (Array.isArray(data.reels)) {
            window.LK_STATE.motionReels = data.reels;
          }
          renderMotionReels();
          form.reset();
          if (statusMsg) statusMsg.style.display = 'none';
          window.toggleAddReelPanel(false);
          showOrderToast('🎬 Your video was successfully added to Archival Runway & Campaign Reels!');
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } catch (err) {
        console.error('Reel upload error:', err);
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.color = 'var(--accent-red)';
          statusMsg.textContent = `Upload error: ${err.message}`;
        }
        alert(`Error adding video: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>⚡ Upload &amp; Publish Video Reel</span>';
        }
      }
    });
  }

  // Edit reel modal logic
  const editModal = document.getElementById('edit-reel-modal');
  const closeEditBtn = document.getElementById('btn-close-edit-reel');
  const cancelEditBtn = document.getElementById('btn-cancel-edit-reel');
  const editForm = document.getElementById('edit-reel-form');

  window.openEditReelModal = function(id) {
    const reel = (window.LK_STATE.motionReels || []).find(r => r.id === id);
    if (!reel || !editModal) return;

    document.getElementById('edit-reel-id').value = reel.id;
    document.getElementById('edit-reel-title').value = reel.title || '';
    document.getElementById('edit-reel-tag').value = reel.tag || '';
    document.getElementById('edit-reel-desc').value = reel.description || '';
    document.getElementById('edit-reel-poster').value = reel.poster || '';

    editModal.style.display = 'flex';
  };

  const closeEditModal = () => {
    if (editModal) editModal.style.display = 'none';
  };
  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-reel-id').value;
      const title = document.getElementById('edit-reel-title').value;
      const tag = document.getElementById('edit-reel-tag').value;
      const description = document.getElementById('edit-reel-desc').value;
      const poster = document.getElementById('edit-reel-poster').value;

      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('tag', tag);
        formData.append('description', description);
        formData.append('poster', poster);

        const res = await fetch(`/api/reels/${id}`, {
          method: 'POST',
          body: formData
        });
        const data = await safeParseJsonResponse(res);
        if (res.ok && data.success) {
          const reel = (window.LK_STATE.motionReels || []).find(r => r.id === id);
          if (reel) {
            reel.title = title;
            reel.tag = tag;
            reel.description = description;
            reel.poster = poster;
          }
          renderMotionReels();
          closeEditModal();
          showOrderToast('Reel details updated successfully.');
        } else {
          alert(data.message || 'Error updating reel.');
        }
      } catch (err) {
        alert(`Failed to save reel details: ${err.message}`);
      }
    });
  }
}
window.initMotionReels = initMotionReels;

window.triggerReplaceReelVideo = function(reelId) {
  let fileInput = document.getElementById('reel-replace-file-input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'reel-replace-file-input';
    fileInput.accept = 'video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  }

  fileInput.onchange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    validateUploadSize(file, 35);
    showOrderToast('Uploading replacement video clip...', false);

    const card = document.querySelector(`.motion-reel-card[data-reel-id="${reelId}"]`);
    let spinner = null;
    if (card) {
      spinner = document.createElement('div');
      spinner.className = 'photo-uploading-spinner';
      spinner.innerHTML = `<div class="photo-spinner-ring"></div><span>Uploading replacement video...</span>`;
      card.appendChild(spinner);
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('slotId', reelId);

      const res = await fetch('/api/upload/slot', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok && data.success) {
        const target = (window.LK_STATE.motionReels || []).find(r => r.id === reelId);
        if (target) {
          target.videoUrl = data.url;
        }
        renderMotionReels();
        showOrderToast('🎬 Video reel successfully replaced!');
      } else {
        throw new Error(data.message || 'Failed to replace video');
      }
    } catch (err) {
      console.error(err);
      alert(`Replacement failed: ${err.message}`);
    } finally {
      if (spinner && spinner.parentElement) {
        spinner.parentElement.removeChild(spinner);
      }
      fileInput.value = '';
    }
  };

  fileInput.click();
};

// Universal In-App Brutalist Confirmation Modal (avoids window.confirm/alert sandbox blocks in iframes)
function showAppConfirmModal({ title = 'CONFIRM ACTION', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm }) {
  let modal = document.getElementById('app-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'app-confirm-modal';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:1.5rem;';
    modal.innerHTML = `
      <div style="background:var(--bg-surface, #141416); border:1px solid ${danger ? 'var(--accent-red, #ef4444)' : 'var(--accent-purple, #8b5cf6)'}; border-radius:10px; max-width:480px; width:100%; padding:2rem; box-shadow:0 20px 60px rgba(0,0,0,0.9); color:var(--text-primary, #fff);">
        <div style="font-family:var(--font-mono, monospace); font-size:0.75rem; letter-spacing:0.14em; color:${danger ? 'var(--accent-red, #ef4444)' : 'var(--accent-amber, #f59e0b)'}; text-transform:uppercase; margin-bottom:0.5rem;" id="app-confirm-subtitle">
          ${escapeHtml(title)}
        </div>
        <h3 id="app-confirm-title" style="font-family:var(--font-display, sans-serif); font-size:1.35rem; font-weight:800; text-transform:uppercase; margin-bottom:0.75rem; letter-spacing:0.02em;">
          ${escapeHtml(title)}
        </h3>
        <p id="app-confirm-message" style="font-size:0.9rem; color:var(--text-secondary, #a1a1aa); line-height:1.55; margin-bottom:1.5rem;">
          ${escapeHtml(message)}
        </p>
        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button id="app-confirm-cancel-btn" class="action-btn btn-outline" style="padding:0.6rem 1.25rem; font-size:0.85rem; border-color:var(--border-subtle, #333);">
            ${escapeHtml(cancelText)}
          </button>
          <button id="app-confirm-action-btn" class="action-btn" style="padding:0.6rem 1.4rem; font-size:0.85rem; background:${danger ? 'var(--accent-red, #ef4444)' : 'var(--accent-purple, #8b5cf6)'}; color:#fff; border:none; font-weight:700; cursor:pointer;">
            ${escapeHtml(confirmText)}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    document.getElementById('app-confirm-subtitle').textContent = title;
    document.getElementById('app-confirm-title').textContent = title;
    document.getElementById('app-confirm-message').textContent = message;
    const actionBtn = document.getElementById('app-confirm-action-btn');
    actionBtn.textContent = confirmText;
    actionBtn.style.background = danger ? 'var(--accent-red, #ef4444)' : 'var(--accent-purple, #8b5cf6)';
    document.getElementById('app-confirm-cancel-btn').textContent = cancelText;
  }

  modal.style.display = 'flex';

  const cleanup = () => {
    modal.style.display = 'none';
  };

  const cancelBtn = document.getElementById('app-confirm-cancel-btn');
  const actionBtn = document.getElementById('app-confirm-action-btn');

  const onCancelClick = () => {
    cleanup();
    cancelBtn.removeEventListener('click', onCancelClick);
    actionBtn.removeEventListener('click', onActionClick);
  };

  const onActionClick = async () => {
    cleanup();
    cancelBtn.removeEventListener('click', onCancelClick);
    actionBtn.removeEventListener('click', onActionClick);
    if (typeof onConfirm === 'function') {
      await onConfirm();
    }
  };

  cancelBtn.onclick = onCancelClick;
  actionBtn.onclick = onActionClick;
}
window.showAppConfirmModal = showAppConfirmModal;

async function executeDeleteReel(id) {
  try {
    showOrderToast('⏳ Deleting video reel from archive...');
    let res = await fetch(`/api/reels/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      // Fallback for proxies that restrict DELETE HTTP verb
      res = await fetch(`/api/reels/${id}/delete`, { method: 'POST' });
    }
    const data = await safeParseJsonResponse(res);
    if (res.ok && data.success) {
      window.LK_STATE.motionReels = (window.LK_STATE.motionReels || []).filter(r => r.id !== id);
      renderMotionReels();
      showOrderToast('🎬 Video reel successfully removed from archive.');
    } else {
      showOrderToast(data.message || 'Error removing reel from storage.', false);
    }
  } catch (err) {
    console.error('Delete error:', err);
    showOrderToast(`Failed to delete reel: ${err.message}`, false);
  }
}
window.executeDeleteReel = executeDeleteReel;

window.deleteMotionReel = function(id) {
  const reel = (window.LK_STATE.motionReels || []).find(r => r.id === id);
  const title = reel ? `"${reel.title}"` : 'this video reel';

  showAppConfirmModal({
    title: 'DELETE ARCHIVAL REEL',
    message: `Are you sure you want to permanently remove ${title} from Motion Reels? The video and associated assets will be deleted from storage.`,
    confirmText: '🗑 Yes, Delete Reel',
    cancelText: 'Cancel',
    danger: true,
    onConfirm: () => executeDeleteReel(id)
  });
};

window.handleDeleteReelClick = function(btn, id, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // If already clicked once and in confirming state, immediately execute deletion
  if (btn && btn.dataset.confirming === 'true') {
    btn.dataset.confirming = 'false';
    btn.disabled = true;
    btn.innerHTML = '⏳ Deleting...';
    executeDeleteReel(id);
    return;
  }

  // Otherwise arm the inline button for immediate 2nd click confirmation
  if (btn) {
    btn.dataset.confirming = 'true';
    const prevHtml = btn.innerHTML;
    btn.innerHTML = '⚠️ Confirm?';
    btn.style.background = 'var(--accent-red, #ef4444)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--accent-red, #ef4444)';

    setTimeout(() => {
      if (btn && btn.dataset.confirming === 'true') {
        btn.dataset.confirming = 'false';
        btn.innerHTML = prevHtml;
        btn.style.background = '';
        btn.style.color = 'var(--accent-red)';
        btn.style.borderColor = 'rgba(239,68,68,0.35)';
      }
    }, 4000);
  }

  // Also trigger the modal dialog so user has a prominent modal option as well
  deleteMotionReel(id);
};

// ==========================================
// FULLSCREEN UNCROPPED VIDEO SYSTEM & THEATER CONTROLLER
// ==========================================
function enforceFullscreenContain() {
  const fsEl = document.fullscreenElement || 
               document.webkitFullscreenElement || 
               document.mozFullScreenElement || 
               document.msFullscreenElement;
  if (fsEl) {
    if (fsEl.tagName === 'VIDEO') {
      fsEl.style.setProperty('object-fit', 'contain', 'important');
      fsEl.style.setProperty('background', '#000000', 'important');
      fsEl.style.setProperty('width', '100vw', 'important');
      fsEl.style.setProperty('height', '100vh', 'important');
      fsEl.style.setProperty('max-width', '100vw', 'important');
      fsEl.style.setProperty('max-height', '100vh', 'important');
    } else {
      fsEl.querySelectorAll('video').forEach(v => {
        v.style.setProperty('object-fit', 'contain', 'important');
        v.style.setProperty('background', '#000000', 'important');
        v.style.setProperty('width', '100vw', 'important');
        v.style.setProperty('height', '100vh', 'important');
        v.style.setProperty('max-width', '100vw', 'important');
        v.style.setProperty('max-height', '100vh', 'important');
      });
    }
  }
}

['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
  document.addEventListener(evt, enforceFullscreenContain, true);
});

window.openReelFullscreen = function(reelId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const reel = (window.LK_STATE.motionReels || []).find(r => r.id === reelId);
  const card = document.querySelector(`.motion-reel-card[data-reel-id="${reelId}"]`);
  const cardVid = card ? card.querySelector('video') : null;

  // Open Theater Modal (guarantees uncropped, full-frame viewing even in iframe)
  openTheaterModal(reel, cardVid);
};

window.openTheaterModal = function(reel, sourceVid) {
  if (!reel) return;
  const modal = document.getElementById('theater-video-modal');
  if (!modal) return;

  const player = document.getElementById('theater-video-player');
  const tagEl = document.getElementById('theater-reel-tag');
  const titleEl = document.getElementById('theater-reel-title');
  const fitBtn = document.getElementById('theater-fit-toggle');

  if (tagEl) tagEl.textContent = reel.tag || 'Motion Reel';
  if (titleEl) titleEl.textContent = reel.title || 'Archival Video Reel';

  if (player) {
    const currentTime = sourceVid ? sourceVid.currentTime : 0;
    const isPaused = sourceVid ? sourceVid.paused : false;

    player.src = reel.videoUrl;
    player.poster = reel.poster || '';
    try {
      player.currentTime = currentTime;
    } catch(e) {}
    player.style.setProperty('object-fit', 'contain', 'important');
    player.style.setProperty('background', '#000000', 'important');

    if (fitBtn) {
      fitBtn.innerHTML = '↔ Fit Entire Video';
      fitBtn.setAttribute('data-mode', 'contain');
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!isPaused) {
      player.play().catch(() => {});
    }
  }
};

window.closeTheaterModal = function() {
  const modal = document.getElementById('theater-video-modal');
  const player = document.getElementById('theater-video-player');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (player) {
    try {
      player.pause();
      player.src = '';
    } catch (e) {}
  }
  const fs = document.fullscreenElement || document.webkitFullscreenElement;
  if (fs) {
    try {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } catch(e) {}
  }
};

function initTheaterModal() {
  const closeBtn = document.getElementById('theater-close');
  const fitBtn = document.getElementById('theater-fit-toggle');
  const nativeFsBtn = document.getElementById('theater-native-fs');
  const modal = document.getElementById('theater-video-modal');
  const player = document.getElementById('theater-video-player');

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeTheaterModal);
  }

  if (fitBtn && player) {
    fitBtn.addEventListener('click', () => {
      const currentMode = fitBtn.getAttribute('data-mode') || 'contain';
      if (currentMode === 'contain') {
        player.style.setProperty('object-fit', 'cover', 'important');
        fitBtn.setAttribute('data-mode', 'cover');
        fitBtn.innerHTML = '🔍 Fill Screen (Cropped)';
      } else {
        player.style.setProperty('object-fit', 'contain', 'important');
        fitBtn.setAttribute('data-mode', 'contain');
        fitBtn.innerHTML = '↔ Fit Entire Video';
      }
    });
  }

  if (nativeFsBtn && player) {
    nativeFsBtn.addEventListener('click', () => {
      const req = player.requestFullscreen || player.webkitRequestFullscreen || player.mozRequestFullScreen || player.msRequestFullscreen;
      if (req) {
        try {
          req.call(player);
        } catch(e) {
          console.warn('Native requestFullscreen failed:', e);
        }
      }
    });
  }

  // Close on backdrop click (if clicking wrapper outside video)
  const wrapper = document.querySelector('.theater-video-wrapper');
  if (wrapper) {
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper) {
        window.closeTheaterModal();
      }
    });
  }

  // Keyboard shortcut ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const thModal = document.getElementById('theater-video-modal');
      if (thModal && thModal.style.display !== 'none') {
        window.closeTheaterModal();
      }
    }
  });
}



