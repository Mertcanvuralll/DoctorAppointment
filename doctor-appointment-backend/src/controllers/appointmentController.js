const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { addToNotificationQueue } = require('../services/queueService');
const logger = require('../utils/logger');
const EmailService = require('../services/emailService');
const User = require('../models/User');

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Fetch doctor's working hours and existing appointments
    const workingHours = doctor.workingHours;
    const existingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startDate, $lte: endDate },
      status: 'confirmed'
    });

    // Calculate available slots
    const availableSlots = calculateAvailableSlots(
      workingHours,
      existingAppointments,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    logger.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots'
    });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user.id;

    // Check for existing appointment with the same doctor, date, and time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] } // Exclude cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Appointment slot is full. Please select another time.'
      });
    }

    // Check if the user has another appointment on the same day and time
    const userExistingAppointment = await Appointment.findOne({
      userId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (userExistingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have another appointment scheduled for this time.'
      });
    }

    // Fetch doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      userId,
      doctorId,
      date,
      time,
      status: 'pending'
    });

    await appointment.save();

    // Send only review email
    try {
      await EmailService.sendReviewRequest(
        user.email,
        appointment._id.toString(),
        doctor.fullName
      );
      console.log('✅ Review request email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue processing even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error in bookAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment'
    });
  }
};

exports.getBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const bookedSlots = await Appointment.find({
      doctorId,
      date: { $gte: startDate, $lte: endDate },
      status: 'confirmed'
    }).select('date time -_id');

    res.json({
      success: true,
      data: bookedSlots
    });
  } catch (error) {
    logger.error('Error fetching booked slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booked slots'
    });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user.id
    })
    .populate('doctorId')
    .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    logger.error('Error fetching my appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment'
    });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    console.log('Received review request:', {
      appointmentId,
      rating,
      comment
    });

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId');

    if (!appointment) {
      console.log('Appointment not found:', appointmentId);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    console.log('Found appointment:', {
      id: appointment._id,
      doctorId: appointment.doctorId._id
    });

    // Save review
    appointment.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await appointment.save();
    console.log('Review saved successfully');

    // Update doctor's average rating and total review count
    if (appointment.doctorId) {
      const appointments = await Appointment.find({
        doctorId: appointment.doctorId._id,
        'review.rating': { $exists: true }
      });

      const totalRating = appointments.reduce((sum, apt) => sum + apt.review.rating, 0);
      const averageRating = totalRating / appointments.length;
      const totalReviews = appointments.length; // Total review count

      // Update doctor
      await Doctor.findByIdAndUpdate(
        appointment.doctorId._id,
        { 
          rating: averageRating,
          totalReviews: totalReviews // Update total review count
        },
        { new: true }
      );

      console.log('Doctor rating updated:', {
        averageRating,
        totalReviews
      });
    }

    res.json({
      success: true,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Error in addReview:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    console.log('⭐ Starting status update with:', { appointmentId, status });

    const appointment = await Appointment.findById(appointmentId)
      .populate('userId', 'email name')
      .populate('doctorId', 'fullName email');

    if (!appointment) {
      console.log('❌ Appointment not found:', appointmentId);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    console.log('📝 Current appointment status:', appointment.status);
    console.log('📝 New status:', status);
    console.log('📝 Appointment details:', {
      id: appointment._id,
      userEmail: appointment.userId.email,
      doctorName: appointment.doctorId.fullName,
      date: appointment.date,
      time: appointment.time
    });

    // Extend status check
    if (status === 'confirmed' || status === 'approved') {
      console.log('🔄 Starting email process for appointment');
      
      try {
        // Send only review email
        console.log('📧 Attempting to send review email...');
        const reviewResult = await EmailService.sendReviewRequest(
          appointment.userId.email,
          appointment._id.toString(),
          appointment.doctorId.fullName
        );
        console.log('✅ Review email sent:', reviewResult.messageId);

        // Update status
        appointment.status = 'confirmed';
        appointment.reviewEmailSent = true;
        appointment.reviewEmailSentAt = new Date();
        await appointment.save();
        console.log('✅ Appointment updated with review status');

      } catch (emailError) {
        console.error('❌ Email error occurred:', {
          error: emailError.message,
          stack: emailError.stack,
          appointment: {
            id: appointment._id,
            email: appointment.userId.email,
            doctor: appointment.doctorId.fullName,
            status: appointment.status
          }
        });
      }
    } else {
      console.log('ℹ️ Status is not confirmed/approved, skipping emails');
      appointment.status = status;
      await appointment.save();
    }

    console.log('✅ Process completed successfully');

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });

  } catch (error) {
    console.error('❌ Error in updateAppointmentStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status'
    });
  }
};

function calculateAvailableSlots(workingHours, existingAppointments, startDate, endDate) {
  const slots = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const daySlots = generateTimeSlots(
      workingHours?.start || '09:00',
      workingHours?.end || '17:00',
      existingAppointments.filter(apt => 
        apt.date.toDateString() === currentDate.toDateString()
      )
    );

    if (daySlots.length > 0) {
      slots.push({
        date: new Date(currentDate),
        slots: daySlots
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

function generateTimeSlots(start = '09:00', end = '17:00', existingAppointments = []) {
  const slots = [];
  let currentTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  const interval = 30; // 30 minute intervals

  while (currentTime < endTime) {
    const timeString = currentTime.toTimeString().slice(0, 5);
    const isBooked = existingAppointments.some(apt => 
      new Date(apt.date).toTimeString().slice(0, 5) === timeString
    );

    if (!isBooked) {
      slots.push(timeString);
    }

    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return slots;
}

exports.testEmails = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Send only review email
    await EmailService.sendReviewRequest(
      email,
      "test-appointment-id",
      "Test Doctor"
    );

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
};

module.exports = {
  ...exports,
  calculateAvailableSlots,
  generateTimeSlots
}; 