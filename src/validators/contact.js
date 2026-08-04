const { body } = require('express-validator');

const serviceOptions = [
  'Airport Transfer', 'Border Transfer', 'Petra Tour', 'Wadi Rum Tour',
  'Jerash Tour', 'Aqaba Tour', 'Umm Qais Tour', 'Jordan Highlights Tour',
  'Private Driver', 'Custom Itinerary', 'Other'
];

const optionalText = (field, max) => body(field).trim().isLength({ max }).withMessage(`Must be ${max} characters or fewer.`);

const contactValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Please enter your full name.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('phone').trim().isLength({ min: 5, max: 40 }).withMessage('Please enter a valid phone or WhatsApp number.'),
  body('service').isIn(serviceOptions).withMessage('Please choose a requested service.'),
  optionalText('destination', 120), optionalText('pickup', 160), optionalText('dropoff', 160),
  body('travelDate').optional({ values: 'falsy' }).isISO8601().withMessage('Please enter a valid travel date.'),
  body('travelers').optional({ values: 'falsy' }).isInt({ min: 1, max: 200 }).withMessage('Travelers must be between 1 and 200.'),
  optionalText('flightNumber', 40),
  body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Please include at least 10 characters about your trip.'),
  body('consent').equals('true').withMessage('Please confirm that Jordan Elite may contact you.'),
  body('website').optional({ values: 'falsy' }).isEmpty().withMessage('Request could not be submitted.')
];

module.exports = { contactValidation, serviceOptions };
