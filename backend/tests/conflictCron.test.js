const { runConflictCheck } = require('../src/schedulers/conflictCron');
const School = require('../src/models/School');
const User = require('../src/models/User');
const conflictEngine = require('../src/services/conflictEngine');
const notificationService = require('../src/services/notificationService');

// Mock the required modules
jest.mock('../src/models/School');
jest.mock('../src/models/User');
jest.mock('../src/services/conflictEngine');
jest.mock('../src/services/notificationService');

describe('Conflict Cron Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should run conflict check for all schools and email admins', async () => {
    // Fake data
    const mockSchools = [{ _id: 'school1', name: 'Alpha School' }];
    const mockAdmins = [
      { email: 'admin1@test.com', name: 'Admin One', schoolId: 'school1', role: 'admin' },
      { email: 'admin2@test.com', name: 'Admin Two', schoolId: 'school1', role: 'admin' }
    ];

    const mockConflicts = {
      overloadWarnings: [{ teacherName: 'Mr. Y', weekday: 2, lectureCount: 8 }],
      uncoveredSlots: [{ classSection: '9A', subject: 'Science', weekday: 2, periodIndex: 3 }]
    };

    // Mock return values
    School.find.mockResolvedValue(mockSchools);
    User.find.mockResolvedValue(mockAdmins);
    conflictEngine.detectConflicts.mockResolvedValue(mockConflicts);

    // Execute the cron logic manually
    await runConflictCheck();

    // Assertions
    expect(School.find).toHaveBeenCalledTimes(1);
    expect(conflictEngine.detectConflicts).toHaveBeenCalledWith('school1');
    expect(User.find).toHaveBeenCalledWith({ schoolId: 'school1', role: 'admin' });

    // Ensure emails sent to all admins
    expect(notificationService.sendConflictSummaryEmail).toHaveBeenCalledTimes(2);
    expect(notificationService.sendConflictSummaryEmail).toHaveBeenCalledWith(
      'admin1@test.com', 'Admin One', 'Alpha School', mockConflicts
    );
    expect(notificationService.sendConflictSummaryEmail).toHaveBeenCalledWith(
      'admin2@test.com', 'Admin Two', 'Alpha School', mockConflicts
    );
  });
});
