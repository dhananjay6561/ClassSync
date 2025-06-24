const Substitution = require('../models/Substitution');
const ScheduleSlot = require('../models/ScheduleSlot');
const User = require('../models/User');

// Teacher: Get their substitutions
exports.getMySubstitutions = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.schoolId;

    const subs = await Substitution.find({
      substituteTeacherId: teacherId,
      schoolId,
    })
      .populate('originalTeacherId', 'name email')
      .populate({
        path: 'scheduleSlotId',
        select: 'weekday periodIndex subject classSection',
      })
      .sort({ assignedAt: -1 });

    res.json(subs);
  } catch (err) {
    console.error('getMySubstitutions error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Get all substitutions in their school
exports.getAllSubstitutions = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    const subs = await Substitution.find({ schoolId })
      .populate('originalTeacherId', 'name email')
      .populate('substituteTeacherId', 'name email')
      .populate({
        path: 'scheduleSlotId',
        select: 'weekday periodIndex subject classSection',
      })
      .sort({ assignedAt: -1 });

    res.json(subs);
  } catch (err) {
    console.error('getAllSubstitutions error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Get substitution history with optional date range
exports.getSubstitutionHistory = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { from, to } = req.query;

    const dateFilter = {};
    if (from) dateFilter.createdAt = { $gte: new Date(from) };
    if (to) dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(to) };

    const substitutions = await Substitution.find(dateFilter)
      .populate('originalTeacherId', 'name email')
      .populate('substituteTeacherId', 'name email')
      .populate('scheduleSlotId');

    const filtered = substitutions.filter(sub => 
      sub.scheduleSlotId?.schoolId?.toString() === schoolId.toString()
    );

    const result = filtered.map(sub => ({
      date: sub.createdAt.toISOString().split('T')[0],
      period: sub.scheduleSlotId?.periodIndex + 1,
      weekday: sub.scheduleSlotId?.weekday,
      subject: sub.scheduleSlotId?.subject,
      classSection: sub.scheduleSlotId?.classSection,
      reason: sub.reason,
      originalTeacher: {
        name: sub.originalTeacherId?.name || 'N/A',
        email: sub.originalTeacherId?.email || 'N/A'
      },
      substituteTeacher: {
        name: sub.substituteTeacherId?.name || 'N/A',
        email: sub.substituteTeacherId?.email || 'N/A'
      }
    }));

    res.json({ count: result.length, history: result });
  } catch (err) {
    console.error('Substitution History Error:', err);
    res.status(500).json({ message: 'Failed to fetch substitution history' });
  }
};


//This code defines two functions for managing teacher substitutions in a school system.
// The `getMySubstitutions` function retrieves all substitutions for the currently logged-in teacher.
// It populates the original teacher's details and the schedule slot information, sorting the results by the assignment date.
// The `getAllSubstitutions` function retrieves all substitutions in the school, populating both the original and substitute teacher details,
// as well as the schedule slot information. It also sorts the results by the assignment date.
// The functions handle errors and respond with appropriate status codes and messages.
// The `getMySubstitutions` function retrieves a teacher's substitutions, populating original teacher and schedule slot details.
// The `getAllSubstitutions` function retrieves all substitutions in a school, populating both original and substitute teacher details.
// The functions use Mongoose to query the `Substitution` model and populate related fields.