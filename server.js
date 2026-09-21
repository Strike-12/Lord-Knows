import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Ensure directories exist
const assetsImagesDir = path.join(__dirname, 'assets', 'images');
const assetsVideosDir = path.join(__dirname, 'assets', 'videos');
const dataDir = path.join(__dirname, 'data');
const storageFilePath = path.join(dataDir, 'storage.json');
const contactReceivedFilePath = path.join(dataDir, 'contactReceived.json');

[assetsImagesDir, assetsVideosDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize contactReceived.json if not present
if (!fs.existsSync(contactReceivedFilePath)) {
  try {
    fs.writeFileSync(contactReceivedFilePath, '[]', 'utf-8');
  } catch (e) {
    console.error('Error initializing contactReceived.json:', e);
  }
}

// Helper for Reading & Writing Contact Submissions (data/contactReceived.json)
function getContacts() {
  try {
    if (!fs.existsSync(contactReceivedFilePath)) {
      fs.writeFileSync(contactReceivedFilePath, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(contactReceivedFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading contactReceived.json:', err);
    return [];
  }
}

function saveContacts(contacts) {
  try {
    fs.writeFileSync(contactReceivedFilePath, JSON.stringify(contacts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving contactReceived.json:', err);
    return false;
  }
}

// Helper for Reading & Writing App Storage
function getStorage() {
  try {
    if (fs.existsSync(storageFilePath)) {
      const raw = fs.readFileSync(storageFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading storage.json:', err);
  }
  return {
    countdown: {
      targetDate: '2027-01-01T00:00:00.000Z',
      title: 'Lord Knows Genesis Rebirth',
      subtitle: 'Worldwide Release & Capsule 05 Premiere',
      description: 'Archival heavyweight silhouette drop. January 1, 2027.',
      status: 'Ticking Down'
    },
    images: [],
    products: [],
    rsvps: [],
    systemSettings: {
      brandName: 'Lord Knows Clothing',
      theme: 'Dark Brutalist Aesthetic',
      appStorageVersion: '2.4.0'
    }
  };
}

function saveStorage(data) {
  try {
    fs.writeFileSync(storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving storage.json:', err);
    return false;
  }
}

// Multer Storage Configuration for User Uploaded Pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsImagesDir);
  },
  filename: (req, file, cb) => {
    // Clean original name and timestamp to avoid clashes
    const cleanExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const baseName = path.basename(file.originalname, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `user-${Date.now()}-${baseName}${cleanExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    // Permissive filter accepting any image extension or mimetype (JPEG, JPG, PNG, HEIC, WEBP, etc.)
    cb(null, true);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

// =================== API ROUTES ===================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =================== CONTACT FORM ENDPOINT ===================
// POST /api/contact
app.post('/api/contact', (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;

    // Validate required fields
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ error: 'First name is required.' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ error: 'Last name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Reason validation
    const validReasons = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Please select a valid Reason for Contact.' });
    }

    // Message validation
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Read contact submissions from data/contactReceived.json
    const contacts = getContacts();

    // Create the new contact record matching exact format
    const newRecord = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      recipient: 'keenelsen2@gmail.com',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      reason: reason,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      replied: false,
      repliedAt: null
    };

    // Append to array
    contacts.push(newRecord);

    // Write back to data/contactReceived.json
    const saved = saveContacts(contacts);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to write contact data to storage.' });
    }

    // Return the saved record with HTTP 201
    return res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error handling /api/contact submission:', err);
    return res.status(500).json({ error: 'Internal server error while processing contact form.' });
  }
});

// Admin Authentication & Messages Management
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'elsenadmin2026';

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: 'authenticated-session' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin password' });
});

// Middleware for Admin verification
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const passHeader = req.headers['x-admin-password'];
  if (authHeader === 'Bearer authenticated-session' || passHeader === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized: Admin authentication required.' });
}

// GET /api/admin/messages (Newest first)
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const contacts = getContacts();
  // Sort newest first
  const sorted = [...contacts].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return res.json({ success: true, messages: sorted });
});

// PATCH /api/admin/messages/:id/replied
app.patch('/api/admin/messages/:id/replied', requireAdmin, (req, res) => {
  const { id } = req.params;
  const contacts = getContacts();
  const index = contacts.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  contacts[index].replied = true;
  contacts[index].repliedAt = new Date().toISOString();

  const saved = saveContacts(contacts);
  if (!saved) {
    return res.status(500).json({ error: 'Failed to update storage.' });
  }

  return res.json({ success: true, message: contacts[index] });
});

// Full App Storage Endpoint
app.get('/api/storage', (req, res) => {
  const data = getStorage();
  res.json({ success: true, data });
});

// Countdown Info Endpoint
app.get('/api/countdown', (req, res) => {
  const storageData = getStorage();
  res.json({
    success: true,
    countdown: storageData.countdown || {
      targetDate: '2027-01-01T00:00:00.000Z',
      title: 'Lord Knows Genesis Rebirth',
      subtitle: 'Worldwide Release & Capsule 05 Premiere',
      description: 'Archival heavyweight silhouette drop on January 1, 2027.',
      status: 'Ticking Down'
    }
  });
});

// Update Countdown Settings (Admin)
app.post('/api/countdown', (req, res) => {
  const storageData = getStorage();
  const { targetDate, title, subtitle, description, status } = req.body;
  
  storageData.countdown = {
    ...storageData.countdown,
    ...(targetDate && { targetDate }),
    ...(title && { title }),
    ...(subtitle && { subtitle }),
    ...(description && { description }),
    ...(status && { status })
  };

  saveStorage(storageData);
  res.json({ success: true, message: 'Countdown updated successfully', countdown: storageData.countdown });
});

// Upload User Pictures Endpoint
app.post(['/api/upload', '/api/upload/picture'], upload.single('picture'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided in upload.' });
    }

    const { title, category, caption, uploader } = req.body;
    const storageData = getStorage();

    const newImage = {
      id: `img-${Date.now()}`,
      title: title && title.trim() ? title.trim() : path.basename(req.file.originalname),
      category: category || 'User Uploads',
      url: `/assets/images/${req.file.filename}`,
      thumbnail: `/assets/images/${req.file.filename}`,
      caption: caption && caption.trim() ? caption.trim() : 'User uploaded photograph.',
      uploader: uploader && uploader.trim() ? uploader.trim() : 'Community Member',
      date: new Date().toISOString().split('T')[0],
      filename: req.file.filename,
      sizeBytes: req.file.size,
      isUserUpload: true
    };

    if (!Array.isArray(storageData.images)) {
      storageData.images = [];
    }

    // Add to beginning of images list
    storageData.images.unshift(newImage);
    saveStorage(storageData);

    res.status(201).json({
      success: true,
      message: 'Picture successfully uploaded and stored in App Storage.',
      image: newImage
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error processing image upload.' });
  }
});

// Replace Elsen's Profile Photo
app.post('/api/profile/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const targetPublic = path.join(assetsImagesDir, 'elsen_profile.jpg');
    const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'elsen_profile.jpg');

    fs.copyFileSync(req.file.path, targetPublic);
    try {
      if (fs.existsSync(path.dirname(targetSrc))) {
        fs.copyFileSync(req.file.path, targetSrc);
      }
    } catch (e) {
      console.warn('Could not copy to src directory:', e);
    }

    const timestamp = Date.now();
    res.status(200).json({
      success: true,
      message: 'Real profile photo uploaded successfully.',
      url: `/assets/images/elsen_profile.jpg?t=${timestamp}`
    });
  } catch (err) {
    console.error('Profile photo upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error saving profile photo.' });
  }
});

// Replace Elsen's Real Hand Drawing
app.post('/api/profile/upload-drawing', upload.single('drawing'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No drawing file provided.' });
    }

    const targetPublic = path.join(assetsImagesDir, 'elsen_drawings.jpg');
    const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'elsen_drawings.jpg');

    fs.copyFileSync(req.file.path, targetPublic);
    try {
      if (fs.existsSync(path.dirname(targetSrc))) {
        fs.copyFileSync(req.file.path, targetSrc);
      }
    } catch (e) {
      console.warn('Could not copy to src directory:', e);
    }

    const timestamp = Date.now();
    res.status(200).json({
      success: true,
      message: 'Real drawing uploaded successfully.',
      url: `/assets/images/elsen_drawings.jpg?t=${timestamp}`
    });
  } catch (err) {
    console.error('Drawing upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error saving drawing.' });
  }
});

// Replace Reselling Clothes & Shoes Photo
app.post('/api/reselling/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const targetPublicJpg = path.join(assetsImagesDir, 'reselling_clothes_shoes.jpg');
    const targetPublicPng = path.join(assetsImagesDir, 'reselling_clothes_shoes.png');
    const targetSrcJpg = path.join(__dirname, 'src', 'assets', 'images', 'reselling_clothes_shoes.jpg');

    fs.copyFileSync(req.file.path, targetPublicJpg);
    fs.copyFileSync(req.file.path, targetPublicPng);
    try {
      if (fs.existsSync(path.dirname(targetSrcJpg))) {
        fs.copyFileSync(req.file.path, targetSrcJpg);
      }
    } catch (e) {
      console.warn('Could not copy to src directory:', e);
    }

    const timestamp = Date.now();
    res.status(200).json({
      success: true,
      message: 'Reselling clothes & shoes photo uploaded successfully.',
      url: `/assets/images/reselling_clothes_shoes.jpg?t=${timestamp}`
    });
  } catch (err) {
    console.error('Reselling photo upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error saving reselling photo.' });
  }
});

// Delete Image from App Storage
app.delete('/api/storage/images/:id', (req, res) => {
  const { id } = req.params;
  const storageData = getStorage();

  const imgIndex = storageData.images.findIndex(img => img.id === id);
  if (imgIndex === -1) {
    return res.status(404).json({ success: false, message: 'Image not found in storage.' });
  }

  const [removedImg] = storageData.images.splice(imgIndex, 1);

  // If local file, optionally delete from disk
  if (removedImg.filename) {
    const filePath = path.join(assetsImagesDir, removedImg.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete image file on disk:', e);
      }
    }
  }

  saveStorage(storageData);
  res.json({ success: true, message: 'Image deleted from App Storage.', id });
});

// RSVP for January 1, 2027 Drop
app.post('/api/rsvp', (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).json({ success: false, message: 'Email or phone required.' });
  }

  const storageData = getStorage();
  if (!Array.isArray(storageData.rsvps)) {
    storageData.rsvps = [];
  }

  const existing = storageData.rsvps.find(r => (email && r.email === email) || (phone && r.phone === phone));
  if (existing) {
    return res.json({ success: true, message: 'You are already registered for the January 1, 2027 drop alert list!' });
  }

  storageData.rsvps.push({
    id: `rsvp-${Date.now()}`,
    email: email || '',
    phone: phone || '',
    date: new Date().toISOString(),
    notified: false
  });

  saveStorage(storageData);
  res.status(201).json({ success: true, message: 'Confirmed. You have reserved priority access for January 1, 2027.' });
});

// Products API
app.get('/api/products', (req, res) => {
  const storageData = getStorage();
  res.json({ success: true, products: storageData.products || [] });
});

app.post('/api/products', (req, res) => {
  const storageData = getStorage();
  const newProduct = {
    id: `lk-${Date.now()}`,
    ...req.body,
    featured: req.body.featured ?? false
  };

  if (!Array.isArray(storageData.products)) {
    storageData.products = [];
  }
  storageData.products.unshift(newProduct);
  saveStorage(storageData);

  res.status(201).json({ success: true, product: newProduct });
});

// Reset App Storage to Defaults
app.post('/api/storage/reset', (req, res) => {
  // Read initial seed if needed
  const defaultStorage = {
    countdown: {
      targetDate: '2027-01-01T00:00:00.000Z',
      title: 'Lord Knows Genesis Rebirth',
      subtitle: 'Worldwide Release & Capsule 05 Premiere',
      description: 'Archival heavyweight silhouette drop on January 1, 2027.',
      status: 'Ticking Down'
    },
    images: [],
    products: [],
    rsvps: [],
    systemSettings: {
      brandName: 'Lord Knows Clothing',
      theme: 'Dark Brutalist Aesthetic',
      appStorageVersion: '2.4.0'
    }
  };
  saveStorage(defaultStorage);
  res.json({ success: true, message: 'Storage reset to defaults.' });
});

// =================== PAGE ROUTES ===================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/media.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'media.html'));
});

app.get('/future.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'future.html'));
});

// choice1.html is renamed to collection.html (and choice1.html redirects/serves it)
app.get('/collection.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'collection.html'));
});
app.get('/choice1.html', (req, res) => {
  res.redirect('/collection.html');
});

// choice2.html is renamed to lookbook.html (and choice2.html redirects/serves it)
app.get('/lookbook.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'lookbook.html'));
});
app.get('/choice2.html', (req, res) => {
  res.redirect('/lookbook.html');
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Global Error Handler (handles multer errors cleanly as JSON)
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(400).json({
    success: false,
    message: err.message || 'File upload error occurred. Please verify file format.'
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lord Knows Server running at http://0.0.0.0:${PORT}`);
  console.log(`App Storage active at: ${storageFilePath}`);
});
