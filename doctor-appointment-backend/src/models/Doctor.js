const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: String,
  education: String,
  phone: String,
  address: {
    street: String,
    city: String,      
    cityName: String, 
    district: String,  
    districtName: String, 
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availableDays: [{
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }],
  availableHours: {
    start: String,
    end: String
  },
  consultationFee: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

doctorSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  if (!this.email) {
    next(new Error('Email field cannot be empty'));
  }
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 