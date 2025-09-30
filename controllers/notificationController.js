const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification.js');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate('sender', 'username profileImageUrl')
    // --- ✨ แก้ไขส่วนนี้ให้ populate ข้อมูล Post ทั้งหมด ✨ ---
    .populate({
      path: 'post',
      populate: {
        path: 'author',
        select: 'username profileImageUrl'
      }
    });
  
  res.json(notifications);
});

// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-read
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        // ตรวจสอบให้แน่ใจว่าเป็นเจ้าของการแจ้งเตือนจริงๆ
        if (!notification.recipient.equals(req.user._id)) {
            res.status(401);
            throw new Error('Not authorized to delete this notification');
        }
        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

module.exports = {
  getNotifications,
  markAllAsRead,
  deleteNotification,
};