const ScheduleSlot = require('../models/ScheduleSlot');
const Substitution = require('../models/Substitution');
const User = require('../models/User');

exports.detectConflicts = async (schoolId) => {
  const teachers = await User.find({ schoolId, role: 'teacher', isActive: true });

  const overloadWarnings = [];
  const uncoveredSlots = [];

  for (const teacher of teachers) {
    const teacherSlots = await ScheduleSlot.find({ schoolId, teacherId: teacher._id });

    // 1. Analyze overloads per weekday
    const loadMap = {};
    for (const slot of teacherSlots) {
      if (!loadMap[slot.weekday]) loadMap[slot.weekday] = 0;
      loadMap[slot.weekday]++;
    }

    for (const [weekday, count] of Object.entries(loadMap)) {
      if (count > 5) {
        overloadWarnings.push({
          teacherId: teacher._id,
          teacherName: teacher.name,
          weekday,
          lectureCount: count
        });
      }
    }
  }

  // 2. Check substitution gaps
  const allSlots = await ScheduleSlot.find({ schoolId });
  for (const slot of allSlots) {
    const hasSub = await Substitution.exists({ scheduleSlotId: slot._id });
    const onLeave = await User.exists({ _id: slot.teacherId, isActive: true });

    if (!hasSub && onLeave) {
      uncoveredSlots.push({
        scheduleSlotId: slot._id,
        weekday: slot.weekday,
        periodIndex: slot.periodIndex,
        subject: slot.subject,
        classSection: slot.classSection,
        teacherId: slot.teacherId
      });
    }
  }

  return { overloadWarnings, uncoveredSlots };
};
