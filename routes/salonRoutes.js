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

router.route('/')
    .get(getSalons) // Admin and potentially users can see the list
    .post(protect, admin, createSalon);

router.route('/nearby').get(findNearbySalons);

router.route('/:id')
    .put(protect, admin, updateSalon)
    .delete(protect, admin, deleteSalon);

module.exports = router;