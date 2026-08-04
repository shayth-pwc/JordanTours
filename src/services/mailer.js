const nodemailer = require('nodemailer');
const escapeHtml = require('../utils/escapeHtml');

let transporter;
let smtpReady = false;

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_PASS.includes('replace_'));
}

function createTransport() {
  if (!hasSmtpConfig()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function verifyTransport() {
  if (process.env.NODE_ENV === 'test') return;
  transporter = createTransport();
  if (!transporter) {
    console.warn('SMTP is not configured. The public site will run, but contact email is unavailable.');
    return;
  }
  try {
    await transporter.verify();
    smtpReady = true;
    console.info('SMTP connection verified.');
  } catch (error) {
    smtpReady = false;
    console.error(`SMTP verification failed: ${error.message}`);
  }
}

function createMessage(data) {
  const submittedAt = new Date().toISOString();
  const fields = [
    ['Full name', data.fullName], ['Email', data.email], ['Phone / WhatsApp', data.phone],
    ['Requested service', data.service], ['Destination or tour', data.destination],
    ['Pickup location', data.pickup], ['Drop-off location', data.dropoff],
    ['Travel date', data.travelDate], ['Number of travelers', data.travelers],
    ['Flight number', data.flightNumber], ['Message / itinerary', data.message],
    ['Consent to contact', 'Yes'], ['Submitted at', submittedAt]
  ];
  const text = fields.map(([label, value]) => `${label}: ${value || 'Not provided'}`).join('\n');
  const html = `<h1>New Jordan Elite request</h1><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">${fields.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value || 'Not provided')}</td></tr>`).join('')}</table>`;
  return {
    from: process.env.SMTP_USER,
    to: process.env.CONTACT_TO || 'jordanelite26@yahoo.com',
    replyTo: data.email,
    subject: `New Jordan Elite tour request – ${data.fullName.replace(/[\r\n]/g, ' ')}`,
    text,
    html
  };
}

async function sendContactEmail(data) {
  if (process.env.NODE_ENV === 'test' && global.__TEST_TRANSPORT__) {
    return global.__TEST_TRANSPORT__.sendMail(createMessage(data));
  }
  if (!transporter) transporter = createTransport();
  if (!transporter || !smtpReady) throw new Error('SMTP_UNAVAILABLE');
  return transporter.sendMail(createMessage(data));
}

module.exports = { verifyTransport, sendContactEmail, createMessage };
