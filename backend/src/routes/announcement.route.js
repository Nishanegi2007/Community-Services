const express = require('express');
const controller = require('../controllers/announcement.controller');
const requireAdmin = require('../middleware/requireAdmin');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.get('/', controller.listPublished);
router.get('/admin', requireAdmin, controller.listAll);
router.post('/admin', requireAdmin, controller.create);
router.patch('/admin/:id', requireAdmin, validateObjectId, controller.update);
router.delete('/admin/:id', requireAdmin, validateObjectId, controller.remove);

module.exports = router;
