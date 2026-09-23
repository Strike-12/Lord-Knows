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

// Helper to determine if an uploaded file is a video
function isVideoFile(file) {
  if (!file) return false;
  if (file.mimetype && file.mimetype.startsWith('video/')) return true;
  const ext = path.extname(file.originalname || file.filename || '').toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v', '.ogg', '.ogv', '.avi', '.mkv'].includes(ext);
}

// Multer Storage Configuration for User Uploaded Pictures & Videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVid = isVideoFile(file);
    cb(null, isVid ? assetsVideosDir : assetsImagesDir);
  },
  filename: (req, file, cb) => {
    // Clean original name and timestamp to avoid clashes
    const isVid = isVideoFile(file);
    const cleanExt = path.extname(file.originalname).toLowerCase() || (isVid ? '.mp4' : '.jpg');
    const baseName = path.basename(file.originalname, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `user-${Date.now()}-${baseName}${cleanExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 35 * 1024 * 1024 }, // 35 MB limit matching container proxy limits
  fileFilter: (req, file, cb) => {
    // Permissive filter accepting any image or video extension or mimetype
    cb(null, true);
  }
});

// Helper to safely extract uploaded file from req regardless of field name
function getUploadedFile(req) {
  if (req.file) return req.file;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === 'object') {
    const keys = Object.keys(req.files);
    for (const k of keys) {
      if (Array.isArray(req.files[k]) && req.files[k].length > 0) {
        return req.files[k][0];
      }
    }
  }
  return null;
}

// Helper to safely extract multiple files for batch uploads
function getUploadedFiles(req) {
  if (req.files && Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') {
    const all = [];
    Object.values(req.files).forEach(val => {
      if (Array.isArray(val)) all.push(...val);
      else if (val) all.push(val);
    });
    if (all.length > 0) return all;
  }
  if (req.file) return [req.file];
  return [];
}

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

// Upload User Pictures & Videos Endpoint
app.post(['/api/upload', '/api/upload/picture', '/api/upload/media'], upload.any(), (req, res) => {
  try {
    const file = getUploadedFile(req);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No media file provided in upload.' });
    }

    const { title, category, caption, uploader } = req.body;
    const storageData = getStorage();
    const isVid = isVideoFile(file);
    const mediaUrl = isVid ? `/assets/videos/${file.filename}` : `/assets/images/${file.filename}`;

    const newMedia = {
      id: `img-${Date.now()}`,
      title: title && title.trim() ? title.trim() : path.basename(file.originalname),
      category: category || (isVid ? 'Campaign' : 'User Uploads'),
      mediaType: isVid ? 'video' : 'image',
      url: mediaUrl,
      thumbnail: mediaUrl,
      caption: caption && caption.trim() ? caption.trim() : (isVid ? 'User uploaded video clip.' : 'User uploaded photograph.'),
      uploader: uploader && uploader.trim() ? uploader.trim() : 'Community Member',
      date: new Date().toISOString().split('T')[0],
      filename: file.filename,
      sizeBytes: file.size,
      isUserUpload: true
    };

    if (!Array.isArray(storageData.images)) {
      storageData.images = [];
    }

    // Add to beginning of images list
    storageData.images.unshift(newMedia);
    saveStorage(storageData);

    res.status(201).json({
      success: true,
      message: `${isVid ? 'Video' : 'Picture'} successfully uploaded and stored in App Storage.`,
      image: newMedia,
      mediaType: newMedia.mediaType
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error processing media upload.' });
  }
});

// Replace Elsen's Hero Profile Photo / Video (Slot 1 Profile - strictly independent of featured media)
app.post('/api/profile/upload-photo', upload.any(), (req, res) => {
  try {
    const file = getUploadedFile(req);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No photo or video file provided.' });
    }

    const isVid = isVideoFile(file);
    const timestamp = Date.now();
    let finalUrl = isVid ? `/assets/videos/${file.filename}?t=${timestamp}` : `/assets/images/${file.filename}?t=${timestamp}`;

    if (!isVid) {
      const targetPublic = path.join(assetsImagesDir, 'hero_profile.jpg');
      const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'hero_profile.jpg');
      fs.copyFileSync(file.path, targetPublic);
      try {
        if (fs.existsSync(path.dirname(targetSrc))) {
          fs.copyFileSync(file.path, targetSrc);
        }
      } catch (e) {
        console.warn('Could not copy to src directory:', e);
      }
      finalUrl = `/assets/images/hero_profile.jpg?t=${timestamp}`;
    }

    const storageData = getStorage();
    storageData.heroProfile = {
      url: finalUrl,
      mediaType: isVid ? 'video' : 'image',
      updatedAt: new Date().toISOString()
    };
    saveStorage(storageData);

    res.status(200).json({
      success: true,
      message: `${isVid ? 'Hero profile video' : 'Hero profile photo'} uploaded successfully.`,
      url: finalUrl,
      mediaType: isVid ? 'video' : 'image'
    });
  } catch (err) {
    console.error('Profile photo upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error saving profile media.' });
  }
});

// Replace Elsen's Real Hand Drawing (Image or Time-lapse Video)
app.post('/api/profile/upload-drawing', upload.any(), (req, res) => {
  try {
    const file = getUploadedFile(req);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No drawing file provided.' });
    }

    const isVid = isVideoFile(file);
    const timestamp = Date.now();
    let finalUrl = isVid ? `/assets/videos/${file.filename}?t=${timestamp}` : `/assets/images/${file.filename}?t=${timestamp}`;

    if (!isVid) {
      const targetPublic = path.join(assetsImagesDir, 'elsen_drawings.jpg');
      const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'elsen_drawings.jpg');
      fs.copyFileSync(file.path, targetPublic);
      try {
        if (fs.existsSync(path.dirname(targetSrc))) {
          fs.copyFileSync(file.path, targetSrc);
        }
      } catch (e) {
        console.warn('Could not copy to src directory:', e);
      }
      finalUrl = `/assets/images/elsen_drawings.jpg?t=${timestamp}`;
    }

    const storageData = getStorage();
    const drawingImg = storageData.images.find(img => img.id === 'img-drawings-01');
    if (drawingImg) {
      drawingImg.url = finalUrl;
      drawingImg.thumbnail = finalUrl;
      drawingImg.mediaType = isVid ? 'video' : 'image';
      saveStorage(storageData);
    }

    res.status(200).json({
      success: true,
      message: `${isVid ? 'Drawing video' : 'Real drawing'} uploaded successfully.`,
      url: finalUrl,
      mediaType: isVid ? 'video' : 'image'
    });
  } catch (err) {
    console.error('Drawing upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error saving drawing.' });
  }
});

// Replace Reselling Clothes & Shoes Photo or Video Reel
app.post('/api/reselling/upload-photo', upload.any(), (req, res) => {
  try {
    const file = getUploadedFile(req);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No media file provided.' });
    }

    const isVid = isVideoFile(file);
    const timestamp = Date.now();
    let finalUrl = isVid ? `/assets/videos/${file.filename}?t=${timestamp}` : `/assets/images/${file.filename}?t=${timestamp}`;

    if (!isVid) {
      const targetPublicJpg = path.join(assetsImagesDir, 'reselling_clothes_shoes.jpg');
      const targetPublicPng = path.join(assetsImagesDir, 'reselling_clothes_shoes.png');
      const targetSrcJpg = path.join(__dirname, 'src', 'assets', 'images', 'reselling_clothes_shoes.jpg');
      fs.copyFileSync(file.path, targetPublicJpg);
      fs.copyFileSync(file.path, targetPublicPng);
      try {
        if (fs.existsSync(path.dirname(targetSrcJpg))) {
          fs.copyFileSync(file.path, targetSrcJpg);
        }
      } catch (e) {
        console.warn('Could not copy to src directory:', e);
      }
      finalUrl = `/assets/images/reselling_clothes_shoes.jpg?t=${timestamp}`;
    }

    const storageData = getStorage();
    const resellImg = storageData.images.find(img => img.id === 'img-reselling-01');
    if (resellImg) {
      resellImg.url = finalUrl;
      resellImg.thumbnail = finalUrl;
      resellImg.mediaType = isVid ? 'video' : 'image';
      saveStorage(storageData);
    }

    res.status(200).json({
      success: true,
      message: `${isVid ? 'Reselling video' : 'Reselling photo'} uploaded successfully.`,
      url: finalUrl,
      mediaType: isVid ? 'video' : 'image'
    });
  } catch (err) {
    console.error('Reselling photo upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error saving reselling photo.' });
  }
});

// Reorder images and showcase slots in App Storage
app.post('/api/storage/reorder', (req, res) => {
  try {
    const { orderedIds, showcaseOrder } = req.body;
    const storageData = getStorage();

    if (Array.isArray(orderedIds) && orderedIds.length > 0) {
      const idMap = new Map();
      storageData.images.forEach(img => idMap.set(img.id, img));
      const newImages = [];
      orderedIds.forEach(id => {
        if (idMap.has(id)) {
          newImages.push(idMap.get(id));
          idMap.delete(id);
        }
      });
      // Append any remaining items that were not specified in orderedIds
      idMap.forEach(img => newImages.push(img));
      storageData.images = newImages;
    }

    if (Array.isArray(showcaseOrder)) {
      storageData.showcaseOrder = showcaseOrder;
    }

    saveStorage(storageData);
    res.json({
      success: true,
      message: 'Photo order saved successfully.',
      images: storageData.images,
      showcaseOrder: storageData.showcaseOrder
    });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error reordering images.' });
  }
});

// Direct upload to a specific photo or video slot
app.post('/api/upload/slot', upload.any(), (req, res) => {
  try {
    const file = getUploadedFile(req);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No media file provided.' });
    }
    const slotId = req.body.slotId || req.query.slotId || '';
    const storageData = getStorage();
    const timestamp = Date.now();
    const isVid = isVideoFile(file);
    const uploadedUrl = isVid ? `/assets/videos/${file.filename}` : `/assets/images/${file.filename}`;

    // Target 1: Slot #1 Hero profile photo/video (Top of Homepage - strictly independent)
    if (slotId === 'hero-profile' || slotId === 'hero' || slotId === 'slot-1') {
      let finalUrl = `${uploadedUrl}?t=${timestamp}`;
      if (!isVid) {
        const targetPublic = path.join(assetsImagesDir, 'hero_profile.jpg');
        const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'hero_profile.jpg');
        fs.copyFileSync(file.path, targetPublic);
        try {
          if (fs.existsSync(path.dirname(targetSrc))) {
            fs.copyFileSync(file.path, targetSrc);
          }
        } catch (e) {
          console.warn('Could not copy to src directory:', e);
        }
        finalUrl = `/assets/images/hero_profile.jpg?t=${timestamp}`;
      }
      storageData.heroProfile = {
        url: finalUrl,
        mediaType: isVid ? 'video' : 'image',
        updatedAt: new Date().toISOString()
      };
      saveStorage(storageData);
      return res.json({
        success: true,
        message: `${isVid ? 'Hero profile video' : 'Hero profile photo'} updated successfully in Slot #1.`,
        url: finalUrl,
        mediaType: isVid ? 'video' : 'image',
        slotId: 'hero-profile'
      });
    }

    // Target 1B: Featured Media Card Profile (Independent from Slot #1)
    if (slotId === 'media-card-profile' || slotId === 'featured-profile') {
      let finalUrl = `${uploadedUrl}?t=${timestamp}`;
      if (!isVid) {
        const targetPublic = path.join(assetsImagesDir, 'featured_media_portrait.jpg');
        const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'featured_media_portrait.jpg');
        fs.copyFileSync(file.path, targetPublic);
        try {
          if (fs.existsSync(path.dirname(targetSrc))) {
            fs.copyFileSync(file.path, targetSrc);
          }
        } catch (e) {
          console.warn('Could not copy to src directory:', e);
        }
        finalUrl = `/assets/images/featured_media_portrait.jpg?t=${timestamp}`;
      }
      const profileImg = storageData.images.find(img => img.id === 'img-profile-01');
      if (profileImg) {
        profileImg.url = finalUrl;
        profileImg.thumbnail = finalUrl;
        profileImg.mediaType = isVid ? 'video' : 'image';
      }
      saveStorage(storageData);
      return res.json({
        success: true,
        message: `${isVid ? 'Featured media video' : 'Featured media photo'} updated successfully.`,
        url: finalUrl,
        mediaType: isVid ? 'video' : 'image',
        slotId
      });
    }

    // Target 2: Reselling clothes and shoes
    if (slotId === 'reselling' || slotId === 'media-card-reselling' || slotId === 'resell') {
      let finalUrl = `${uploadedUrl}?t=${timestamp}`;
      if (!isVid) {
        const targetPublicJpg = path.join(assetsImagesDir, 'reselling_clothes_shoes.jpg');
        const targetSrcJpg = path.join(__dirname, 'src', 'assets', 'images', 'reselling_clothes_shoes.jpg');
        fs.copyFileSync(file.path, targetPublicJpg);
        try {
          if (fs.existsSync(path.dirname(targetSrcJpg))) {
            fs.copyFileSync(file.path, targetSrcJpg);
          }
        } catch (e) {
          console.warn('Could not copy to src directory:', e);
        }
        finalUrl = `/assets/images/reselling_clothes_shoes.jpg?t=${timestamp}`;
      }
      const resellImg = storageData.images.find(img => img.id === 'img-reselling-01');
      if (resellImg) {
        resellImg.url = finalUrl;
        resellImg.thumbnail = finalUrl;
        resellImg.mediaType = isVid ? 'video' : 'image';
      }
      saveStorage(storageData);
      return res.json({
        success: true,
        message: `${isVid ? 'Reselling video' : 'Reselling photo'} updated successfully in this slot.`,
        url: finalUrl,
        mediaType: isVid ? 'video' : 'image',
        slotId
      });
    }

    // Target 3: Anime Sketchbook Drawing
    if (slotId === 'drawing' || slotId === 'media-card-drawings' || slotId === 'drawings') {
      let finalUrl = `${uploadedUrl}?t=${timestamp}`;
      if (!isVid) {
        const targetPublic = path.join(assetsImagesDir, 'elsen_drawings.jpg');
        const targetSrc = path.join(__dirname, 'src', 'assets', 'images', 'elsen_drawings.jpg');
        fs.copyFileSync(file.path, targetPublic);
        try {
          if (fs.existsSync(path.dirname(targetSrc))) {
            fs.copyFileSync(file.path, targetSrc);
          }
        } catch (e) {
          console.warn('Could not copy to src directory:', e);
        }
        finalUrl = `/assets/images/elsen_drawings.jpg?t=${timestamp}`;
      }
      const drawingImg = storageData.images.find(img => img.id === 'img-drawings-01');
      if (drawingImg) {
        drawingImg.url = finalUrl;
        drawingImg.thumbnail = finalUrl;
        drawingImg.mediaType = isVid ? 'video' : 'image';
      }
      saveStorage(storageData);
      return res.json({
        success: true,
        message: `${isVid ? 'Drawing video' : 'Drawing photo'} updated successfully in this slot.`,
        url: finalUrl,
        mediaType: isVid ? 'video' : 'image',
        slotId
      });
    }

    // Target 4: Streetwear Showcase card
    if (slotId === 'media-card-streetwear') {
      let finalUrl = `${uploadedUrl}?t=${timestamp}`;
      if (!isVid) {
        const targetPublic = path.join(assetsImagesDir, 'directed_lord_hoodie_puff_1789793017180.jpg');
        try {
          fs.copyFileSync(file.path, targetPublic);
        } catch (e) {}
        finalUrl = `/assets/images/directed_lord_hoodie_puff_1789793017180.jpg?t=${timestamp}`;
      }
      const streetImg = storageData.images.find(img => img.id === 'img-directed-01');
      if (streetImg) {
        streetImg.url = finalUrl;
        streetImg.thumbnail = finalUrl;
        streetImg.mediaType = isVid ? 'video' : 'image';
      }
      saveStorage(storageData);
      return res.json({
        success: true,
        message: `${isVid ? 'Streetwear video' : 'Streetwear photo'} updated successfully in this slot.`,
        url: finalUrl,
        mediaType: isVid ? 'video' : 'image',
        slotId
      });
    }

    // Target 5: Specific image in storageData.images
    const foundIdx = storageData.images.findIndex(img => img.id === slotId);
    if (foundIdx !== -1) {
      storageData.images[foundIdx].url = uploadedUrl;
      storageData.images[foundIdx].thumbnail = uploadedUrl;
      storageData.images[foundIdx].filename = file.filename;
      storageData.images[foundIdx].mediaType = isVid ? 'video' : 'image';
      saveStorage(storageData);
      return res.json({
        success: true,
        message: `${isVid ? 'Video' : 'Image'} replaced successfully.`,
        url: `${uploadedUrl}?t=${timestamp}`,
        image: storageData.images[foundIdx],
        mediaType: isVid ? 'video' : 'image',
        slotId
      });
    }

    // Target 6: Default fallback: add as new media in App Storage
    const newMedia = {
      id: `img-${timestamp}`,
      title: req.body.title || file.originalname,
      category: req.body.category || (isVid ? 'Campaign' : 'User Uploads'),
      url: uploadedUrl,
      thumbnail: uploadedUrl,
      mediaType: isVid ? 'video' : 'image',
      caption: req.body.caption || (isVid ? 'Uploaded video reel via Media Area.' : 'Uploaded photo via Photo Area.'),
      uploader: 'Elsen Keena',
      date: new Date().toISOString().split('T')[0],
      filename: file.filename,
      sizeBytes: file.size,
      isUserUpload: true
    };
    storageData.images.unshift(newMedia);
    saveStorage(storageData);

    return res.json({
      success: true,
      message: `${isVid ? 'Video' : 'Photo'} uploaded successfully.`,
      url: `${uploadedUrl}?t=${timestamp}`,
      image: newMedia,
      mediaType: isVid ? 'video' : 'image',
      slotId
    });
  } catch (err) {
    console.error('Slot upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error uploading to media slot.' });
  }
});

// Batch upload photos and videos in user-specified order
app.post('/api/upload/batch', upload.any(), (req, res) => {
  try {
    const files = getUploadedFiles(req);
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const storageData = getStorage();
    if (!Array.isArray(storageData.images)) {
      storageData.images = [];
    }
    const titles = req.body.titles ? (Array.isArray(req.body.titles) ? req.body.titles : [req.body.titles]) : [];
    const categories = req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories]) : [];
    const captions = req.body.captions ? (Array.isArray(req.body.captions) ? req.body.captions : [req.body.captions]) : [];

    const newImages = req.files.map((file, idx) => {
      const isVid = isVideoFile(file);
      const mediaUrl = isVid ? `/assets/videos/${file.filename}` : `/assets/images/${file.filename}`;
      return {
        id: `img-${Date.now()}-${idx}`,
        title: titles[idx] || file.originalname,
        category: categories[idx] || (isVid ? 'Campaign' : 'User Uploads'),
        url: mediaUrl,
        thumbnail: mediaUrl,
        mediaType: isVid ? 'video' : 'image',
        caption: captions[idx] || (isVid ? `Uploaded video reel #${idx + 1}` : `Uploaded photo #${idx + 1}`),
        uploader: 'Elsen Keena',
        date: new Date().toISOString().split('T')[0],
        filename: file.filename,
        sizeBytes: file.size,
        isUserUpload: true
      };
    });

    // Prepend new media items in the order they were submitted
    storageData.images = [...newImages, ...storageData.images];
    saveStorage(storageData);

    res.status(201).json({
      success: true,
      message: `${newImages.length} items (photos & videos) uploaded in your selected order!`,
      images: storageData.images,
      newImages
    });
  } catch (err) {
    console.error('Batch upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error processing batch upload.' });
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

// Catch-all for undefined API routes so that /api always returns JSON, never HTML
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler (handles multer errors cleanly as JSON, never HTML)
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  if (res.headersSent) {
    return next(err);
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size exceeds maximum upload limit (35MB). Please select a smaller photo or compressed video clip.'
    });
  }
  const status = err.status || err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  return res.status(status).json({
    success: false,
    message: err.message || 'File upload error occurred. Please verify file format.'
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lord Knows Server running at http://0.0.0.0:${PORT}`);
  console.log(`App Storage active at: ${storageFilePath}`);
});
