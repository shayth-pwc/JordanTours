process.env.NODE_ENV = 'test';
process.env.SITE_URL = 'https://jordan-elite-test.netlify.app';

const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/app');

test('Netlify function renders the Express homepage', async () => {
  const response = await handler({
    httpMethod: 'GET',
    path: '/',
    rawUrl: 'https://jordan-elite-test.netlify.app/',
    headers: { host: 'jordan-elite-test.netlify.app' },
    requestContext: { identity: { sourceIp: '127.0.0.1' } }
  }, {});
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Jordan Elite/);
  assert.match(response.headers['content-type'], /text\/html/);
});

test('Netlify function accepts a valid same-origin contact request', async () => {
  global.__TEST_TRANSPORT__ = { sendMail: async () => ({ accepted: ['inbox@example.com'] }) };
  const response = await handler({
    httpMethod: 'POST',
    path: '/api/contact',
    rawUrl: 'https://jordan-elite-test.netlify.app/api/contact',
    headers: {
      host: 'jordan-elite-test.netlify.app',
      origin: 'https://jordan-elite-test.netlify.app',
      'x-forwarded-proto': 'https',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      fullName: 'Netlify Guest', email: 'guest@example.com', phone: '+962 79 000 0000',
      service: 'Petra Tour', destination: 'Petra', pickup: 'Amman', dropoff: 'Petra',
      travelDate: '2027-04-10', travelers: '2', flightNumber: '',
      message: 'Please send details for a private Petra tour.', consent: 'true', website: ''
    }),
    isBase64Encoded: false,
    requestContext: { identity: { sourceIp: '127.0.0.1' } }
  }, {});
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Your request has been sent/);
});
