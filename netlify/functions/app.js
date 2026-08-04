const serverless = require('serverless-http');
const { createApp } = require('../../server');
const { verifyTransport } = require('../../src/services/mailer');

const app = createApp();
const expressHandler = serverless(app);
let smtpInitialization;

exports.handler = async (event, context) => {
  if (!smtpInitialization) smtpInitialization = verifyTransport();
  await smtpInitialization;
  return expressHandler(event, context);
};
