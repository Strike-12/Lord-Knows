/**
 * LORD KNOWS CLOTHING // ADMIN DASHBOARD JAVASCRIPT
 * Controls App Storage Inspection, Picture Deletion/Upload, and January 1, 2027 Countdown Config
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

async function initAdminDashboard() {
  loadAdminStatsAndData();
  initAdminTabs();
  initCountdownConfigForm();
  initAdminUploadForm();
  initProductAddForm();
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
      const data = await res.json();
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
      alert('Please select an image file first.');
      return;
    }

    const formData = new FormData();
    formData.append('picture', fileInput.files[0]);
    formData.append('title', document.getElementById('admin-upload-title').value || fileInput.files[0].name);
    formData.append('category', document.getElementById('admin-upload-category').value);
    formData.append('caption', document.getElementById('admin-upload-caption').value || '');
    formData.append('uploader', 'Admin Dashboard');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert('Image successfully uploaded and added to App Storage!');
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
