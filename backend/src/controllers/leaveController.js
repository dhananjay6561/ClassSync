const LeaveRequest = require('../models/LeaveRequest');
const ScheduleSlot = require('../models/ScheduleSlot');
const Substitution = require('../models/Substitution');
const { generateSubstitutionsForLeave } = require('../services/substitutionEngine');
const { sendLeaveStatusEmail, sendSubstitutionAssignedEmail } = require('../services/notificationService');
const User = require('../models/User');
const { logAction } = require('../utils/auditLogger');

// 🧑‍🏫 Teacher applies for leave
exports.applyLeave = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.schoolId;
    const { fromDate, toDate, reason } = req.body;

    if (new Date(toDate) < new Date(fromDate)) {
      return res.status(400).json({ message: "'toDate' must be after or equal to 'fromDate'" });
    }

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

// 🧑‍🏫 Teacher views their own leave requests
exports.getMyLeaves = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const leaves = await LeaveRequest.find({ teacherId }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('getMyLeaves error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🧑‍💼 Admin views all leave requests for their school
exports.getAllLeaves = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const leaves = await LeaveRequest.find({ schoolId })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('getAllLeaves error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🧑‍💼 Admin views only pending leave requests
exports.getPendingLeaves = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const leaves = await LeaveRequest.find({
      schoolId,
      status: 'pending'
    })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    console.error('getPendingLeaves error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🧑‍💼 Admin approves or rejects a leave request
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

    if (status === 'approved') {
      const createdSubs = await generateSubstitutionsForLeave(
        leaveRequest.schoolId,
        leaveRequest.teacherId,
        leaveRequest.fromDate,
        leaveRequest.toDate
      );

      for (const sub of createdSubs) {
        const subTeacher = await User.findById(sub.substituteTeacherId);
        const slot = await ScheduleSlot.findById(sub.scheduleSlotId);
        if (subTeacher && slot) {
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

    await logAction({
      req,
      action: `leave_${status}`,
      targetId: leaveRequest._id,
      details: {
        comment: adminComment || '',
        fromDate: leaveRequest.fromDate,
        toDate: leaveRequest.toDate
      }
    });

    res.json({ message: `Leave request ${status}.`, leaveRequest });
  } catch (err) {
    console.error('updateLeaveStatus error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
