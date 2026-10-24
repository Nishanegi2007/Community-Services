const express = require('express');
const { rateLimit } = require('express-rate-limit');
const controller = require('../controllers/inquiry.controller');
const requireAdmin = require('../middleware/requireAdmin');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
const publicSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many enquiries from this connection. Please try again later.' },
});

router.post('/', publicSubmissionLimiter, controller.create);
router.get('/admin', requireAdmin, controller.list);
router.patch('/admin/:id/status', requireAdmin, validateObjectId, controller.updateStatus);
router.delete('/admin/:id', requireAdmin, validateObjectId, controller.remove);

module.exports = router;
