const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const ScheduleSlot = require('../src/models/ScheduleSlot');
const jwt = require('jsonwebtoken');

let adminToken, teacherToken, teacherId, schoolId;

const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
};

beforeEach(async () => {
  const school = new mongoose.Types.ObjectId();
  schoolId = school;

  const teacher = await User.create({
    name: 'Teacher T',
    email: 'teacher@example.com',
    role: 'teacher',
    schoolId,
    password: 'Test@1234', // ✅ add this
  });
  teacherId = teacher._id;

  const admin = await User.create({
    name: 'Admin A',
    email: 'admin@example.com',
    role: 'admin',
    schoolId,
    password: 'Test@1234', // ✅ add this too
  });

  teacherToken = generateToken(teacher);
  adminToken = generateToken(admin);
});


describe('ScheduleSlot API', () => {
  let slotId;

  test('Admin can assign a schedule slot', async () => {
    const res = await request(app)
      .post('/api/schedules/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        teacherId,
        weekday: 1,
        periodIndex: 2,
        subject: 'Math',
        classSection: '9A',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.slot.teacherId).toBe(String(teacherId));
    slotId = res.body.slot._id;
  });

  test('Teacher can view own schedule', async () => {
    // Pre-create a slot
    await ScheduleSlot.create({
      teacherId,
      schoolId,
      weekday: 2,
      periodIndex: 3,
      subject: 'Science',
      classSection: '10A',
    });

    const res = await request(app)
      .get('/api/schedules/mine')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.schedule.length).toBeGreaterThan(0);
  });

  test('Admin can view any teacher\'s schedule', async () => {
    const res = await request(app)
      .get(`/api/schedules/teacher/${teacherId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('Admin can edit a schedule slot', async () => {
    const slot = await ScheduleSlot.create({
      teacherId,
      schoolId,
      weekday: 3,
      periodIndex: 1,
      subject: 'English',
      classSection: '6B',
    });

    const res = await request(app)
      .put(`/api/schedules/${slot._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        subject: 'History',
        classSection: '6A',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.slot.subject).toBe('History');
  });

  test('Admin can delete a schedule slot', async () => {
    const slot = await ScheduleSlot.create({
      teacherId,
      schoolId,
      weekday: 5,
      periodIndex: 4,
      subject: 'Physics',
      classSection: '8C',
    });

    const res = await request(app)
      .delete(`/api/schedules/${slot._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const check = await ScheduleSlot.findById(slot._id);
    expect(check).toBeNull();
  });

  test('Should block duplicate slot assignment for same teacher/period/day', async () => {
    await ScheduleSlot.create({
      teacherId,
      schoolId,
      weekday: 1,
      periodIndex: 2,
      subject: 'Biology',
      classSection: '7B',
    });

    const res = await request(app)
      .post('/api/schedules/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        teacherId,
        weekday: 1,
        periodIndex: 2,
        subject: 'Chemistry',
        classSection: '7A',
      });

    expect(res.statusCode).toBe(400);
  });
});
