import serverless from 'serverless-http';
import app from '../../admin/app.js';

// basePath strips the function's own URL prefix before handing the request
// path to Express, so the app's existing `/admin` and `/api` routers match
// unchanged regardless of being invoked through the Netlify redirect.
export const handler = serverless(app, { basePath: '/.netlify/functions/app' });
