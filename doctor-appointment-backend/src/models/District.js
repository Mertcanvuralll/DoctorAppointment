const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cityId: {
    type: String,
    required: true
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

districtSchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.toUpperCase('tr-TR');
  }
  next();
});

const District = mongoose.model('District', districtSchema);

module.exports = District; 