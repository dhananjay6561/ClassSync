const cron = require('node-cron');
const { detectConflicts } = require('../services/conflictEngine');
const User = require('../models/User');
const School = require('../models/School');
const { sendConflictSummaryEmail } = require('../services/notificationService');

async function runConflictCheck() {
  console.log(`[CRON] Conflict Check Running at ${new Date().toLocaleString()}`);

  const schools = await School.find({});
  for (const school of schools) {
    const conflictResult = await detectConflicts(school._id);

    const admins = await User.find({ schoolId: school._id, role: 'admin' });
    for (const admin of admins) {
      await sendConflictSummaryEmail(admin.email, admin.name, school.name, conflictResult);
    }
  }

  console.log(`[CRON] Conflict Check Completed at ${new Date().toLocaleString()}`);
}

module.exports = () => {
  // Run daily at 8:00 AM server time
  cron.schedule('0 8 * * *', runConflictCheck);
};
