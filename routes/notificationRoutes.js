const express = require('express');
const router = express.Router();
const { getNotifications, markAllAsRead } = require('../controllers/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/').get(protect, getNotifications);
router.route('/mark-read').post(protect, markAllAsRead);

module.exports = router;