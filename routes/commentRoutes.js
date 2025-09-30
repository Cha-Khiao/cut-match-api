const express = require('express');
const router = express.Router({ mergeParams: true }); 
const {
  createComment,
  getComments,
  replyToComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController.js');
const { protect } = require('../middleware/authMiddleware.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - userId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสไอดีของคอมเมนต์ (สร้างอัตโนมัติ)
 *         postId:
 *           type: string
 *           description: รหัสไอดีของโพสต์ที่คอมเมนต์นี้อยู่
 *         userId:
 *           type: string
 *           description: รหัสไอดีของผู้ใช้ที่เขียนคอมเมนต์
 *         content:
 *           type: string
 *           description: เนื้อหาของคอมเมนต์
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างคอมเมนต์
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่แก้ไขคอมเมนต์ล่าสุด
 */

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: จัดการคอมเมนต์ (สร้าง, ดู, ตอบกลับ, แก้ไข, ลบ)
 */

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: ดึงคอมเมนต์ทั้งหมดของโพสต์
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของโพสต์
 *     responses:
 *       200:
 *         description: รายการคอมเมนต์ของโพสต์
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: ไม่พบโพสต์
 *   post:
 *     summary: เพิ่มคอมเมนต์ใหม่ในโพสต์
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: เนื้อหาของคอมเมนต์
 *                 example: "โพสต์นี้มีประโยชน์มากครับ!"
 *     responses:
 *       201:
 *         description: เพิ่มคอมเมนต์สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบโพสต์
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{id}/reply:
 *   post:
 *     summary: ตอบกลับคอมเมนต์
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของโพสต์
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของคอมเมนต์ที่ต้องการตอบกลับ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: เนื้อหาของการตอบกลับ
 *                 example: "เห็นด้วยกับคุณครับ!"
 *     responses:
 *       201:
 *         description: ตอบกลับคอมเมนต์สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบโพสต์หรือคอมเมนต์
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   put:
 *     summary: แก้ไขคอมเมนต์
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของโพสต์
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของคอมเมนต์ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: เนื้อหาที่แก้ไขใหม่
 *                 example: "ผมแก้ไขคอมเมนต์ให้กระชับขึ้น"
 *     responses:
 *       200:
 *         description: แก้ไขคอมเมนต์สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบโพสต์หรือคอมเมนต์
 *   delete:
 *     summary: ลบคอมเมนต์
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของโพสต์
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของคอมเมนต์ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบคอมเมนต์สำเร็จ
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบโพสต์หรือคอมเมนต์
 */

router.route('/')
  .post(protect, createComment)
  .get(protect, getComments);

router.route('/:id/reply')
  .post(protect, replyToComment);

router.route('/:commentId')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
