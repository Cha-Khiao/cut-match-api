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
 *           description: รหัสผู้ใช้ที่ระบบสร้างขึ้น
 *         username:
 *           type: string
 *           description: ชื่อผู้ใช้
 *           example: สมชาย ใจดี
 *         email:
 *           type: string
 *           format: email
 *           description: อีเมลของผู้ใช้
 *           example: somchai@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: รหัสผ่านของผู้ใช้
 *           example: รหัสผ่าน123
 *         role:
 *           type: string
 *           description: บทบาทของผู้ใช้ (user หรือ admin)
 *           example: user
 *         profileImage:
 *           type: string
 *           format: binary
 *           description: รูปโปรไฟล์ของผู้ใช้ (ไม่จำเป็น)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างบัญชี
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่แก้ไขบัญชีล่าสุด
 *     Favorite:
 *       type: object
 *       required:
 *         - userId
 *         - hairstyleId
 *       properties:
 *         userId:
 *           type: string
 *           description: รหัสผู้ใช้ที่เพิ่มรายการโปรด
 *         hairstyleId:
 *           type: string
 *           description: รหัสทรงผมที่เพิ่มในรายการโปรด
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่เพิ่มรายการโปรด
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่อัปเดตรายการโปรด
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: การจัดการบัญชีผู้ใช้ และการเข้าสู่ระบบ
 *   - name: Favorites
 *     description: การจัดการทรงผมที่ผู้ใช้ชื่นชอบ
 *   - name: SavedLooks
 *     description: การจัดการลุคที่บันทึกไว้ (ภาพอัปโหลด)
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: สมัครสมาชิกผู้ใช้ใหม่
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: ลงทะเบียนผู้ใช้เรียบร้อยแล้ว
 *       400:
 *         description: คำขอไม่ถูกต้อง (อีเมลนี้อาจมีอยู่แล้ว)
 */
router.post('/register', [
    check('username', 'กรุณากรอกชื่อผู้ใช้').not().isEmpty(),
    check('email', 'กรุณากรอกอีเมลให้ถูกต้อง').isEmail(),
    check('password', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร').isLength({ min: 6 })
  ],
  validateRequest,
  registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: เข้าสู่ระบบผู้ใช้
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
 *                 example: รหัสผ่าน123
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 */
router.post('/login', [
    check('email', 'กรุณากรอกอีเมลให้ถูกต้อง').isEmail(),
    check('password', 'กรุณากรอกรหัสผ่าน').exists()
  ],
  validateRequest,
  loginUser
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่เข้าสู่ระบบ
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลโปรไฟล์ของผู้ใช้
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *   put:
 *     summary: แก้ไขข้อมูลโปรไฟล์ (รวมถึงอัปโหลดรูป)
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
 *         description: แก้ไขโปรไฟล์เรียบร้อยแล้ว
 *       400:
 *         description: รูปแบบไฟล์ไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *   delete:
 *     summary: ลบบัญชีผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ลบบัญชีเรียบร้อยแล้ว
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profileImage'), updateUserProfile)
  .delete(protect, deleteUserProfile);

/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: ดึงรายการทรงผมที่ชื่นชอบของผู้ใช้
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการทรงผมที่ชื่นชอบ
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
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
 *         description: เพิ่มในรายการโปรดสำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (เช่น เพิ่มซ้ำ)
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.route('/favorites')
  .get(protect, getFavoriteHairstyles)
  .post(protect, addFavoriteHairstyle);

/**
 * @swagger
 * /api/users/favorites/{id}:
 *   delete:
 *     summary: ลบทรงผมจากรายการโปรด
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของรายการโปรดที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบรายการโปรดสำเร็จ
 *       404:
 *         description: ไม่พบรายการโปรด
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.route('/favorites/:id')
  .delete(protect, removeFavoriteHairstyle);

/**
 * @swagger
 * /api/users/saved-looks:
 *   get:
 *     summary: ดูลุคที่บันทึกไว้ (ภาพ)
 *     tags: [SavedLooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ลิสต์ของลุคที่บันทึกไว้
 *   post:
 *     summary: อัปโหลดภาพลุคที่บันทึกไว้
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
 *                 description: รูปลุคที่ผู้ใช้อัปโหลด
 *     responses:
 *       201:
 *         description: เพิ่มลุคเรียบร้อยแล้ว
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
 *     responses:
 *       200:
 *         description: ลบลุคสำเร็จ
 */
router.route('/saved-looks')
  .get(protect, getSavedLooks)
  .post(protect, upload.single('savedLookImage'), addSavedLook)
  .delete(protect, deleteSavedLook);

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
 *         description: รหัสของผู้ใช้ที่ต้องการดูโปรไฟล์
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: แสดงโปรไฟล์สาธารณะของผู้ใช้สำเร็จ
 *       404:
 *         description: ไม่พบผู้ใช้
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.get('/public/:id', getUserPublicProfile);

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
 *         description: รหัสของผู้ใช้ที่ต้องการติดตาม
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: ติดตามผู้ใช้สำเร็จ
 *       400:
 *         description: คำขอไม่ถูกต้อง (อาจติดตามผู้ใช้นั้นอยู่แล้ว)
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบผู้ใช้
 * 
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
 *         description: รหัสของผู้ใช้ที่ต้องการเลิกติดตาม
 *         example: 60d2b3f04f1a2d001fbc2e7d
 *     responses:
 *       200:
 *         description: เลิกติดตามผู้ใช้สำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.route('/:id/follow')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

module.exports = router;
