// /tests/leave.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const LeaveRequest = require('../src/models/LeaveRequest');
const jwt = require('jsonwebtoken');

// Helper to get JWT
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
};

describe('Leave API Tests', () => {
  let teacherToken, adminToken, teacherId;

  const mongoose = require('mongoose');

beforeEach(async () => {
  const validSchoolId = new mongoose.Types.ObjectId();

  await User.create({
    name: 'Test Teacher',
    email: 'teacher@test.com',
    role: 'teacher',
    schoolId: validSchoolId,
    password: 'testpassword123',  // Add password if schema requires it
  });
});


  it('should allow teacher to apply for leave', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        fromDate: '2025-06-10',
        toDate: '2025-06-12',
        reason: 'Personal',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.leave.teacherId).toBe(String(teacherId));
  });

  it('should allow admin to approve leave', async () => {
    const leave = await LeaveRequest.create({
      teacherId,
      schoolId: 'school123',
      fromDate: new Date('2025-06-10'),
      toDate: new Date('2025-06-12'),
      reason: 'Test',
    });

    const res = await request(app)
      .patch(`/api/leaves/${leave._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.leaveRequest.status).toBe('approved');
  });
});
