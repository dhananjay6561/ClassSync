const mongoose = require('mongoose');
const AuditLog = require('../src/models/AuditLog');
const { logAction } = require('../src/utils/auditLogger');

describe('Audit Logger Utility', () => {
  let mockReq, schoolId, userId;

  beforeAll(async () => {
    schoolId = new mongoose.Types.ObjectId();
    userId = new mongoose.Types.ObjectId();

    mockReq = {
      user: {
        _id: userId,
        role: 'admin',
        email: 'admin@test.com'
      },
      schoolId
    };
  });

  afterEach(async () => {
    await AuditLog.deleteMany({});
  });

  test('should create a valid audit log entry', async () => {
    await logAction({
      req: mockReq,
      action: 'test_action',
      targetId: new mongoose.Types.ObjectId(),
      details: { testKey: 'testValue' }
    });

    const logs = await AuditLog.find({});
    expect(logs.length).toBe(1);
    const log = logs[0];
    expect(log.userId.toString()).toBe(userId.toString());
    expect(log.schoolId.toString()).toBe(schoolId.toString());
    expect(log.action).toBe('test_action');
    expect(log.details.testKey).toBe('testValue');
  });

  test('should not throw if audit log fails silently', async () => {
    const brokenReq = { ...mockReq, user: null };

    // console.error should still be called
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await logAction({
      req: brokenReq,
      action: 'fail_action'
    });

    const logs = await AuditLog.find({});
    expect(logs.length).toBe(0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
