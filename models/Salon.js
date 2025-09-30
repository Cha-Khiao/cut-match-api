const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
});

salonSchema.index({ location: '2dsphere' });

const Salon = mongoose.model('Salon', salonSchema);
module.exports = Salon;