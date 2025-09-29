const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon.js');

// @desc    Find salons near a given location
// @route   GET /api/salons/nearby?lng=100.5&lat=13.7
const findNearbySalons = asyncHandler(async (req, res) => {
  const { lng, lat, search } = req.query;

  if (!lng || !lat) {
    res.status(400);
    throw new Error('Longitude and Latitude are required');
  }

  let query = {
    location: {
      $near: {
        $geometry: {
           type: "Point" ,
           coordinates: [ parseFloat(lng), parseFloat(lat) ]
        },
        $maxDistance: 20000 // เพิ่มรัศมีเป็น 20 km
      }
    }
  };

  // ถ้ามีคำค้นหา ให้เพิ่มเงื่อนไขการค้นหาตามชื่อ
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const salons = await Salon.find(query);
  res.json(salons);
});

// @desc    Get all salons (for admin list)
// @route   GET /api/salons
const getSalons = asyncHandler(async (req, res) => {
    const salons = await Salon.find({});
    res.json(salons);
});

// @desc    Create a new salon (Admin only)
// @route   POST /api/salons
const createSalon = asyncHandler(async (req, res) => {
  const { name, address, phone, longitude, latitude } = req.body;
  const salon = new Salon({
    name, address, phone,
    location: { type: 'Point', coordinates: [longitude, latitude] }
  });
  const createdSalon = await salon.save();
  res.status(201).json(createdSalon);
});

// @desc    Update a salon (Admin only)
// @route   PUT /api/salons/:id
const updateSalon = asyncHandler(async (req, res) => {
    const { name, address, phone, longitude, latitude } = req.body;
    const salon = await Salon.findById(req.params.id);

    if (salon) {
        salon.name = name || salon.name;
        salon.address = address || salon.address;
        salon.phone = phone || salon.phone;
        if (longitude && latitude) {
            salon.location = { type: 'Point', coordinates: [longitude, latitude] };
        }
        const updatedSalon = await salon.save();
        res.json(updatedSalon);
    } else {
        res.status(404);
        throw new Error('Salon not found');
    }
});

// @desc    Delete a salon (Admin only)
// @route   DELETE /api/salons/:id
const deleteSalon = asyncHandler(async (req, res) => {
    const salon = await Salon.findById(req.params.id);
    if (salon) {
        await salon.deleteOne();
        res.json({ message: 'Salon removed' });
    } else {
        res.status(404);
        throw new Error('Salon not found');
    }
});

module.exports = {
  getSalons,
  createSalon,
  updateSalon,
  deleteSalon,
  findNearbySalons,
};