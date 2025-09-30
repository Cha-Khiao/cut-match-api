const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createHairstyleReview,
  getHairstyleReviews,
} = require('../controllers/reviewController.js');
const { protect } = require('../middleware/authMiddleware.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           description: คะแนนที่ผู้ใช้ให้ (1-5)
 *           example: 5
 *         comment:
 *           type: string
 *           description: ความคิดเห็นรีวิว
 *           example: "ทรงนี้ตัดแล้วสวยมากครับ"
 *         user:
 *           type: object
 *           description: ผู้ใช้ที่เขียนรีวิว
 *           properties:
 *             _id:
 *               type: string
 *               description: รหัสผู้ใช้
 *             username:
 *               type: string
 *               description: ชื่อผู้ใช้
 *           example:
 *             _id: "60d2b3f04f1a2d001fbc2e7d"
 *             username: "สมชาย"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่เขียนรีวิว
 *     ReviewBody:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *       properties:
 *         rating:
 *           type: number
 *           description: คะแนนรีวิว (1-5)
 *           example: 4
 *         comment:
 *           type: string
 *           description: ข้อความรีวิว
 *           example: "ชอบมากครับ แต่ต้องเซ็ตผมนิดหน่อย"
 */

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: การจัดการรีวิวสำหรับทรงผม
 */

/**
 * @swagger
 * /api/hairstyles/{id}/reviews:
 *   get:
 *     summary: ดูรีวิวทั้งหมดของทรงผม
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของทรงผม
 *     responses:
 *       200:
 *         description: รายการรีวิวทั้งหมดของทรงผมนี้
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: ไม่พบทรงผม
 *   post:
 *     summary: เพิ่มรีวิวใหม่ให้กับทรงผม
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของทรงผมที่ต้องการรีวิว
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewBody'
 *     responses:
 *       201:
 *         description: เพิ่มรีวิวสำเร็จ
 *       400:
 *         description: ผู้ใช้นี้ได้รีวิวไปแล้ว หรือข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบทรงผม
 */

router.route('/')
  .get(getHairstyleReviews)
  .post(protect, createHairstyleReview);

module.exports = router;
