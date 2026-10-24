const express = require('express');
const multer = require('multer');
const controller = require('../controllers/gallery.controller');
const requireAdmin = require('../middleware/requireAdmin');
const validateObjectId = require('../middleware/validateObjectId');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 2, parts: 3, fieldSize: 1024 },
  fileFilter(req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP images are allowed.');
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

const router = express.Router();
router.get('/', controller.listPublic);
router.get('/admin', requireAdmin, controller.listAll);
router.post('/admin', requireAdmin, upload.single('photo'), controller.upload);
router.delete('/admin/:id', requireAdmin, validateObjectId, controller.remove);

module.exports = router;
