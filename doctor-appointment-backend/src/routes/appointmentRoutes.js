const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Routes that do not require authentication
router.post('/test-emails', appointmentController.testEmails);
router.post('/:appointmentId/review', appointmentController.addReview); // Review route is public

// Routes that require authentication
router.use(protect);

// Appointment routes
router.post('/book', appointmentController.bookAppointment);
router.get('/available-slots/:doctorId', appointmentController.getAvailableSlots);
router.get('/booked-slots/:doctorId', appointmentController.getBookedSlots);
router.get('/my-appointments', appointmentController.getMyAppointments);
router.post('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router; 