// ✅ Step 1: Mock nodemailer FIRST
jest.mock('nodemailer');

// ✅ Step 2: Import nodemailer and set up mock
const nodemailer = require('nodemailer');
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

// ✅ Step 3: NOW import the service AFTER the mock
const {
  sendLeaveStatusEmail,
  sendSubstitutionAssignedEmail
} = require('../src/services/notificationService');

// ✅ Step 4: Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// ✅ Step 5: Your tests
describe('NotificationService', () => {
  test('should send leave status email', async () => {
    await sendLeaveStatusEmail('test@test.com', 'John', 'approved', new Date(), new Date());
    expect(sendMailMock).toHaveBeenCalled(); // ✅ Should now pass
  });

  test('should send substitution assigned email', async () => {
    await sendSubstitutionAssignedEmail('test@test.com', 'John', {
      weekday: 'Monday',
      periodIndex: 2,
      subject: 'Math',
      classSection: '8A',
      dateString: '10/06/2025',
    });
    expect(sendMailMock).toHaveBeenCalled(); // ✅ Should now pass
  });
});
