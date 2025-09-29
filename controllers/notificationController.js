const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification.js');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate('sender', 'username profileImageUrl')
    .populate('post', 'imageUrl'); // ดึงรูปแรกของโพสต์มาแสดง
  
  res.json(notifications);
});

// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-read
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
});

module.exports = {
  getNotifications,
  markAllAsRead,
};