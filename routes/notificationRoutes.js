const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAllAsRead, 
  deleteNotification
} = require('../controllers/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสไอดีของการแจ้งเตือน
 *         userId:
 *           type: string
 *           description: รหัสไอดีของผู้ใช้ที่ได้รับการแจ้งเตือน
 *         message:
 *           type: string
 *           description: เนื้อหาของการแจ้งเตือน
 *           example: "คุณมีคอมเมนต์ใหม่ในโพสต์ของคุณ"
 *         isRead:
 *           type: boolean
 *           description: สถานะว่าอ่านแล้วหรือยัง
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างการแจ้งเตือน
 */

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: การจัดการการแจ้งเตือนของผู้ใช้
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการแจ้งเตือนของผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */

/**
 * @swagger
 * /api/notifications/mark-read:
 *   post:
 *     summary: มาร์คการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: มาร์คทั้งหมดสำเร็จ
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: ลบการแจ้งเตือนเฉพาะรายการ
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของการแจ้งเตือนที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบการแจ้งเตือนสำเร็จ
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบการแจ้งเตือน
 */

router.route('/').get(protect, getNotifications);
router.route('/mark-read').post(protect, markAllAsRead);
router.route('/:id').delete(protect, deleteNotification);

module.exports = router;
