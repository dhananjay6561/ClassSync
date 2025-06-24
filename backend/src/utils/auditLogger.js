const AuditLog = require('../models/AuditLog');

exports.logAction = async ({ req, action, targetId = null, details = {} }) => {
  try {
    const log = new AuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      schoolId: req.schoolId,
      action,
      targetId,
      details
    });
    await log.save();
    console.log(`[Audit] ${action} by ${req.user.email}`);
  } catch (err) {
    console.error('[Audit Error]', err);
  }
};
