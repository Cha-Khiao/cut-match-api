const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // ผู้รับการแจ้งเตือน
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ผู้ส่ง (คนที่ทำให้เกิดการแจ้งเตือน)
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ประเภทของการแจ้งเตือน
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'reply', 'follow'],
  },
  // โพสต์ที่เกี่ยวข้อง (ถ้ามี)
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  // สถานะว่าอ่านแล้วหรือยัง
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;