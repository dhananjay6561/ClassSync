const ScheduleSlot = require('../models/ScheduleSlot');
const User = require('../models/User');

// Admin: Assign a new slot to a teacher
exports.assignSlot = async (req, res) => {
  try {
    const { teacherId, weekday, periodIndex, subject, classSection } = req.body;
    const schoolId = req.schoolId;

    const teacher = await User.findOne({ _id: teacherId, schoolId });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found in your school.' });

    const slot = new ScheduleSlot({
      teacherId,
      schoolId,
      weekday,
      periodIndex,
      subject,
      classSection,
    });

    await slot.save();
    res.status(201).json({ message: 'Slot assigned.', slot });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slot already assigned to this teacher.' });
    }
    console.error('assignSlot error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Edit an existing slot
exports.editSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { subject, classSection } = req.body;
    const schoolId = req.schoolId;

    const slot = await ScheduleSlot.findOne({ _id: slotId, schoolId });
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });

    slot.subject = subject;
    slot.classSection = classSection;
    await slot.save();

    res.json({ message: 'Slot updated.', slot });
  } catch (err) {
    console.error('editSlot error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const schoolId = req.schoolId;

    const slot = await ScheduleSlot.findOneAndDelete({ _id: slotId, schoolId });
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });

    res.json({ message: 'Slot deleted.', slot });
  } catch (err) {
    console.error('deleteSlot error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Teacher/Admin: Get weekly schedule of a teacher
exports.getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const schoolId = req.schoolId;

    const slots = await ScheduleSlot.find({ teacherId, schoolId });
    res.json({ schedule: slots });
  } catch (err) {
    console.error('getTeacherSchedule error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Teacher: Get own schedule
exports.getMySchedule = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.schoolId;

    const slots = await ScheduleSlot.find({ teacherId, schoolId });
    res.json({ schedule: slots });
  } catch (err) {
    console.error('getMySchedule error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Get all slots in a school
exports.getAllSlots = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    const slots = await ScheduleSlot.find({ schoolId })
      .populate('teacherId', 'name email')
      .sort({ weekday: 1, periodIndex: 1 });
    res.json({ slots });
  } catch (err) {
    console.error('getAllSlots error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Get all slots for a specific teacher
exports.getTeacherSlots = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const schoolId = req.schoolId;

    const slots = await ScheduleSlot.find({ teacherId, schoolId })
      .populate('teacherId', 'name email')
      .sort({ weekday: 1, periodIndex: 1 });
    res.json({ slots });
  } catch (err) {
    console.error('getTeacherSlots error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// API for grid-style schedule (for UI rendering)
exports.getScheduleGrid = async (req, res) => {
  try {
    const { teacherId: paramId } = req.params;
    const isTeacher = req.user.role === 'teacher';

    const teacherId = isTeacher ? req.user.userId : paramId;
    const schoolId = req.schoolId;

    const slots = await ScheduleSlot.find({ teacherId, schoolId })
      .select('weekday periodIndex subject classSection') 

    res.json({ grid: slots });
  } catch (err) {
    console.error('getScheduleGrid error:', err);
    res.status(500).json({ message: 'Failed to fetch schedule grid.' });
  }
};

// Admin: Get weekly schedule for a specific class (grouped by weekday)
exports.getClassSchedule = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const section = req.params.section;

    const slots = await ScheduleSlot.find({ schoolId, classSection: section })
      .populate('teacherId', 'name email')
      .sort({ weekday: 1, periodIndex: 1 });

    const grouped = {};

    for (const slot of slots) {
      const day = `Day-${slot.weekday}`;
      if (!grouped[day]) grouped[day] = [];

      grouped[day].push({
        period: slot.periodIndex + 1,
        subject: slot.subject,
        teacher: slot.teacherId?.name || 'N/A',
        email: slot.teacherId?.email || 'N/A'
      });
    }

    res.json({ classSection: section, schedule: grouped });

  } catch (err) {
    console.error('getClassSchedule error:', err);
    res.status(500).json({ message: 'Failed to fetch class schedule' });
  }
};



//This module exports functions for managing schedule slots in a school.
// It includes functions for assigning, editing, deleting slots, and retrieving schedules for teachers.
// The functions handle errors, validate inputs, and ensure that operations are performed within the context of a specific school.
// The ScheduleSlot model is used to interact with the MongoDB database, and the User model is used to validate teacher existence.
// The functions return appropriate responses based on the success or failure of the operations.
// The module is designed to be used in a Node.js/Express application, with middleware to handle authentication and authorization.
// The functions are structured to provide clear and consistent responses, making it easier for frontend applications to
// consume the API and display relevant information to users.
//     res.status(201).json({ message: 'Leave applied successfully.', leaveRequest: res.body.leaveRequest });
//  }); 