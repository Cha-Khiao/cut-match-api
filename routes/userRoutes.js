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

// Middleware to handle validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// =================================================================
// ✨ SWAGGER DEFINITIONS
// =================================================================

/**
 * @swagger
 * tags:
 * - name: Users
 * description: การยืนยันตัวตนและโปรไฟล์ผู้ใช้ (Auth & Profiles)
 * - name: Social
 * description: ฟังก์ชันเกี่ยวกับโซเชียล (Follow, Search)
 * - name: User Content
 * description: การจัดการเนื้อหาของผู้ใช้ (Favorites, Saved Looks)
 */

/**
 * @swagger
 * components:
 * schemas:
 * UserInput:
 * type: object
 * required: [username, email, password]
 * properties:
 * username:
 * type: string
 * example: "John Doe"
 * email:
 * type: string
 * format: email
 * example: "john.doe@example.com"
 * password:
 * type: string
 * format: password
 * example: "password123"
 * LoginInput:
 * type: object
 * required: [email, password]
 * properties:
 * email:
 * type: string
 * format: email
 * example: "john.doe@example.com"
 * password:
 * type: string
 * format: password
 * example: "password123"
 * AddFavoriteInput:
 * type: object
 * required: [hairstyleId]
 * properties:
 * hairstyleId:
 * type: string
 * description: ID ของทรงผมที่ต้องการเพิ่มเป็นรายการโปรด
 * example: "60d2b3f04f1a2d001fbc2e7e"
 * DeleteSavedLookInput:
 * type: object
 * required: [imageUrl]
 * properties:
 * imageUrl:
 * type: string
 * description: URL ของรูปภาพที่ต้องการลบ
 * example: "https://res.cloudinary.com/..."
 */


// =================================================================
// ✨ AUTHENTICATION ROUTES (การยืนยันตัวตน)
// =================================================================

/**
 * @swagger
 * /api/users/register:
 * post:
 * summary: สมัครสมาชิกผู้ใช้ใหม่
 * tags: [Users]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserInput'
 * responses:
 * 201:
 * description: สมัครสมาชิกสำเร็จ
 * 400:
 * description: ข้อมูลไม่ถูกต้อง หรือมีอีเมลนี้ในระบบแล้ว
 */
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  validateRequest,
  registerUser
);

/**
 * @swagger
 * /api/users/login:
 * post:
 * summary: เข้าสู่ระบบเพื่อรับ Token
 * tags: [Users]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginInput'
 * responses:
 * 200:
 * description: เข้าสู่ระบบสำเร็จ
 * 401:
 * description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 */
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  validateRequest,
  loginUser
);


// =================================================================
// ✨ PROFILE ROUTES (โปรไฟล์)
// =================================================================

/**
 * @swagger
 * /api/users/profile:
 * get:
 * summary: ดูข้อมูลโปรไฟล์ของตัวเอง (ที่ล็อกอินอยู่)
 * tags: [Users]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200: { description: "ข้อมูลโปรไฟล์" }
 * 401: { description: "ไม่ได้รับอนุญาต" }
 * put:
 * summary: อัปเดตข้อมูลโปรไฟล์ของตัวเอง
 * tags: [Users]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * username: { type: string }
 * password: { type: string, format: password }
 * profileImage: { type: string, format: binary }
 * salonName: { type: string }
 * salonMapUrl: { type: string }
 * responses:
 * 200: { description: "อัปเดตสำเร็จ" }
 * 401: { description: "ไม่ได้รับอนุญาต" }
 * delete:
 * summary: ลบบัญชีของตัวเอง
 * tags: [Users]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200: { description: "ลบบัญชีสำเร็จ" }
 * 401: { description: "ไม่ได้รับอนุญาต" }
 */
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profileImage'), updateUserProfile)
  .delete(protect, deleteUserProfile);

/**
 * @swagger
 * /api/users/public/{id}:
 * get:
 * summary: ดูข้อมูลโปรไฟล์สาธารณะของผู้อื่น
 * tags: [Users]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string }
 * responses:
 * 200: { description: "ข้อมูลโปรไฟล์สาธารณะ" }
 * 404: { description: "ไม่พบผู้ใช้" }
 */
router.get('/public/:id', getUserPublicProfile);


// =================================================================
// ✨ SOCIAL & DISCOVERY ROUTES (โซเชียลและการค้นหา)
// =================================================================

/**
 * @swagger
 * /api/users/search:
 * get:
 * summary: ค้นหาผู้ใช้ด้วยชื่อ
 * tags: [Social]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: query
 * name: q
 * schema: { type: string }
 * description: คำค้นหาสำหรับ username
 * responses:
 * 200:
 * description: รายชื่อผู้ใช้ที่ค้นหาเจอ
 */
router.route('/search').get(protect, searchUsers);

/**
 * @swagger
 * /api/users/{id}/follow:
 * post:
 * summary: ติดตามผู้ใช้
 * tags: [Social]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string }
 * description: ID ของผู้ใช้ที่ต้องการติดตาม
 * responses:
 * 200: { description: "ติดตามสำเร็จ" }
 * delete:
 * summary: เลิกติดตามผู้ใช้
 * tags: [Social]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string }
 * description: ID ของผู้ใช้ที่ต้องการเลิกติดตาม
 * responses:
 * 200: { description: "เลิกติดตามสำเร็จ" }
 */
router.route('/:id/follow')
  .post(protect, followUser)
  .delete(protect, unfollowUser);


// =================================================================
// ✨ USER CONTENT ROUTES (เนื้อหาของผู้ใช้)
// =================================================================

/**
 * @swagger
 * /api/users/favorites:
 * get:
 * summary: ดูรายการทรงผมโปรดทั้งหมด
 * tags: [User Content]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200: { description: "รายการทรงผมโปรด" }
 * post:
 * summary: เพิ่มทรงผมในรายการโปรด
 * tags: [User Content]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AddFavoriteInput'
 * responses:
 * 200: { description: "เพิ่มสำเร็จ" }
 */
router.route('/favorites')
  .get(protect, getFavoriteHairstyles)
  .post(protect, addFavoriteHairstyle);

/**
 * @swagger
 * /api/users/favorites/{id}:
 * delete:
 * summary: ลบทรงผมออกจากรายการโปรด
 * tags: [User Content]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string }
 * description: ID ของทรงผมที่ต้องการลบ
 * responses:
 * 200: { description: "ลบสำเร็จ" }
 */
router.route('/favorites/:id')
  .delete(protect, removeFavoriteHairstyle);


/**
 * @swagger
 * /api/users/saved-looks:
 * get:
 * summary: ดูรูปภาพ Looks ที่บันทึกไว้ทั้งหมด
 * tags: [User Content]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200: { description: "รายการ URL รูปภาพที่บันทึกไว้" }
 * post:
 * summary: อัปโหลดและบันทึก Look ใหม่
 * tags: [User Content]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * savedLookImage: { type: string, format: binary }
 * responses:
 * 201: { description: "บันทึก Look สำเร็จ" }
 * delete:
 * summary: ลบ Look ที่บันทึกไว้
 * tags: [User Content]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/DeleteSavedLookInput'
 * responses:
 * 200: { description: "ลบ Look สำเร็จ" }
 */
router.route('/saved-looks')
    .get(protect, getSavedLooks)
    .post(protect, upload.single('savedLookImage'), addSavedLook)
    .delete(protect, deleteSavedLook);


module.exports = router;