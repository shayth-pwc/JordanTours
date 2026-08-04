const crypto = require('node:crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

function securityMiddleware(req, res, next) {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginResourcePolicy: { policy: 'same-origin' }
  })(req, res, next);
}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 3 : 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests. Please wait a few minutes or contact us on WhatsApp.' }
});

function sameOrigin(req, res, next) {
  const origin = req.get('origin');
  const siteUrl = (process.env.SITE_URL || process.env.URL || 'http://localhost:3000').replace(/\/$/, '');
  const forwardedProtocol = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const requestOrigin = `${forwardedProtocol || req.protocol}://${req.get('host')}`;
  const allowedOrigins = new Set([requestOrigin]);
  try { allowedOrigins.add(new URL(siteUrl).origin); } catch (error) { /* request origin remains the fail-safe */ }
  if (process.env.URL) {
    try { allowedOrigins.add(new URL(process.env.URL).origin); } catch (error) { /* ignore invalid platform value */ }
  }
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ ok: false, message: 'Request origin was not accepted.' });
  next();
}

module.exports = { securityMiddleware, contactLimiter, sameOrigin };
