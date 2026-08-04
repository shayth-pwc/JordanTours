const express = require('express');
const { validationResult, matchedData } = require('express-validator');
const { contactValidation } = require('../validators/contact');
const { sendContactEmail } = require('../services/mailer');
const { contactLimiter, sameOrigin } = require('../middleware/security');

const router = express.Router();

router.post('/', contactLimiter, sameOrigin, contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ ok: false, message: 'Please review the highlighted fields.', errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })) });
  }
  if (req.body.website) return res.status(200).json({ ok: true, message: 'Thank you. Your request has been sent to Jordan Elite. We will contact you using the details provided.' });
  try {
    await sendContactEmail(matchedData(req, { locations: ['body'] }));
    return res.json({ ok: true, message: 'Thank you. Your request has been sent to Jordan Elite. We will contact you using the details provided.' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error(`Contact email failed: ${error.message}`);
    return res.status(503).json({ ok: false, message: 'We could not send your request right now. Please try again or contact us on WhatsApp.' });
  }
});

module.exports = router;
