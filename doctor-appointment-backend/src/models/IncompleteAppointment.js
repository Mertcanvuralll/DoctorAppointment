const mongoose = require('mongoose');

const incompleteAppointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  lastStep: {
    type: String,
    enum: ['doctor_selected', 'slot_selected', 'confirmation_pending'],
    required: true
  },
  selectedSlot: {
    date: Date,
    time: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60
  },
  lastNotificationSent: {
    type: Date
  },
  notificationCount: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

const IncompleteAppointment = mongoose.model('IncompleteAppointment', incompleteAppointmentSchema);
module.exports = IncompleteAppointment; 