const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getFavoriteHairstyles,
  addFavoriteHairstyle,
  removeFavoriteHairstyle,
  addSavedLook,
  getSavedLooks,
  deleteSavedLook,
  getUserPublicProfile,
  followUser,
  unfollowUser,
  searchUsers,
} = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสผู้ใช้ (สร้างอัตโนมัติ)
 *         username:
 *           type: string
 *           description: ชื่อผู้ใช้
 *           example: สมชาย ใจดี
 *         email:
 *           type: string
 *           format: email
 *           description: อีเมลผู้ใช้
 *           example: somchai@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: รหัสผ่าน
 *           example: password123
 *         role:
 *           type: string
 *           description: บทบาทของผู้ใช้ (user หรือ admin)
 *           example: user
 *         profileImage:
 *           type: string
 *           format: binary
 *           description: รูปโปรไฟล์ (อัปโหลดได้, ไม่บังคับ)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างบัญชี
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่อัปเดตล่าสุด
 *     Favorite:
 *       type: object
 *       required:
 *         - userId
 *         - hairstyleId
 *       properties:
 *         userId:
 *           type: string
 *           description: รหัสผู้ใช้
 *           example: 60d2b3f04f1a2d001fbc2e7d
 *         hairstyleId:
 *           type: string
 *           description: รหัสทรงผมที่บันทึกเป็นรายการโปรด
 *           example: 60d2b3f04f1a2d001fbc2e7e
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: การจัดการผู้ใช้และการเข้าสู่ระบบ
 *   - name: Favorites
 *     description: การจัดการทรงผมที่ผู้ใช้บันทึกเป็นรายการโปรด
 *   - name: SavedLooks
 *     description: การจัดการลุค (ภาพที่ผู้ใช้อัปโหลดเก็บไว้)
 */

//
// Users
//

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือผู้ใช้นี้มีอยู่แล้ว
 */
router.post(
  '/register',
  [
    check('username', 'กรุณากรอกชื่อผู้ใช้').not().isEmpty(),
    check('email', 'กรุณากรอกอีเมลที่ถูกต้อง').isEmail(),
    check('password', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร').isLength({ min: 6 }),
  ],
  validateRequest,
  registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: เข้าสู่ระบบและรับ Token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: somchai@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 */
router.post(
  '/login',
  [
    check('email', 'กรุณากรอกอีเมลที่ถูกต้อง').isEmail(),
    check('password', 'กรุณากรอกรหัสผ่าน').exists(),
  ],
  validateRequest,
  loginUser
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: ดูโปรไฟล์ของผู้ใช้ที่เข้าสู่ระบบ
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลโปรไฟล์
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   put:
 *     summary: แก้ไขโปรไฟล์ของผู้ใช้ (อัปโหลดรูปได้)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: อัปเดตโปรไฟล์สำเร็จ
 *       400:
 *         description: ไฟล์ไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   delete:
 *     summary: ลบบัญชีผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ลบบัญชีสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profileImage'), updateUserProfile)
  .delete(protect, deleteUserProfile);

/**
 * @swagger
 * /api/users/public/{id}:
 *   get:
 *     summary: ดูโปรไฟล์สาธารณะของผู้ใช้
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสผู้ใช้
 *     responses:
 *       200:
 *         description: สำเร็จ
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.get('/public/:id', getUserPublicProfile);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: ค้นหาผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: คีย์เวิร์ด เช่น ชื่อผู้ใช้ หรืออีเมล
 *         example: somchai
 *     responses:
 *       200:
 *         description: รายชื่อผู้ใช้ที่ค้นหาเจอ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/search', protect, searchUsers);

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: ติดตามผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสผู้ใช้ที่ต้องการติดตาม
 *     responses:
 *       200:
 *         description: ติดตามสำเร็จ
 *       400:
 *         description: ติดตามซ้ำ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ใช้
 *   delete:
 *     summary: เลิกติดตามผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสผู้ใช้ที่ต้องการเลิกติดตาม
 *     responses:
 *       200:
 *         description: เลิกติดตามสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router
  .route('/:id/follow')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

//
// Favorites
//

/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: ดูรายการทรงผมที่ผู้ใช้บันทึกเป็นรายการโปรด
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการทรงผมโปรด
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   post:
 *     summary: เพิ่มทรงผมในรายการโปรด
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Favorite'
 *     responses:
 *       201:
 *         description: เพิ่มสำเร็จ
 *       400:
 *         description: เพิ่มซ้ำ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router
  .route('/favorites')
  .get(protect, getFavoriteHairstyles)
  .post(protect, addFavoriteHairstyle);

/**
 * @swagger
 * /api/users/favorites/{id}:
 *   delete:
 *     summary: ลบทรงผมออกจากรายการโปรด
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสรายการโปรด
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       404:
 *         description: ไม่พบรายการโปรด
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.delete('/favorites/:id', protect, removeFavoriteHairstyle);

//
// Saved Looks
//

/**
 * @swagger
 * /api/users/saved-looks:
 *   get:
 *     summary: ดูลุคที่ผู้ใช้อัปโหลดเก็บไว้
 *     tags: [SavedLooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการลุคที่บันทึกไว้
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   post:
 *     summary: เพิ่มลุค (อัปโหลดรูปภาพ)
 *     tags: [SavedLooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               savedLookImage:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพลุค
 *             required:
 *               - savedLookImage
 *     responses:
 *       201:
 *         description: เพิ่มสำเร็จ
 *       400:
 *         description: ไฟล์ไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   delete:
 *     summary: ลบลุคที่บันทึกไว้
 *     tags: [SavedLooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               savedLookId:
 *                 type: string
 *                 description: รหัสลุคที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       404:
 *         description: ไม่พบลุค
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router
  .route('/saved-looks')
  .get(protect, getSavedLooks)
  .post(protect, upload.single('savedLookImage'), addSavedLook)
  .delete(protect, deleteSavedLook);

module.exports = router;
