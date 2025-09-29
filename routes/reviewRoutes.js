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
 *           description: ความคิดเห็นเกี่ยวกับทรงผม
 *           example: "ทรงนี้ตัดแล้วสวยมากครับ"
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *           description: ผู้ใช้ที่เขียนรีวิว
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
 *           example: 4
 *         comment:
 *           type: string
 *           example: "ชอบมากครับ แต่ต้องเซ็ตผมนิดหน่อย"
 */

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: จัดการรีวิวทรงผม
 */

/**
 * @swagger
 * /api/hairstyles/{id}/reviews:
 *   get:
 *     summary: ดูรีวิวทั้งหมดของทรงผมที่ระบุ
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
 *         description: รายการรีวิวของทรงผมนี้
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: ไม่พบทรงผม
 *   post:
 *     summary: เพิ่มรีวิวใหม่ให้ทรงผมนี้
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
 *         description: คำขอไม่ถูกต้อง (เช่น รีวิวซ้ำ)
 *       401:
 *         description: ไม่ได้รับอนุญาต (ยังไม่เข้าสู่ระบบ)
 *       404:
 *         description: ไม่พบทรงผม
 */

router.route('/')
  .get(getHairstyleReviews)
  .post(protect, createHairstyleReview);

module.exports = router;
