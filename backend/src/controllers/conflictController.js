const { detectConflicts } = require('../services/conflictEngine');

exports.getConflicts = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const result = await detectConflicts(schoolId);
    res.json(result);
  } catch (err) {
    console.error('Conflict Detection Error:', err);
    res.status(500).json({ message: 'Failed to detect conflicts' });
  }
};
