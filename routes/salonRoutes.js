const express = require('express');
const router = express.Router();
const { 
    getSalons,
    createSalon,
    updateSalon,
    deleteSalon,
    findNearbySalons 
} = require('../controllers/salonController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     Salon:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: รหัสร้าน (สร้างอัตโนมัติ)
 *         name:
 *           type: string
 *           description: ชื่อร้านตัดผม
 *           example: ร้านสวยงาม
 *         address:
 *           type: string
 *           description: ที่อยู่ของร้าน
 *           example: 123 ถนนสุขุมวิท กรุงเทพฯ
 *         phone:
 *           type: string
 *           description: เบอร์โทรศัพท์ของร้าน
 *           example: 0812345678
 *         latitude:
 *           type: number
 *           description: พิกัดละติจูด
 *           example: 13.7563
 *         longitude:
 *           type: number
 *           description: พิกัดลองจิจูด
 *           example: 100.5018
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: วันที่เพิ่มร้าน
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: วันที่อัปเดตร้านล่าสุด
 */

/**
 * @swagger
 * tags:
 *   - name: Salons
 *     description: การจัดการข้อมูลร้านตัดผม
 */

/**
 * @swagger
 * /api/salons:
 *   get:
 *     summary: ดูรายการร้านตัดผมทั้งหมด
 *     tags: [Salons]
 *     responses:
 *       200:
 *         description: รายการร้านตัดผมทั้งหมด
 *   post:
 *     summary: เพิ่มร้านตัดผมใหม่ (เฉพาะแอดมิน)
 *     tags: [Salons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Salon'
 *     responses:
 *       201:
 *         description: เพิ่มร้านสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: เฉพาะผู้ดูแลระบบเท่านั้น
 */
router.route('/')
    .get(getSalons)
    .post(protect, admin, createSalon);

/**
 * @swagger
 * /api/salons/nearby:
 *   get:
 *     summary: ค้นหาร้านตัดผมใกล้เคียงตามพิกัด
 *     tags: [Salons]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: พิกัดละติจูดของผู้ใช้
 *         example: 13.7563
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: พิกัดลองจิจูดของผู้ใช้
 *         example: 100.5018
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: false
 *         description: รัศมี (กิโลเมตร) สำหรับค้นหาร้าน (ค่าเริ่มต้น = 5 กม.)
 *         example: 5
 *     responses:
 *       200:
 *         description: รายการร้านที่อยู่ในระยะใกล้เคียง
 */
router.route('/nearby').get(findNearbySalons);

/**
 * @swagger
 * /api/salons/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลร้านตัดผม (เฉพาะแอดมิน)
 *     tags: [Salons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสร้าน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Salon'
 *     responses:
 *       200:
 *         description: อัปเดตร้านสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: เฉพาะผู้ดูแลระบบเท่านั้น
 *       404:
 *         description: ไม่พบร้าน
 *   delete:
 *     summary: ลบร้านตัดผม (เฉพาะแอดมิน)
 *     tags: [Salons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสร้าน
 *     responses:
 *       200:
 *         description: ลบร้านสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: เฉพาะผู้ดูแลระบบเท่านั้น
 *       404:
 *         description: ไม่พบร้าน
 */
router.route('/:id')
    .put(protect, admin, updateSalon)
    .delete(protect, admin, deleteSalon);

module.exports = router;
