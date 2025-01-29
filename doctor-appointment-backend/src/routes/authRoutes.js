const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/google', authController.googleLogin);
router.get('/check', authController.check);
router.post('/logout', authController.logout);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);

module.exports = router; 