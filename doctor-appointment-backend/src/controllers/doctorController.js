const Doctor = require('../models/Doctor');
const User = require('../models/User');
const logger = require('../utils/logger');
const Appointment = require('../models/Appointment');
const cities = require('../data/cities.json'); 

// City code to name mapping oluşturuyoruz
const cityCodeToName = {};
cities.forEach(city => {
  cityCodeToName[city.id] = city.name;
});

const cityCoordinates = {
  'İZMİR': { lat: 38.4192, lng: 27.1287 },
  'İSTANBUL': { lat: 41.0082, lng: 28.9784 },
  'ANKARA': { lat: 39.9334, lng: 32.8597 },
};

// Fetch all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'approved' })
      .populate('userId', 'name email picture');

    console.log('All Doctors:', doctors); // For debugging

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    logger.error('Error fetching all doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

// Fetch doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email picture');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    logger.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor details'
    });
  }
};

// Create new doctor
exports.createDoctor = async (req, res) => {
  try {
    const existingDoctor = await Doctor.findOne({ 
      $or: [
        { userId: req.user.id },
        { email: req.body.email }
      ]
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists'
      });
    }

    const doctor = new Doctor({
      ...req.body,
      userId: req.user.id,
      status: 'pending'
    });

    await doctor.save();

    // Update user role
    await User.findByIdAndUpdate(req.user.id, { role: 'doctor' });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    });
  } catch (error) {
    logger.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating doctor'
    });
  }
};

// Update doctor information
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Only own profile can be updated
    if (doctor.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    logger.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor'
    });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Only admin can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await doctor.remove();

    // Update user role
    await User.findByIdAndUpdate(doctor.userId, { role: 'user' });

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor'
    });
  }
};

// Search doctors
exports.searchDoctors = async (req, res) => {
  try {
    const { specialization, city, district } = req.query;
    
    let query = { status: 'approved' };
    
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    
    if (city) {
      // We use RegExp for case-insensitive search
      query['address.cityName'] = new RegExp('^' + city + '$', 'i');
    }
    
    if (district) {
      query['address.district'] = district;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email picture');

    console.log('Search query:', query); 

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors'
    });
  }
};

exports.register = async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    console.log('Authenticated user:', req.user);

    // Email check
    const email = req.user?.email || req.body.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user already has a doctor record
    const existingDoctor = await Doctor.findOne({ email: email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'A doctor with this email already exists'
      });
    }

    // Get city name from city code
    const cityName = cityCodeToName[req.body.address?.city] || req.body.address?.city;

    // Create new doctor record
    const doctor = new Doctor({
      userId: req.user._id,
      email: email,
      fullName: req.body.fullName,
      specialization: req.body.specialization,
      experience: req.body.experience,
      education: req.body.education,
      phone: req.body.phone,
      address: {
        street: req.body.address?.street,
        city: req.body.address?.city,
        district: req.body.address?.district,
        coordinates: req.body.address?.coordinates,
        cityName: cityName
      },
      availableDays: req.body.availableDays,
      workingHours: {
        start: req.body.workingHours?.start,
        end: req.body.workingHours?.end
      },
      consultationFee: req.body.consultationFee,
      status: 'pending'
    });

    console.log('Doctor object before save:', doctor);

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      data: doctor
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Appointment.find({
      doctorId,
      'review.rating': { $exists: true }
    })
    .populate('userId', 'name')
    .select('review userId')
    .sort({ 'review.createdAt': -1 });

    const formattedReviews = reviews.map(review => ({
      id: review._id,
      rating: review.review.rating,
      comment: review.review.comment,
      userName: review.userId.name,
      createdAt: review.review.createdAt
    }));

    res.json({
      success: true,
      data: {
        totalReviews: reviews.length,
        reviews: formattedReviews
      }
    });

  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const doctors = await Doctor.find()
      .skip(skip)
      .limit(limit);

    const total = await Doctor.countDocuments();

    res.json({
      success: true,
      data: doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};