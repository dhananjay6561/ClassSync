const ScheduleSlot = require('../models/ScheduleSlot');
const Substitution = require('../models/Substitution');
const User = require('../models/User');

async function getAvailableSubstitute(schoolId, date, weekday, periodIndex, excludedTeacherIds = []) {
  const teachers = await User.find({ schoolId, role: 'teacher', isActive: true, _id: { $nin: excludedTeacherIds } });

  for (const teacher of teachers) {
    const conflict = await ScheduleSlot.findOne({
      teacherId: teacher._id,
      weekday,
      periodIndex
    });

    if (!conflict) return teacher;
  }

  return null; // No one free
}

exports.generateSubstitutionsForLeave = async (leaveRequest) => {
  const { teacherId, fromDate, toDate, schoolId } = leaveRequest;
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const affectedSlots = await ScheduleSlot.find({ teacherId, schoolId });

  const substitutions = [];

  for (let date = new Date(from); date <= to; date.setDate(date.getDate() + 1)) {
    const weekday = date.getDay();

    for (const slot of affectedSlots) {
      if (slot.weekday !== weekday) continue;

      const substitute = await getAvailableSubstitute(schoolId, date, weekday, slot.periodIndex, [teacherId]);

      if (substitute) {
        const sub = await Substitution.create({
          originalTeacherId: teacherId,
          substituteTeacherId: substitute._id,
          scheduleSlotId: slot._id,
          reason: 'Leave',
          schoolId: schoolId,
          date: new Date(date)
        });

        substitutions.push({ sub, substitute, slot, date: new Date(date) });
      }
    }
  }

  return substitutions;
};

//this function generates substitutions for a teacher's leave request.
// It finds available substitutes for the affected schedule slots during the leave period.
// It returns an array of substitution objects containing the original teacher, substitute, schedule slot, and date.
// If no substitutes are available, it returns an empty array.
// This module provides a function to generate substitutions for a teacher's leave request.