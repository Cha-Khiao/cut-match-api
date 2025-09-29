const express = require('express');
const router = express.Router();
const { createSalon, findNearbySalons } = require('../controllers/salonController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Route สำหรับ Admin เพื่อสร้างร้านใหม่
router.route('/').post(protect, admin, createSalon);

// Route สำหรับ User เพื่อค้นหาร้านใกล้เคียง
router.route('/nearby').get(findNearbySalons);

module.exports = router;