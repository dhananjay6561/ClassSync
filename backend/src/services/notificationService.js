const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // true if port is 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html - HTML content
 */
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"AutoSubstitute System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} ‒ Subject: ${subject}`);
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err);
  }
}

/**
 * Notify teacher about leave status update
 * @param {string} teacherEmail
 * @param {string} teacherName
 * @param {string} status - 'approved' or 'rejected'
 * @param {Date} fromDate
 * @param {Date} toDate
 * @param {string} adminComment (optional)
 */
async function sendLeaveStatusEmail(teacherEmail, teacherName, status, fromDate, toDate, adminComment = '') {
  const subject = `Your leave has been ${status}`;
  const formattedFrom = new Date(fromDate).toLocaleDateString();
  const formattedTo = new Date(toDate).toLocaleDateString();
  const html = `
    <p>Hi ${teacherName},</p>
    <p>Your leave request from <strong>${formattedFrom}</strong> to <strong>${formattedTo}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
    ${adminComment ? `<p><em>Admin Comment:</em> ${adminComment}</p>` : ''}
    <p>Regards,<br/>AutoSubstitute Team</p>
  `;
  await sendEmail(teacherEmail, subject, html);
}

/**
 * Notify substitute teacher about assignment
 * @param {string} substituteEmail
 * @param {string} substituteName
 * @param {object} slotDetails - { weekday, periodIndex, subject, classSection, dateString }
 */
async function sendSubstitutionAssignedEmail(substituteEmail, substituteName, slotDetails) {
  const { weekday, periodIndex, subject, classSection, dateString } = slotDetails;
  const subjectLine = `You’ve been assigned as substitute on ${weekday}, Period ${periodIndex + 1}`;
const html = `
  <p>Hi ${teacherName},</p>
  <p>We wanted to inform you that your leave request from <strong>${formattedFrom}</strong> to <strong>${formattedTo}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
  ${adminComment ? `<p><strong>Note from Admin:</strong> ${adminComment}</p>` : ''}
  <p>If you have any questions, feel free to reach out.</p>
  <p>Best regards,<br/>AutoSubstitute Team</p>
`;

  await sendEmail(substituteEmail, subjectLine, html);
}

module.exports = {
  sendLeaveStatusEmail,
  sendSubstitutionAssignedEmail,
};
// This module provides functions to send email notifications related to leave requests and substitutions.
// It uses Nodemailer to send emails and includes functions for notifying teachers about leave status updates
// and for notifying substitute teachers about their assignments.
// It exports functions to send leave status emails and substitution assignment emails.
// The `sendEmail` function is a utility to send emails using the configured SMTP transporter.
// The `sendLeaveStatusEmail` function formats and sends an email to a teacher about the status of their leave request.
// The `sendSubstitutionAssignedEmail` function formats and sends an email to a substitute teacher about their assignment details.
// The email content is customizable, including teacher names, leave dates, and substitution details.
// The module uses environment variables for email configuration, ensuring sensitive information is not hard-coded.
// The email notifications help keep teachers informed about their leave requests and substitution assignments,