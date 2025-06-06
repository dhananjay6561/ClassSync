const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
  originalTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  substituteTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  scheduleSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduleSlot',
    required: true,
  },
  reason: {
    type: String,
    default: 'Teacher leave substitution',
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Substitution', substitutionSchema);
