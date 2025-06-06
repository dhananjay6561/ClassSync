const LeaveRequest = require('../models/LeaveRequest');
const ScheduleSlot = require('../models/ScheduleSlot'); // We'll need this later for substitution
const Substitution = require('../models/Substitution'); // To be created soon
const { assignSubstitutesForLeave } = require('../services/substitutionEngine');
const { sendLeaveStatusEmail } = require('../services/notificationService');
const User = require('../models/User');


// Teacher applies for leave
exports.applyLeave = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.schoolId;
    const { fromDate, toDate, reason } = req.body;

    if (new Date(toDate) < new Date(fromDate)) {
      return res.status(400).json({ message: "'toDate' must be after or equal to 'fromDate'" });
    }

    // Optional: Check if leave overlaps with existing leaves by the same teacher
    const overlappingLeave = await LeaveRequest.findOne({
      teacherId,
      schoolId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { fromDate: { $lte: new Date(toDate), $gte: new Date(fromDate) } },
        { toDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
        { fromDate: { $lte: new Date(fromDate) }, toDate: { $gte: new Date(toDate) } }
      ]
    });
    if (overlappingLeave) {
      return res.status(400).json({ message: 'You already have a leave request overlapping this period.' });
    }

    const leaveRequest = new LeaveRequest({
      teacherId,
      schoolId,
      fromDate,
      toDate,
      reason,
    });

    await leaveRequest.save();

    res.status(201).json({ message: 'Leave request submitted successfully.', leaveRequest });
  } catch (err) {
    console.error('applyLeave error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin views all leave requests for their school
exports.getAllLeaves = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const leaves = await LeaveRequest.find({ schoolId }).populate('teacherId', 'name email').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('getAllLeaves error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin approves or rejects leave request
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
    }

    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request already processed.' });
    }

    leaveRequest.status = status;
    if (adminComment) leaveRequest.adminComment = adminComment;
    await leaveRequest.save();

    // Notify teacher about leave status
    const teacher = await User.findById(leaveRequest.teacherId);
    if (teacher && teacher.email) {
      await sendLeaveStatusEmail(
        teacher.email,
        teacher.name,
        status,
        leaveRequest.fromDate,
        leaveRequest.toDate,
        adminComment || ''
      );
    }

    // If approved, assign substitutes
    if (status === 'approved') {
      // existing call to substitution engine
      const createdSubs = await assignSubstitutesForLeave(
        leaveRequest.schoolId,
        leaveRequest.teacherId,
        leaveRequest.fromDate,
        leaveRequest.toDate
      );

      // Notify substitutes
      for (const sub of createdSubs) {
        // Fetch substitute teacher details
        const subTeacher = await User.findById(sub.substituteTeacherId);
        // Fetch slot details (weekday, periodIndex, classSection, subject)
        const slot = await ScheduleSlot.findById(sub.scheduleSlotId);
        if (subTeacher && slot) {
          // Determine a human‐readable date for this slot
          // Simplify by picking the first date in the leave that matches this weekday
          const leaveDates = [];
          for (
            let d = new Date(leaveRequest.fromDate);
            d <= leaveRequest.toDate;
            d.setDate(d.getDate() + 1)
          ) {
            leaveDates.push(new Date(d));
          }
          const slotDateObj = leaveDates.find(
            (dt) => dt.getDay() === Number(slot.weekday)
          );
          const dateString = slotDateObj
            ? slotDateObj.toLocaleDateString()
            : 'N/A';

          await sendSubstitutionAssignedEmail(
            subTeacher.email,
            subTeacher.name,
            {
              weekday: slot.weekday,
              periodIndex: slot.periodIndex,
              subject: slot.subject,
              classSection: slot.classSection,
              dateString,
            }
          );
        }
      }
    }

    res.json({ message: `Leave request ${status}.`, leaveRequest });
  } catch (err) {
    console.error('updateLeaveStatus error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// Teacher views their own leave requests