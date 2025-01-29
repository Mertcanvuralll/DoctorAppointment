const { QueueService } = require('../services/queueService');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.trackIncompleteAppointment = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const userId = req.user.id;

    // Check if user has an appointment with this doctor
    const existingAppointment = await Appointment.findOne({
      userId,
      doctorId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!existingAppointment) {
      const doctor = await Doctor.findById(doctorId);
      const user = await User.findById(userId);

      if (!doctor || !user) {
        return res.status(404).json({
          success: false,
          message: 'Doctor or user not found'
        });
      }

      // Add to queue
      await QueueService.addToIncompleteQueue(user, doctor);

      console.log('✅ Added to incomplete appointments queue:', {
        user: user.email,
        doctor: doctor.fullName
      });
    }

    res.json({ 
      success: true,
      message: 'Tracking incomplete appointment'
    });
  } catch (error) {
    console.error('Error tracking incomplete appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking incomplete appointment'
    });
  }
};

module.exports = {
  trackIncompleteAppointment: exports.trackIncompleteAppointment
}; 