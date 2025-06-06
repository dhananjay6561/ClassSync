// At the very top, before anything else:
jest.mock('nodemailer');

const nodemailer = require('nodemailer');
const { sendLeaveStatusEmail, sendSubstitutionAssignedEmail } = require('../src/services/notificationService');

const sendMailMock = jest.fn();

beforeAll(() => {
  nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationService', () => {

  test('should send leave status email', async () => {
    await sendLeaveStatusEmail('test@test.com', 'John', 'approved', new Date(), new Date());
    expect(sendMailMock).toHaveBeenCalled();
  });

  test('should send substitution assigned email', async () => {
    await sendSubstitutionAssignedEmail('test@test.com', 'John', {
      weekday: 'Monday',
      periodIndex: 2,
      subject: 'Math',
      classSection: '8A',
      dateString: '10/06/2025',
    });
    expect(sendMailMock).toHaveBeenCalled();
  });

});
