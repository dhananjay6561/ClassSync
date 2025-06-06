const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekday: { type: String, required: true }, // 'Monday', 'Tuesday', etc.
  periodIndex: { type: Number, required: true }, // 0-based index
  subject: { type: String, required: true },
  classSection: { type: String, required: true } // e.g., '6A', '10C'
}, { timestamps: true });

module.exports = mongoose.model('ScheduleSlot', scheduleSlotSchema);

// This code defines a Mongoose schema for a schedule slot in a school system.
// It includes fields for the school ID, teacher ID, weekday, period index, subject, and class section.
// The schema is then exported as a Mongoose model named 'ScheduleSlot'.
// The model can be used to interact with the 'scheduleslots' collection in the MongoDB database.       
// The schema includes timestamps to automatically manage createdAt and updatedAt fields.
// The schoolId and teacherId fields are references to the School and User models, respectively,
// ensuring that each schedule slot is associated with a specific school and teacher.
// The weekday field is a string representing the day of the week, while periodIndex is a number indicating the slot's position in the day's schedule.
// The subject field is a string representing the subject taught during that slot,