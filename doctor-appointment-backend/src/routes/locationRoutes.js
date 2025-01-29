const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/cities', locationController.getCities);
router.get('/districts/:cityId', locationController.getDistricts);

module.exports = router; 