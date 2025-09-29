const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon.js');

// @desc    Create a new salon (Admin only)
// @route   POST /api/salons
const createSalon = asyncHandler(async (req, res) => {
  const { name, address, phone, longitude, latitude } = req.body;

  const salon = new Salon({
    name,
    address,
    phone,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  });

  const createdSalon = await salon.save();
  res.status(201).json(createdSalon);
});

// @desc    Find salons near a given location
// @route   GET /api/salons/nearby?lng=100.5&lat=13.7
const findNearbySalons = asyncHandler(async (req, res) => {
  const { lng, lat } = req.query;

  if (!lng || !lat) {
    res.status(400);
    throw new Error('Longitude and Latitude are required');
  }

  const salons = await Salon.find({
    location: {
      $near: {
        $geometry: {
           type: "Point" ,
           coordinates: [ parseFloat(lng), parseFloat(lat) ]
        },
        $maxDistance: 10000 // ค้นหาในรัศมี 10 กิโลเมตร (10000 เมตร)
      }
    }
  });
  res.json(salons);
});

module.exports = {
  createSalon,
  findNearbySalons,
};