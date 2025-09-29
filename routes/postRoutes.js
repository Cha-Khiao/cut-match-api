const express = require('express');
const router = express.Router();
const commentRouter = require('./commentRoutes.js'); // <-- ✨ 1. Import เข้ามา

const {
  createPost,
  getFeed,
  getUserPosts,
  updatePost,
  likePost,
  deletePost,
} = require('../controllers/postController.js');
const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

// --- ✨ 2. เชื่อม Comment Routes เข้ามา ✨ ---
router.use('/:postId/comments', commentRouter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - userId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสโพสต์ (สร้างอัตโนมัติ)
 *         userId:
 *           type: string
 *           description: รหัสของผู้ใช้ที่สร้างโพสต์
 *         content:
 *           type: string
 *           description: เนื้อหาของโพสต์
 *         postImages:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: รูปภาพที่แนบมากับโพสต์ (ไม่จำเป็น)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างโพสต์
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่แก้ไขโพสต์ล่าสุด
 *     Comment:
 *       type: object
 *       required:
 *         - userId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสของความคิดเห็น
 *         postId:
 *           type: string
 *           description: รหัสของโพสต์ที่แสดงความคิดเห็น
 *         userId:
 *           type: string
 *           description: รหัสของผู้ใช้ที่แสดงความคิดเห็น
 *         content:
 *           type: string
 *           description: เนื้อหาของความคิดเห็น
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างความคิดเห็น
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่แก้ไขความคิดเห็นล่าสุด
 */

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: การสร้างโพสต์ ฟีด และการมีส่วนร่วม (ไลก์, ลบ)
 *   - name: Comments
 *     description: การจัดการความคิดเห็นในโพสต์
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: สร้างโพสต์ใหม่
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: เนื้อหาของโพสต์
 *                 example: "โพสต์แรกของฉัน!"
 *               postImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปภาพแนบโพสต์ (ไม่บังคับ)
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: สร้างโพสต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (เช่น ไม่มีเนื้อหาหรือไฟล์ไม่ถูกต้อง)
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ยังไม่เข้าสู่ระบบ)
 */

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: ดึงโพสต์ทั้งหมดในฟีดของผู้ใช้ที่ล็อกอินอยู่
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการโพสต์จากฟีด
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: ดูโพสต์ของผู้ใช้ที่ระบุ
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของผู้ใช้ที่ต้องการดูโพสต์
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: รายการโพสต์ของผู้ใช้
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบผู้ใช้
 */

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: กดไลก์โพสต์ที่ระบุ
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของโพสต์ที่ต้องการกดไลก์
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: กดไลก์สำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: แก้ไขโพสต์ที่ระบุ
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของโพสต์ที่ต้องการแก้ไข
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: เนื้อหาใหม่ของโพสต์
 *                 example: "อัปเดตโพสต์ของฉันแล้วนะ!"
 *               postImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: อัปเดตรูปภาพที่แนบโพสต์ (ไม่บังคับ)
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: แก้ไขโพสต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 *   delete:
 *     summary: ลบโพสต์ที่ระบุ
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของโพสต์ที่ต้องการลบ
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: ลบโพสต์สำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 */

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: ดูความคิดเห็นทั้งหมดของโพสต์ที่ระบุ
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของโพสต์
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: รายการความคิดเห็นของโพสต์
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 *   post:
 *     summary: เพิ่มความคิดเห็นในโพสต์ที่ระบุ
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
 *                 description: เนื้อหาของความคิดเห็น
 *                 example: "ชอบโพสต์นี้มากเลยครับ!"
 *     responses:
 *       201:
 *         description: เพิ่มความคิดเห็นสำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (เช่น ไม่มีเนื้อหา)
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: ลบความคิดเห็นที่ระบุในโพสต์
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของโพสต์
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของความคิดเห็นที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบความคิดเห็นสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์หรือความคิดเห็น
 */

// เส้นทางต่าง ๆ ของโพสต์
router.route('/')
  .post(protect, upload.array('postImages', 10), createPost);

router.route('/feed')
  .get(protect, getFeed);

router.route('/user/:userId')
  .get(protect, getUserPosts);

router.route('/:id/like')
  .post(protect, likePost);

router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
