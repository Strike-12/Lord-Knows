/**
 * LORD KNOWS CLOTHING // ADMIN DASHBOARD JAVASCRIPT
 * Controls App Storage Inspection, Picture Deletion/Upload, and January 1, 2027 Countdown Config
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminSecurityGate();
});

function initAdminSecurityGate() {
  const overlay = document.getElementById('admin-login-overlay');
  const dashboard = document.getElementById('admin-dashboard-content');
  const loginForm = document.getElementById('admin-login-form');
  const passcodeInput = document.getElementById('admin-passcode-input');
  const errorEl = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');

  function unlock() {
    if (overlay) overlay.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    initAdminDashboard();
  }

  // Check existing session
  if (sessionStorage.getItem('lk_admin_auth') === 'true') {
    unlock();
  } else {
    if (overlay) overlay.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (passcodeInput.value || '').trim().toLowerCase();
      if (code === '2027' || code === 'elsen' || code === 'lordknows') {
        sessionStorage.setItem('lk_admin_auth', 'true');
        if (errorEl) errorEl.style.display = 'none';
        unlock();
      } else {
        if (errorEl) errorEl.style.display = 'block';
        passcodeInput.value = '';
        passcodeInput.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('lk_admin_auth');
      window.location.reload();
    });
  }
}

async function initAdminDashboard() {
  loadAdminStatsAndData();
  initAdminTabs();
  initCountdownConfigForm();
  initAdminUploadForm();
  initProductAddForm();
  initAdminOfficialPhotoReplacers();
}

async function loadAdminStatsAndData() {
  try {
    const res = await fetch('/api/storage');
    const { success, data } = await res.json();
    if (!success || !data) return;

    // Render Stats
    const totalImagesEl = document.getElementById('stat-total-images');
    const userImagesEl = document.getElementById('stat-user-images');
    const rsvpCountEl = document.getElementById('stat-rsvp-count');
    const countdownStatusEl = document.getElementById('stat-countdown-status');

    const images = data.images || [];
    const userImages = images.filter(img => img.isUserUpload || img.category === 'User Uploads');
    const rsvps = data.rsvps || [];

    if (totalImagesEl) totalImagesEl.textContent = images.length;
    if (userImagesEl) userImagesEl.textContent = userImages.length;
    if (rsvpCountEl) rsvpCountEl.textContent = rsvps.length;
    if (countdownStatusEl) countdownStatusEl.textContent = 'JAN 1, 2027';

    // Populate Countdown form
    if (data.countdown) {
      const targetInput = document.getElementById('cfg-target-date');
      const titleInput = document.getElementById('cfg-title');
      const subtitleInput = document.getElementById('cfg-subtitle');
      const descInput = document.getElementById('cfg-description');

      if (targetInput) targetInput.value = data.countdown.targetDate ? data.countdown.targetDate.substring(0, 16) : '2027-01-01T00:00';
      if (titleInput) titleInput.value = data.countdown.title || '';
      if (subtitleInput) subtitleInput.value = data.countdown.subtitle || '';
      if (descInput) descInput.value = data.countdown.description || '';
    }

    // Render Images Table
    renderAdminImagesTable(images);

    // Render Raw Storage JSON
    const rawBox = document.getElementById('raw-storage-json');
    if (rawBox) {
      rawBox.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.error('Failed to load storage data:', err);
  }
}

function renderAdminImagesTable(images) {
  const tbody = document.getElementById('admin-images-table-body');
  if (!tbody) return;

  if (images.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No images found in App Storage.</td></tr>';
    return;
  }

  tbody.innerHTML = images.map(img => `
    <tr style="border-bottom:1px solid var(--border-subtle);">
      <td style="padding:0.75rem;">
        <img src="${img.url}" alt="${escapeHtml(img.title)}" style="width:48px; height:48px; object-fit:cover; border-radius:4px; border:1px solid var(--border-subtle);" onerror="this.src='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=100&q=80'" />
      </td>
      <td style="padding:0.75rem; font-weight:600;">
        ${escapeHtml(img.title)}
        ${img.isUserUpload ? '<span style="color:var(--accent-amber); font-size:0.7rem; margin-left:0.4rem; font-family:var(--font-mono);">[USER UPLOAD]</span>' : ''}
      </td>
      <td style="padding:0.75rem; font-family:var(--font-mono); font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(img.category)}</td>
      <td style="padding:0.75rem; font-family:var(--font-mono); font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(img.uploader || 'Studio')}</td>
      <td style="padding:0.75rem; font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted);">${img.date || 'N/A'}</td>
      <td style="padding:0.75rem;">
        <button class="action-btn btn-outline" style="padding:0.35rem 0.65rem; color:var(--accent-red); border-color:rgba(239, 68, 68, 0.4);" onclick="deleteImage('${img.id}')">
          DELETE
        </button>
      </td>
    </tr>
  `).join('');
}

window.deleteImage = async function(id) {
  if (!confirm('Are you sure you want to remove this picture from App Storage?')) return;

  try {
    const res = await fetch(`/api/storage/images/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok) {
      alert('Picture removed from App Storage.');
      loadAdminStatsAndData();
    } else {
      alert(`Error deleting image: ${result.message}`);
    }
  } catch (err) {
    alert(`Deletion request failed: ${err.message}`);
  }
};

function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const sections = document.querySelectorAll('.admin-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.style.display = 'none');

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.style.display = 'block';
    });
  });
}

function initCountdownConfigForm() {
  const form = document.getElementById('admin-countdown-form');
  const statusBox = document.getElementById('admin-countdown-status-msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetDate = document.getElementById('cfg-target-date').value;
    const title = document.getElementById('cfg-title').value;
    const subtitle = document.getElementById('cfg-subtitle').value;
    const description = document.getElementById('cfg-description').value;

    try {
      const res = await fetch('/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDate: new Date(targetDate).toISOString(),
          title,
          subtitle,
          description
        })
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok) {
        if (statusBox) statusBox.innerHTML = '<span style="color:#22c55e">✓ January 1, 2027 Countdown updated successfully in App Storage!</span>';
        loadAdminStatsAndData();
      }
    } catch (err) {
      if (statusBox) statusBox.innerHTML = `<span style="color:var(--accent-red)">Update error: ${err.message}</span>`;
    }
  });
}

function initAdminUploadForm() {
  const form = document.getElementById('admin-quick-upload-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('admin-upload-file');
    if (!fileInput.files || !fileInput.files[0]) {
      alert('Please select an image or video file first.');
      return;
    }

    const file = fileInput.files[0];
    const readyFile = await normalizeToJpeg(file);
    const formData = new FormData();
    formData.append('picture', readyFile);
    formData.append('title', document.getElementById('admin-upload-title').value || file.name);
    formData.append('category', document.getElementById('admin-upload-category').value);
    formData.append('caption', document.getElementById('admin-upload-caption').value || '');
    formData.append('uploader', 'Admin Dashboard');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok) {
        alert('Media successfully uploaded and added to App Storage!');
        form.reset();
        loadAdminStatsAndData();
      } else {
        alert(data.message || 'Upload error');
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    }
  });
}

function initProductAddForm() {
  const form = document.getElementById('admin-add-product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value) || 0;
    const category = document.getElementById('prod-category').value;
    const color = document.getElementById('prod-color').value || 'Obsidian';
    const image = document.getElementById('prod-image').value || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
    const description = document.getElementById('prod-desc').value || '';

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price,
          category,
          color,
          image,
          description,
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 25
        })
      });
      if (res.ok) {
        alert('Product added to catalog and stored in App Storage!');
        form.reset();
        loadAdminStatsAndData();
      }
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    }
  });
}

window.copyStorageJSON = function() {
  const rawBox = document.getElementById('raw-storage-json');
  if (rawBox) {
    navigator.clipboard.writeText(rawBox.textContent);
    alert('App Storage JSON copied to clipboard!');
  }
};

window.resetAppStorage = async function() {
  if (!confirm('Warning: This will reset App Storage to initial defaults. Continue?')) return;
  try {
    const res = await fetch('/api/storage/reset', { method: 'POST' });
    if (res.ok) {
      alert('App Storage reset to defaults.');
      loadAdminStatsAndData();
    }
  } catch (err) {
    alert(`Reset error: ${err.message}`);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to safely parse server responses, converting HTML error pages (e.g. 413, 502, 503, 404) into friendly error messages
async function safeParseJsonResponse(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {}
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {}

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

function validateUploadSize(file, maxMb = 30) {
  if (!file) return true;
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMb} MB). Maximum allowed upload size is ${maxMb} MB. Please select a smaller video clip or photo.`);
  }
  return true;
}

// Convert any image file to standard JPEG in browser, or return video file directly
async function normalizeToJpeg(file) {
  if (!file) return null;
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 2400;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
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
  });
}

function initAdminOfficialPhotoReplacers() {
  const profileInput = document.getElementById('admin-upload-profile-input');
  const resellingInput = document.getElementById('admin-upload-reselling-input');
  const drawingInput = document.getElementById('admin-upload-drawing-input');
  const syncBadge = document.getElementById('admin-photo-sync-badge');

  async function handleUpload(file, endpoint, previewId, successMsg) {
    if (!file) return;
    if (syncBadge) {
      syncBadge.textContent = '⏳ CONVERTING & UPLOADING...';
      syncBadge.style.background = 'rgba(234, 179, 8, 0.15)';
      syncBadge.style.color = '#eab308';
    }

    try {
      const readyFile = await normalizeToJpeg(file);
      const formData = new FormData();
      formData.append(endpoint.includes('drawing') ? 'drawing' : 'photo', readyFile);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      const data = await safeParseJsonResponse(res);
      if (res.ok && data.success) {
        if (syncBadge) {
          syncBadge.textContent = '✓ UPDATED SUCCESSFULLY';
          syncBadge.style.background = 'rgba(34, 197, 94, 0.15)';
          syncBadge.style.color = '#22c55e';
          setTimeout(() => {
            syncBadge.textContent = '● SYNC READY';
            syncBadge.style.background = 'rgba(168,85,247,0.15)';
            syncBadge.style.color = 'var(--accent-purple-light)';
          }, 3500);
        }
        const previewImg = document.getElementById(previewId);
        if (previewImg && data.url) {
          previewImg.src = data.url;
        }
        alert(successMsg);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      if (syncBadge) {
        syncBadge.textContent = '✕ UPLOAD FAILED';
        syncBadge.style.background = 'rgba(239, 68, 68, 0.15)';
        syncBadge.style.color = '#ef4444';
      }
      alert(`Error uploading photo: ${err.message}`);
    }
  }

  if (profileInput) {
    profileInput.addEventListener('change', () => {
      if (profileInput.files && profileInput.files[0]) {
        handleUpload(profileInput.files[0], '/api/profile/upload-photo', 'admin-preview-profile', 'Elsen profile photo updated successfully!');
      }
    });
  }

  if (resellingInput) {
    resellingInput.addEventListener('change', () => {
      if (resellingInput.files && resellingInput.files[0]) {
        handleUpload(resellingInput.files[0], '/api/reselling/upload-photo', 'admin-preview-reselling', 'Selling clothes and shoes photo updated successfully!');
      }
    });
  }

  if (drawingInput) {
    drawingInput.addEventListener('change', () => {
      if (drawingInput.files && drawingInput.files[0]) {
        handleUpload(drawingInput.files[0], '/api/profile/upload-drawing', 'admin-preview-drawing', 'Drawing art photo updated successfully!');
      }
    });
  }
}
