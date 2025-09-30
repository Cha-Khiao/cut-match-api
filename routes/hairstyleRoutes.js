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

// ✅ Middleware ตรวจสอบ error ของ validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ✅ Nested route → รีวิวของทรงผม
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
 *           description: รหัสไอดีของทรงผม (สร้างอัตโนมัติ)
 *         name:
 *           type: string
 *           description: ชื่อของทรงผม
 *           example: ทรงผมคอมม่า
 *         description:
 *           type: string
 *           description: รายละเอียดสั้น ๆ ของทรงผม
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
 *     description: จัดการข้อมูลทรงผม
 */

/**
 * @swagger
 * /api/hairstyles:
 *   get:
 *     summary: ดึงรายการทรงผมทั้งหมด
 *     tags: [Hairstyles]
 *     responses:
 *       200:
 *         description: รายการทรงผมทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hairstyle'
 *   post:
 *     summary: สร้างทรงผมใหม่ (เฉพาะแอดมิน)
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
 *         description: สร้างทรงผมสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ
 *       403:
 *         description: ไม่มีสิทธิ์ (ไม่ใช่แอดมิน)
 */
router.route('/')
  .get(getHairstyles)
  .post(
    protect,
    admin,
    [
      check('name', '⚠️ ต้องใส่ชื่อทรงผม').not().isEmpty(),
      check('description', '⚠️ ต้องใส่รายละเอียด').not().isEmpty(),
      check('imageUrls', '⚠️ ต้องมีรูปภาพอย่างน้อย 1 รูป').isArray({ min: 1 }),
      check('gender', '⚠️ ต้องเลือกเพศเป็น ชาย, หญิง หรือ Unisex').isIn(['ชาย', 'หญิง', 'Unisex']),
    ],
    validateRequest,
    createHairstyle
  );

/**
 * @swagger
 * /api/hairstyles/{id}:
 *   get:
 *     summary: ดึงข้อมูลทรงผมตามไอดี
 *     tags: [Hairstyles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของทรงผม
 *     responses:
 *       200:
 *         description: รายละเอียดของทรงผม
 *       404:
 *         description: ไม่พบทรงผม
 *   put:
 *     summary: อัปเดตทรงผม (เฉพาะแอดมิน)
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของทรงผม
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
 *     summary: ลบทรงผม (เฉพาะแอดมิน)
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสไอดีของทรงผม
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
