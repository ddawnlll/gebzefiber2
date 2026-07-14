import express from 'express';
import { join } from 'path';
import ejs from 'ejs';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/api.js';
import { adminRouter } from './routes/admin.js';

// Resolved from process.cwd() rather than import.meta.url: Netlify's esbuild
// bundler can emit this file as CJS, where import.meta.url is empty. cwd() is
// the repo root both locally (run from the project dir) and in the deployed
// function (Netlify's `included_files` preserves the repo-relative layout
// under /var/task), so this works identically in both places.
const ADMIN_DIR = join(process.cwd(), 'admin');

const app = express();

// --- View engine ---
// Express normally resolves the ejs engine with a dynamic require() based on
// the view's file extension, which esbuild's static bundler can't see — the
// deployed function would throw "Cannot find module 'ejs'" at render time.
// Registering it explicitly makes the import static so it gets bundled.
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', join(ADMIN_DIR, 'views'));

// --- Middleware ---
app.use(cookieParser());
// sendBeacon (used for the page-leave heartbeat) posts as text/plain, not
// application/json — accept both so that ping isn't silently dropped.
app.use(express.json({ limit: '10kb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: false }));

// CORS — allow the static site to call the tracking API
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'https://gebze-fiber-tamir.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8888',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8888',
  ];
  if (origin && (allowed.includes(origin) || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Static files for admin panel CSS/JS
app.use('/admin/assets', express.static(join(ADMIN_DIR, 'public')));

// Rate limit tracking endpoints (100 req/min per IP — generous for a business site)
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' },
});
app.use('/api/track', trackingLimiter);

// --- Routes ---
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
