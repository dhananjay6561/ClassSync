const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: { type: String, enum: ['admin', 'teacher'], required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  action: { type: String, required: true }, // e.g. 'leave_approved'
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  details: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
