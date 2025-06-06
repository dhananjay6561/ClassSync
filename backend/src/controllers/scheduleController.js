const ScheduleSlot = require('../models/ScheduleSlot');

// Create or update one or more schedule slots
exports.setSchedule = async (req, res) => {
  try {
    const { teacherId, slots, schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({ message: 'schoolId is required' });
    }

    await ScheduleSlot.deleteMany({ schoolId, teacherId });

    const newSlots = slots.map(slot => ({ ...slot, teacherId, schoolId }));
    await ScheduleSlot.insertMany(newSlots);

    res.status(200).json({ message: 'Schedule updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error setting schedule' });
  }
};


// Get a teacher’s weekly schedule
exports.getTeacherSchedule = async (req, res) => {
  try {
    const teacherId = req.params.teacherId || req.user.userId;
    const schedule = await ScheduleSlot.find({
      teacherId,
      schoolId: req.schoolId
    }).sort({ weekday: 1, periodIndex: 1 });

    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};


//This code defines two functions for managing a teacher's schedule in a school system.
// The `setSchedule` function allows creating or updating schedule slots for a teacher.
// It accepts a request body containing the teacher's ID and an array of slots, each with a weekday, period index, subject, and class section.
// The function deletes any existing schedule slots for that teacher and school, then inserts the new slots into the database.
// The `getTeacherSchedule` function retrieves a teacher's weekly schedule based on their ID.
// It fetches all schedule slots for the specified teacher and school, sorting them by weekday and period index.
// Both functions handle errors and respond with appropriate status codes and messages.
// The `setSchedule` function is used to set or update a teacher's schedule, while the `getTeacherSchedule` function retrieves a teacher's schedule.