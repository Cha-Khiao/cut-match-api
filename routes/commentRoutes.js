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
 *           description: รหัสคอมเมนต์ที่ระบบสร้างให้อัตโนมัติ
 *         postId:
 *           type: string
 *           description: รหัสโพสต์ที่คอมเมนต์นี้เป็นของโพสต์นั้น
 *         userId:
 *           type: string
 *           description: รหัสผู้ใช้ที่สร้างคอมเมนต์นี้
 *         content:
 *           type: string
 *           description: เนื้อหาของคอมเมนต์
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่คอมเมนต์ถูกสร้าง
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่คอมเมนต์ถูกแก้ไขล่าสุด
 */

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: การจัดการคอมเมนต์ (สร้าง, ดึง, ตอบกลับ, แก้ไข, ลบ)
 */

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: ดึงคอมเมนต์ทั้งหมดของโพสต์หนึ่ง
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์ที่ต้องการดึงคอมเมนต์
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: รายการคอมเมนต์ของโพสต์
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์ดังกล่าว
 */

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: เพิ่มคอมเมนต์ในโพสต์หนึ่ง
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
 *                 example: "โพสต์นี้ดีมากเลย!"
 *     responses:
 *       201:
 *         description: เพิ่มคอมเมนต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (เช่น ขาดเนื้อหา)
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์ดังกล่าว
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{id}/reply:
 *   post:
 *     summary: ตอบกลับคอมเมนต์เฉพาะตัว
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์ที่คอมเมนต์เป็นของโพสต์นั้น
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสคอมเมนต์ที่ต้องการตอบกลับ
 *         example: 60d2b3f04f1a2d001fbc2e7e
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
 *                 example: "เห็นด้วยกับคุณเลย!"
 *     responses:
 *       201:
 *         description: ตอบกลับสำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (เช่น ขาดเนื้อหา)
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบคอมเมนต์หรือโพสต์ดังกล่าว
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   put:
 *     summary: แก้ไขคอมเมนต์เฉพาะตัว
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์ที่คอมเมนต์เป็นของโพสต์นั้น
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสคอมเมนต์ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: เนื้อหาคอมเมนต์ที่แก้ไขแล้ว
 *                 example: "แก้ไขคอมเมนต์ของผมแล้วครับ"
 *     responses:
 *       200:
 *         description: แก้ไขคอมเมนต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (เช่น ข้อมูลไม่ถูกต้อง)
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบคอมเมนต์หรือโพสต์ดังกล่าว
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: ลบคอมเมนต์เฉพาะตัว
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์ที่คอมเมนต์เป็นของโพสต์นั้น
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสคอมเมนต์ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบคอมเมนต์สำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบคอมเมนต์หรือโพสต์ดังกล่าว
 */

router.route('/')
  .post(protect, createComment)
  .get(protect, getComments);

router.route('/:id/reply')
  .post(protect, replyToComment);

// --- ✨ Route สำหรับแก้ไขและลบคอมเมนต์ ✨ ---
router.route('/:commentId')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
