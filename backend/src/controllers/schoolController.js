const School = require('../models/School');

// Create new school
exports.createSchool = async (req, res) => {
  try {
    const { name, timetableConfig } = req.body;

    const school = new School({ name, timetableConfig });
    await school.save();

    res.status(201).json(school);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error creating school' });
  }
};

// Update timetable config
exports.updateTimetableConfig = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { timetableConfig } = req.body;

    const school = await School.findByIdAndUpdate(
      schoolId,
      { timetableConfig },
      { new: true }
    );

    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating timetable config' });
  }
};
// This code defines two controller functions for managing schools in an educational application.
// The `createSchool` function creates a new school with a specified name and timetable configuration, saving it to the database.
// The `updateTimetableConfig` function updates the timetable configuration of an existing school identified by its ID.
// Both functions handle errors and respond with appropriate status codes and messages.         
// The `createSchool` function handles the creation of a new school, including its name and timetable configuration.
// The `updateTimetableConfig` function updates the timetable configuration for an existing school based on its ID.
// Both functions use Mongoose to interact with the MongoDB database and handle errors appropriately.
// The `createSchool` function creates a new school with a specified name and timetable configuration, saving it to the database.
// The `updateTimetableConfig` function updates the timetable configuration of an existing school identified by its ID.
// Both functions handle errors and respond with appropriate status codes and messages.
// The `createSchool` function creates a new school with a specified name and timetable configuration, saving it to the database.
// The `updateTimetableConfig` function updates the timetable configuration of an existing school identified by its ID.
// Both functions handle errors and respond with appropriate status codes and messages.
// The `createSchool` function creates a new school with a specified name and timetable configuration, saving it to the database.
// The `updateTimetableConfig` function updates the timetable configuration of an existing school identified by its ID.
// Both functions handle errors and respond with appropriate status codes and messages.