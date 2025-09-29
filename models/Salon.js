const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  // ✨ สำคัญมาก: เก็บข้อมูลพิกัดในรูปแบบ GeoJSON
  location: {
    type: {
      type: String,
      enum: ['Point'], // กำหนดให้เป็น 'Point' เสมอ
      required: true
    },
    coordinates: {
      type: [Number], // เก็บเป็น [longitude, latitude]
      required: true
    }
  },
});

// สร้าง Index สำหรับการค้นหาตามพิกัด (2dsphere) เพื่อความรวดเร็ว
salonSchema.index({ location: '2dsphere' });

const Salon = mongoose.model('Salon', salonSchema);
module.exports = Salon;