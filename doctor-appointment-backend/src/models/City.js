const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

citySchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.toUpperCase('tr-TR');
  }
  next();
});

const City = mongoose.model('City', citySchema);

module.exports = City; 