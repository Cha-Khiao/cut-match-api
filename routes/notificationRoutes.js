const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    markAllAsRead, 
    deleteNotification // <-- import เข้ามา
} = require('../controllers/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/').get(protect, getNotifications);
router.route('/mark-read').post(protect, markAllAsRead);

// --- ✨ เพิ่ม Route นี้เข้ามา ✨ ---
router.route('/:id').delete(protect, deleteNotification);

module.exports = router;