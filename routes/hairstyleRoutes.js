const express = require('express');
const router = express.Router();
const reviewRouter = require('./reviewRoutes.js');
const { check, validationResult } = require('express-validator');
const {
  createHairstyle,
  getHairstyles,
  getHairstyleById,
  updateHairstyle,
  deleteHairstyle
} = require('../controllers/hairstyleController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Middleware สำหรับจัดการ Validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// เชื่อมเส้นทางรีวิวทรงผม
router.use('/:id/reviews', reviewRouter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Hairstyle:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - imageUrls
 *         - gender
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสของทรงผม (สร้างโดยระบบ)
 *         name:
 *           type: string
 *           description: ชื่อของทรงผม
 *           example: ทรงผมคอมม่า
 *         description:
 *           type: string
 *           description: คำอธิบายสั้น ๆ ของทรงผม
 *           example: ทรงผมยอดนิยมสไตล์เกาหลี
 *         imageUrls:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/image.jpg"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["สไตล์เกาหลี", "ผมสั้น"]
 *         suitableFaceShapes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["รูปไข่"]
 *         gender:
 *           type: string
 *           enum: [ชาย, หญิง, Unisex]
 *           example: ชาย
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างทรงผม
 */

/**
 * @swagger
 * tags:
 *   - name: Hairstyles
 *     description: การจัดการข้อมูลทรงผม
 */

/**
 * @swagger
 * /api/hairstyles:
 *   get:
 *     summary: ดึงรายการทรงผมทั้งหมด
 *     tags: [Hairstyles]
 *     responses:
 *       200:
 *         description: ส่งคืนรายการทรงผมทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hairstyle'
 *   post:
 *     summary: เพิ่มทรงผมใหม่ (เฉพาะผู้ดูแลระบบ)
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hairstyle'
 *     responses:
 *       201:
 *         description: เพิ่มทรงผมสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์ (ไม่ใช่ผู้ดูแลระบบ)
 */
router.route('/')
  .get(getHairstyles)
  .post(
    protect,
    admin,
    [
      check('name', 'จำเป็นต้องกรอกชื่อทรงผม').not().isEmpty(),
      check('description', 'จำเป็นต้องกรอกรายละเอียด').not().isEmpty(),
      check('imageUrls', 'imageUrls ต้องเป็นอาร์เรย์ที่มี URL อย่างน้อย 1 รายการ').isArray({ min: 1 }),
      check('gender', 'ต้องระบุเพศ และต้องเป็น ชาย, หญิง หรือ Unisex').isIn(['ชาย', 'หญิง', 'Unisex']),
    ],
    validateRequest,
    createHairstyle
  );

/**
 * @swagger
 * /api/hairstyles/{id}:
 *   get:
 *     summary: ดึงข้อมูลทรงผมจาก ID
 *     tags: [Hairstyles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของทรงผม
 *     responses:
 *       200:
 *         description: ข้อมูลของทรงผมที่ต้องการ
 *       404:
 *         description: ไม่พบทรงผมที่ระบุ
 *   put:
 *     summary: อัปเดตทรงผม (เฉพาะผู้ดูแลระบบ)
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของทรงผม
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hairstyle'
 *     responses:
 *       200:
 *         description: อัปเดตทรงผมสำเร็จ
 *       404:
 *         description: ไม่พบทรงผม
 *   delete:
 *     summary: ลบทรงผม (เฉพาะผู้ดูแลระบบ)
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของทรงผม
 *     responses:
 *       200:
 *         description: ลบทรงผมสำเร็จ
 *       404:
 *         description: ไม่พบทรงผม
 */
router.route('/:id')
  .get(getHairstyleById)
  .put(
    protect,
    admin,
    [
      check('name').optional().not().isEmpty(),
      check('description').optional().not().isEmpty(),
      check('imageUrls').optional().isArray({ min: 1 }),
      check('gender').optional().isIn(['ชาย', 'หญิง', 'Unisex']),
    ],
    validateRequest,
    updateHairstyle
  )
  .delete(protect, admin, deleteHairstyle);

module.exports = router;
