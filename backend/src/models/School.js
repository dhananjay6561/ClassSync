const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timetableConfig: {
    periodCount: { type: Number, default: 8 },
    periodDurationMinutes: { type: Number, default: 45 },
    startHour: { type: Number, default: 8 }, // 8 AM
    startMinute: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
// This module defines a Mongoose schema for a School model.
// It includes fields for the school's name and timetable configuration.
// The timetable configuration includes the number of periods, duration of each period in minutes, and the start time of the school day.
// The schema is exported as a Mongoose model for use in other parts of the application.
// The 'timestamps' option automatically adds createdAt and updatedAt fields to the schema.
// The 'name' field is required and should be a string.
// The 'timetableConfig' field is an object that contains:
// - 'periodCount': Number of periods in a day (default is 8).
// - 'periodDurationMinutes': Duration of each period in minutes (default is 45).
// - 'startHour': Starting hour of the school day (default is 8 AM).
// - 'startMinute': Starting minute of the school day (default is 0).
// This schema is used to create and manage school records in the application.
// The 'schoolSchema' defines the structure of school documents in the MongoDB database.