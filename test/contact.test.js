process.env.NODE_ENV = 'test';
process.env.SITE_URL = 'http://localhost:3000';
process.env.SMTP_USER = 'test@example.com';
process.env.CONTACT_TO = 'inbox@example.com';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../server');
const { createMessage } = require('../src/services/mailer');

const validRequest = {
  fullName: 'Dana Guest', email: 'guest@example.com', phone: '+1 555 0100',
  service: 'Petra Tour', destination: 'Petra', pickup: 'Amman', dropoff: 'Petra',
  travelDate: '2027-04-10', travelers: '2', flightNumber: '',
  message: 'We would like a private full-day trip to Petra.', consent: 'true', website: ''
};

test.beforeEach(() => {
  global.__TEST_TRANSPORT__ = { sendMail: async (message) => ({ accepted: [message.to], messageId: 'test-id' }) };
});

test('homepage renders', async () => {
  const response = await request(createApp()).get('/');
  assert.equal(response.status, 200);
  assert.match(response.text, /Explore Jordan in<br><em>Comfort and Style<\/em>/);
});

test('contact route validates required fields', async () => {
  const response = await request(createApp()).post('/api/contact').set('Origin', 'http://localhost:3000').send({});
  assert.equal(response.status, 422);
  assert.equal(response.body.ok, false);
  assert.ok(response.body.errors.some((error) => error.field === 'email'));
});

test('contact route rejects cross-site submissions', async () => {
  const response = await request(createApp()).post('/api/contact').set('Origin', 'https://malicious.example').send(validRequest);
  assert.equal(response.status, 403);
});

test('contact route sends with mocked transport', async () => {
  let captured;
  global.__TEST_TRANSPORT__ = { sendMail: async (message) => { captured = message; return { accepted: [message.to] }; } };
  const response = await request(createApp()).post('/api/contact').set('Origin', 'http://localhost:3000').send(validRequest);
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(captured.replyTo, validRequest.email);
  assert.equal(captured.from, process.env.SMTP_USER);
});

test('email HTML escapes visitor content', () => {
  const message = createMessage({ ...validRequest, fullName: '<script>alert(1)</script>' });
  assert.doesNotMatch(message.html, /<script>/);
  assert.match(message.html, /&lt;script&gt;/);
});
