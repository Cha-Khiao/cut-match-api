const express = require('express');
const router = express.Router();
const commentRouter = require('./commentRoutes.js'); // ✨ import router คอมเมนต์

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

// ✨ ใช้ commentRouter สำหรับ path ที่ขึ้นต้นด้วย /:postId/comments
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
 *           description: รหัสผู้ใช้ที่สร้างโพสต์
 *         content:
 *           type: string
 *           description: เนื้อหาของโพสต์
 *           example: "โพสต์แรกของฉัน!"
 *         postImages:
 *           type: array
 *           description: รูปภาพที่แนบมากับโพสต์ (ไม่บังคับ)
 *           items:
 *             type: string
 *             format: binary
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างโพสต์
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่อัปเดตโพสต์ล่าสุด
 *     Comment:
 *       type: object
 *       required:
 *         - userId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสคอมเมนต์ (สร้างอัตโนมัติ)
 *         postId:
 *           type: string
 *           description: รหัสโพสต์ที่คอมเมนต์นี้อยู่
 *         userId:
 *           type: string
 *           description: รหัสผู้ใช้ที่เขียนคอมเมนต์
 *         content:
 *           type: string
 *           description: เนื้อหาของคอมเมนต์
 *           example: "โพสต์นี้ดีมาก!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างคอมเมนต์
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่อัปเดตคอมเมนต์ล่าสุด
 */

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: จัดการโพสต์ (สร้าง, ฟีด, กดถูกใจ, ลบ)
 *   - name: Comments
 *     description: จัดการคอมเมนต์ของโพสต์
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
 *                 example: "สวัสดีครับทุกคน!"
 *               postImages:
 *                 type: array
 *                 description: รูปภาพประกอบโพสต์ (ไม่เกิน 10 ไฟล์)
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: สร้างโพสต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: ดึงโพสต์ทั้งหมด (ฟีดของผู้ใช้ที่ล็อกอิน)
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
 *     summary: ดูโพสต์ของผู้ใช้ตาม userId
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสผู้ใช้
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: รายการโพสต์ของผู้ใช้นี้
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบผู้ใช้
 */

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: กดถูกใจโพสต์
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์
 *     responses:
 *       200:
 *         description: กดถูกใจสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: อัปเดตโพสต์
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์
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
 *                 example: "อัปเดตโพสต์เรียบร้อยแล้ว"
 *               postImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: อัปเดตรูปภาพ (สูงสุด 10 ไฟล์)
 *     responses:
 *       200:
 *         description: อัปเดตโพสต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 *   delete:
 *     summary: ลบโพสต์
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์
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
 *     summary: ดึงคอมเมนต์ทั้งหมดของโพสต์
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์
 *     responses:
 *       200:
 *         description: รายการคอมเมนต์ของโพสต์
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 *   post:
 *     summary: เพิ่มคอมเมนต์ในโพสต์
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
 *                 description: เนื้อหาคอมเมนต์
 *                 example: "โพสต์นี้เจ๋งมาก!"
 *     responses:
 *       201:
 *         description: เพิ่มคอมเมนต์สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์
 */

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: ลบคอมเมนต์ของโพสต์
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสโพสต์
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสคอมเมนต์
 *     responses:
 *       200:
 *         description: ลบคอมเมนต์สำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบโพสต์หรือคอมเมนต์
 */

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
