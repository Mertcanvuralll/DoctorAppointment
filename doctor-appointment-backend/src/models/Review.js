const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.pre('save', async function(next) {
  const inappropriateWords = ['kötü kelime1', 'kötü kelime2'];
  const commentLower = this.comment.toLowerCase();
  
  const hasInappropriateWord = inappropriateWords.some(word => 
    commentLower.includes(word.toLowerCase())
  );

  if (hasInappropriateWord) {
    this.status = 'rejected';
  }

  next();
});

// Update doctor's rating when a comment is added
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Doctor = require('./Doctor');

  const stats = await Review.aggregate([
    {
      $match: { 
        doctorId: this.doctorId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$doctorId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(this.doctorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema); 