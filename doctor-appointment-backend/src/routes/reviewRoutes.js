const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validateComment = require('../middleware/commentValidator');

router.post('/', reviewController.createReview);
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

router.post(
  '/appointments/:appointmentId/review-request',
  protect,
  reviewController.sendReviewRequest
);

router.post(
  '/appointments/:appointmentId/review',
  protect,
  validateComment,
  reviewController.submitReview
);

module.exports = router; 