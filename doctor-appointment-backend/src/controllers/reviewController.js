const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendReviewEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

exports.createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment belongs to user
    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own appointments'
      });
    }

    // Check if user has already reviewed this appointment
    const existingReview = await Review.findOne({
      appointmentId,
      userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this appointment'
      });
    }

    const review = new Review({
      doctorId: appointment.doctorId,
      userId,
      appointmentId,
      rating,
      comment
    });

    await review.save();

    // Update doctor's average rating
    await updateDoctorRating(appointment.doctorId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    logger.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review'
    });
  }
};

// Fetch doctor reviews
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({
      doctorId,
      status: 'approved'
    })
      .populate('userId', 'name picture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({
      doctorId,
      status: 'approved'
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

// Helper function: Update doctor's average rating
async function updateDoctorRating(doctorId) {
  const reviews = await Review.find({
    doctorId,
    status: 'approved'
  });

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Doctor.findByIdAndUpdate(doctorId, {
    rating: averageRating,
    reviewCount: reviews.length
  });
}

// Send email when appointment is completed
exports.sendReviewRequest = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'fullName')
      .populate('userId', 'email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    try {
      await sendReviewEmail(
        appointment.userId.email,
        appointmentId,
        appointment.doctorId.fullName
      );

      // Update appointment when email is sent successfully
      appointment.reviewEmailSent = true;
      appointment.reviewEmailSentAt = new Date();
      await appointment.save();

      res.json({
        success: true,
        message: 'Review request email sent successfully'
      });
    } catch (emailError) {
      logger.error('Email sending failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send review request email'
      });
    }
  } catch (error) {
    logger.error('Error in sendReviewRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing review request'
    });
  }
};

// Submit review
exports.submitReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const review = new Review({
      appointmentId,
      doctorId: appointment.doctorId,
      patientId: req.user._id,
      rating,
      comment,
      status: 'pending'
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    logger.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review'
    });
  }
}; 