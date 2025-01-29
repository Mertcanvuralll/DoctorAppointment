const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Track incomplete appointments
router.post('/track-incomplete', protect, notificationController.trackIncompleteAppointment);

module.exports = router; 