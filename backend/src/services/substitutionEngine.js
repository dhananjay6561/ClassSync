const ScheduleSlot = require('../models/ScheduleSlot');
const Substitution = require('../models/Substitution');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

/**
 * Auto-assign substitutes for all approved leaves in a given school.
 * Called after a leave is approved.
 *
 * @param {ObjectId} schoolId 
 * @param {ObjectId} originalTeacherId 
 * @param {Date} fromDate 
 * @param {Date} toDate 
 */
async function assignSubstitutesForLeave(schoolId, originalTeacherId, fromDate, toDate) {
  // 1. Find all schedule slots for originalTeacher in the leave date range
  // We'll assume weekday as day of week (0-6), so we'll map leave dates to weekdays
  const dayMilliseconds = 24 * 60 * 60 * 1000;

  // Generate all weekdays between fromDate and toDate
  let leaveDates = [];
  for (let d = new Date(fromDate); d <= toDate; d = new Date(d.getTime() + dayMilliseconds)) {
    leaveDates.push(new Date(d));
  }

  // Map dates to weekdays
  let leaveWeekdays = leaveDates.map(date => date.getDay()); // 0=Sun ... 6=Sat

  // Find schedule slots for originalTeacher on those weekdays
  const slots = await ScheduleSlot.find({
    teacherId: originalTeacherId,
    schoolId,
    weekday: { $in: leaveWeekdays },
  });

  // 2. For each slot, find a suitable substitute teacher:
  // Conditions for substitute:
  // - Same school
  // - Active
  // - Not originalTeacher
  // - Not scheduled for same slot (no conflict)
  // - Not overloaded (limit substitutions per day or week - for now, simple)
  
  // Fetch all active teachers except originalTeacher
  const candidates = await User.find({
    schoolId,
    role: 'teacher',
    isActive: true,
    _id: { $ne: originalTeacherId },
  });

  const substitutionsToCreate = [];

  for (const slot of slots) {
    // For each candidate, check conflict for this slot
    let substituteFound = null;

    for (const candidate of candidates) {
      // Check if candidate has schedule slot at same weekday and periodIndex
      const conflictSlot = await ScheduleSlot.findOne({
        teacherId: candidate._id,
        schoolId,
        weekday: slot.weekday,
        periodIndex: slot.periodIndex,
      });

      if (conflictSlot) {
        // Candidate busy this period
        continue;
      }

      // Check if candidate already has substitution assigned for this slot/time (to avoid overload)
      const existingSubstitution = await Substitution.findOne({
        substituteTeacherId: candidate._id,
        schoolId,
        // We want to check same weekday and periodIndex
      });

      // To do this efficiently, we should join with ScheduleSlot to check slot time:
      // For now, simplify by checking any substitution on same weekday & periodIndex
      const existingSubOnSlot = await Substitution.findOne({
        substituteTeacherId: candidate._id,
        schoolId,
      }).populate({
        path: 'scheduleSlotId',
        match: {
          weekday: slot.weekday,
          periodIndex: slot.periodIndex,
        }
      });

      if (existingSubOnSlot && existingSubOnSlot.scheduleSlotId) {
        // Candidate already substituting this slot
        continue;
      }

      // Candidate free and not overloaded for this slot
      substituteFound = candidate;
      break;
    }

    if (!substituteFound) {
      console.warn(`No substitute found for slot ${slot._id} on weekday ${slot.weekday}, period ${slot.periodIndex}`);
      continue; // skip if no substitute found
    }

    substitutionsToCreate.push({
      originalTeacherId,
      substituteTeacherId: substituteFound._id,
      schoolId,
      scheduleSlotId: slot._id,
      reason: 'Teacher leave substitution',
    });
  }

  // Save all substitutions in bulk
  if (substitutionsToCreate.length > 0) {
    await Substitution.insertMany(substitutionsToCreate);
  }

  return substitutionsToCreate;
}

module.exports = {
  assignSubstitutesForLeave,
};


/**
 * This module provides a function to automatically assign substitute teachers
 * for all approved leave requests in a school. It finds the schedule slots of
 * the original teacher during their leave period and assigns available substitutes
 * who are not already scheduled for those slots.
 *
 * The function is designed to be called after a leave request is approved, ensuring
 * that all necessary substitutions are handled efficiently.
 */
// The function `assignSubstitutesForLeave` takes a school ID, the original teacher's ID,
// and the leave period (fromDate to toDate). It first retrieves all schedule slots for the original teacher
// during the leave period, then finds suitable substitute teachers who are active, not the original teacher,
// and not already scheduled for the same slots. It creates substitution records for each slot where a substitute is found.
// The function uses Mongoose to interact with the MongoDB database, querying the `ScheduleSlot` and `User` models
// to find available substitutes and the `Substitution` model to create new substitution records.
// This approach ensures that the school can efficiently manage teacher absences and maintain continuity in classes
// during leave periods.
// The function handles potential conflicts by checking if a substitute is already scheduled for the same time slot
// and avoids assigning them if they are. It also logs warnings if no substitutes are found for specific slots.
// This module is essential for automating the process of managing teacher leaves and ensuring that classes are covered
// during those times, thereby improving the overall efficiency of school operations.
// The function is exported for use in other parts of the application, such as when a leave request is approved.
// This code is designed to automate the process of assigning substitute teachers
// in a school system, ensuring that classes continue smoothly even when a teacher is on leave.