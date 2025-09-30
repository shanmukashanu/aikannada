const express = require('express');
const multer = require('multer');
const { uploadImageBuffer, uploadVideoBuffer, deleteImage } = require('../utils/cloudinary');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const uploadLarge = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Upload single image
router.post('/image', authRequired, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const folder = req.body.folder || 'ai-kannada';
    const result = await uploadImageBuffer(req.file.buffer, folder);
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Upload single video
router.post('/video', authRequired, uploadLarge.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const folder = req.body.folder || 'ai-kannada';
    const result = await uploadVideoBuffer(req.file.buffer, folder);
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete image by public_id
router.delete('/image', authRequired, async (req, res) => {
  try {
    const { public_id } = req.body || {};
    if (!public_id) return res.status(400).json({ error: 'public_id required' });
    const result = await deleteImage(public_id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

// Multi upload (images/videos) up to 10 files
router.post('/multi', authRequired, uploadLarge.array('files', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
    const folder = req.body.folder || 'ai-kannada';
    const results = [];
    for (const f of req.files) {
      const isVideo = (f.mimetype || '').startsWith('video');
      const up = isVideo
        ? await uploadVideoBuffer(f.buffer, folder)
        : await uploadImageBuffer(f.buffer, folder);
      results.push({ url: up.secure_url, publicId: up.public_id, type: isVideo ? 'video' : 'image' });
    }
    res.json({ media: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
