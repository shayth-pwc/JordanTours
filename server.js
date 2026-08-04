require('dotenv').config();
const path = require('node:path');
const express = require('express');
const compression = require('compression');
const contactRouter = require('./src/routes/contact');
const { securityMiddleware } = require('./src/middleware/security');
const { verifyTransport } = require('./src/services/mailer');

function createApp() {
  const app = express();
  const siteUrl = (process.env.SITE_URL || process.env.URL || 'http://localhost:3000').replace(/\/$/, '');
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(securityMiddleware);
  app.use(compression());
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0, etag: true }));

  app.get('/', (req, res) => res.render('index', { page: 'home', siteUrl, title: 'Jordan Elite | Private Tours and Transportation in Jordan' }));
  app.get('/privacy', (req, res) => res.render('privacy', { page: 'privacy', siteUrl, title: 'Privacy Notice | Jordan Elite' }));
  app.get('/terms', (req, res) => res.render('terms', { page: 'terms', siteUrl, title: 'Terms | Jordan Elite' }));
  app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`));
  app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url><url><loc>${siteUrl}/privacy</loc></url><url><loc>${siteUrl}/terms</loc></url></urlset>`));
  app.use('/api/contact', contactRouter);
  app.use((req, res) => res.status(404).render('error', { page: 'error', siteUrl, title: 'Page Not Found | Jordan Elite', status: 404 }));
  app.use((error, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') console.error(error);
    res.status(500).render('error', { page: 'error', siteUrl, title: 'Something Went Wrong | Jordan Elite', status: 500 });
  });
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, () => {
    console.info(`Jordan Elite is running at http://localhost:${port}`);
    verifyTransport();
  });
}

module.exports = { createApp };
