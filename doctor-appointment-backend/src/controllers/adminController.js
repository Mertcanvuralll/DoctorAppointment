const Doctor = require('../models/Doctor');
const User = require('../models/User');
const logger = require('../utils/logger');

// Fetch waiting doctors
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'pending' })
      .populate('userId', 'email name picture');

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    logger.error('Error fetching pending doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending doctors'
    });
  }
};

// Approve doctor
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

   // Update doctor status
    doctor.status = 'approved';
    await doctor.save();

    // Update user role
    await User.findByIdAndUpdate(doctor.userId, {
      role: 'doctor'
    });

    res.json({
      success: true,
      message: 'Doctor approved successfully',
      data: doctor
    });
  } catch (error) {
    logger.error('Error approving doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving doctor'
    });
  }
};

// Reject doctor
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update doctor status
    doctor.status = 'rejected';
    await doctor.save();

    // Update user role
    await User.findByIdAndUpdate(doctor.userId, {
      role: 'user'
    });

    res.json({
      success: true,
      message: 'Doctor rejected successfully',
      data: doctor
    });
  } catch (error) {
    logger.error('Error rejecting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting doctor'
    });
  }
};

// Fetch all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email picture');

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Fetch dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const pendingDoctors = await Doctor.countDocuments({ status: 'pending' });
    const approvedDoctors = await Doctor.countDocuments({ status: 'approved' });
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
}; 