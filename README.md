# Jordan Elite

A production-oriented single-page website for Jordan Elite’s private tours and transportation services in Jordan. It uses Node.js, Express, EJS, vanilla JavaScript, modern CSS, Nodemailer, server-side validation, Helmet, and route-specific rate limiting. No database or front-end build step is required.

## Requirements

- Node.js 20 or newer
- npm
- A Yahoo Mail app password for live contact-form delivery

## Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. For production, set the environment variables on the hosting provider and run:

```bash
npm start
```

`npm run check` performs JavaScript syntax checks. `npm test` runs the validation, same-origin, escaped-email, and mocked-email route tests.

## Environment configuration

Copy `.env.example` to an untracked `.env` and update its values. Never commit `.env` or paste credentials into browser code. `SITE_URL` must exactly match the public origin, including `https://` in production, because it is used for canonical metadata and same-origin form protection.

Yahoo Mail normally requires an app password rather than the account’s normal password. Create an app password in the Yahoo account security settings and use it as `SMTP_PASS`. Keep `SMTP_USER` as the authenticated Yahoo account. The email uses that account as `From` and the visitor’s address as `Reply-To` to improve delivery reliability.

At startup, the server verifies SMTP in the background. If SMTP is unavailable, the public website remains online and the form returns a friendly retry/WhatsApp message. Development logs contain the SMTP error message but never the password.

## Logo setup

The requested source logo was not available at `/mnt/data/a_clean_high_contrast_logo_graphic_on_a_solid_bla.png` during the build. A neutral temporary JE shield is installed so the layout never shows a broken image. Before launch, replace this file with the supplied official logo, preserving the filename:

`public/images/jordan-elite-logo.png`

Use a transparent or black-background PNG with enough resolution for crisp display (roughly 400 px wide is recommended). No template changes are needed.

## Image sources and licenses

All destination photography is stored locally. The images below were downloaded from Wikimedia Commons on 4 August 2026. Review the linked file page for full attribution and the specific free-license terms before publication. The build resizes images through Wikimedia’s thumbnail service without removing embedded metadata.

- Petra hero and destination — [The Treasury, Petra, Jordan1.jpg](https://commons.wikimedia.org/wiki/File:The_Treasury,_Petra,_Jordan1.jpg)
- Wadi Rum — [Wadi Rum, Jordan, Infinite spaces.jpg](https://commons.wikimedia.org/wiki/File:Wadi_Rum,_Jordan,_Infinite_spaces.jpg)
- Jerash — [Jordan, Jerash, Ruins with Zeus Temple; DSCN0796.jpg](https://commons.wikimedia.org/wiki/File:Jordan,_Jerash,_Ruins_with_Zeus_Temple;_DSCN0796.jpg)
- Aqaba — [Red sea- Aqaba.jpg](https://commons.wikimedia.org/wiki/File:Red_sea-_Aqaba.jpg)
- Umm Qais — [Umm Qais-13.jpg](https://commons.wikimedia.org/wiki/File:Umm_Qais-13.jpg)
- Airport transfer setting — [Outside Queen Alia International Airport, Amman.jpg](https://commons.wikimedia.org/wiki/File:Outside_Queen_Alia_International_Airport,_Amman.jpg)

The airport image represents the pickup setting; it does not claim a particular vehicle fleet. Replace any image with a properly licensed local JPEG using the same filename to keep templates unchanged.

## Contact-form testing

1. Run `npm test` to test a successful submission using the mocked Nodemailer transport. No external email is sent.
2. Start the server without SMTP credentials and submit the form to verify the friendly unavailable state.
3. Add valid Yahoo SMTP credentials, restart, confirm `SMTP connection verified.` in the server output, and submit a controlled test request.
4. Confirm receipt before claiming live email delivery. This repository build does not claim that Yahoo delivery was verified without valid credentials.

If Yahoo authentication fails, confirm that the account address is correct, an app password is being used, `SMTP_PORT=465`, and `SMTP_SECURE=true`. Revoke and regenerate the app password if it may have been exposed.

## Security notes

- Helmet sets a restrictive Content Security Policy and other response headers.
- `POST /api/contact` is limited to five requests per IP per 15 minutes in normal operation.
- JSON and form bodies are limited to 50 KB.
- Fields are trimmed, allow-listed, length-limited, and validated on the server.
- A hidden honeypot, same-origin check, HTML escaping, safe production errors, and duplicate-submit prevention are included.
- Complete personal information is not logged.
- Run `npm audit` regularly and keep dependencies current.

## Deployment

Deploy to any Node.js 20+ host. Configure `PORT` if required by the provider, set `NODE_ENV=production`, set `SITE_URL` to the final HTTPS origin, and provide SMTP variables through the host’s secret manager. Terminate TLS at the hosting platform or reverse proxy. The application trusts one proxy hop for correct client IP rate limiting.

Static files use compression and production cache headers. For a multi-instance deployment, replace the default in-memory rate-limit store with a shared store.

### Netlify

The repository includes `netlify.toml` and `netlify/functions/app.js`. Netlify serves files under `public/` directly and rewrites application routes to an Express-compatible Netlify Function.

In **Project configuration → Environment variables**, add the following variables and make them available to Functions. Do not put the real password in `netlify.toml` or commit it in `.env`.

```text
NODE_ENV=production
SITE_URL=https://your-final-domain.example
CONTACT_TO=jordanelite26@yahoo.com
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=jordanelite26@yahoo.com
SMTP_PASS=your_yahoo_app_password
```

If `SITE_URL` is omitted, the application uses Netlify’s built-in `URL` value. Setting it explicitly is recommended when using a custom domain. Trigger a new deploy after changing environment variables; runtime variables are not updated in an already-published function instance.
