import { Router } from 'express';
import UAParser from 'ua-parser-js';
import { ensureReady } from '../db/mongo.js';

export const apiRouter = Router();

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

function extractUtm(q) {
  return {
    utm_source:   q.utm_source   || null,
    utm_medium:   q.utm_medium   || null,
    utm_campaign: q.utm_campaign || null,
    utm_content:  q.utm_content  || null,
    utm_term:     q.utm_term     || null,
  };
}

function parseUA(ua) {
  if (!ua) return { browser: null, os: null, device: null };
  const p = new UAParser(ua);
  return {
    browser: `${p.getBrowser().name || ''} ${p.getBrowser().version || ''}`.trim() || null,
    os:      `${p.getOS().name || ''} ${p.getOS().version || ''}`.trim() || null,
    device:  p.getDevice().type || 'desktop',
  };
}

function getReferrerDomain(ref) {
  if (!ref) return null;
  try { return new URL(ref).hostname.replace('www.', ''); } catch { return null; }
}

// --- Track a page view ---
apiRouter.post('/track/view', async (req, res) => {
  try {
    const { session_id, path, title, referrer, referrer_domain: refDomain } = req.body || {};
    if (!session_id || !path) return res.status(400).json({ error: 'session_id and path required' });

    const db = await ensureReady();
    const ua = parseUA(req.headers['user-agent']);
    const utm = extractUtm(req.body);
    const ref = refDomain || getReferrerDomain(referrer) || null;
    const now = new Date();

    // $inc on an upsert-insert starts from 0, so visit_count naturally lands
    // on 1 for a brand-new session and increments on every return visit.
    await db.collection('visitors').updateOne(
      { session_id },
      {
        $set: {
          last_visit: now,
          ip: getClientIp(req),
          user_agent: req.headers['user-agent'] || null,
          browser: ua.browser,
          os: ua.os,
          device: ua.device,
        },
        $setOnInsert: { session_id, first_visit: now },
        $inc: { visit_count: 1 },
      },
      { upsert: true }
    );

    await db.collection('page_views').insertOne({
      session_id,
      path,
      title: title || null,
      referrer: referrer || null,
      referrer_domain: ref,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      time_on_page: 0,
      is_bounce: 1,
      created_at: now,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[api] track/view failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// --- Track conversion (phone/WhatsApp click) ---
apiRouter.post('/track/click', async (req, res) => {
  try {
    const { session_id, type, page } = req.body || {};
    if (!session_id || !type) return res.status(400).json({ error: 'session_id and type required' });
    if (!['phone', 'whatsapp', 'call', 'form'].includes(type)) return res.status(400).json({ error: 'invalid type' });

    const db = await ensureReady();
    const utm = extractUtm(req.body);

    await db.collection('conversions').insertOne({
      session_id,
      type,
      page: page || null,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      created_at: new Date(),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[api] track/click failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// --- Update time on page (heartbeat) ---
apiRouter.post('/track/heartbeat', async (req, res) => {
  try {
    const { session_id, path, seconds } = req.body || {};
    if (!session_id || !path || seconds == null) return res.status(400).json({ error: 'missing fields' });

    const db = await ensureReady();
    await db.collection('page_views').findOneAndUpdate(
      { session_id, path },
      { $set: { time_on_page: Math.max(seconds, 0), is_bounce: 0 } },
      { sort: { _id: -1 } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('[api] track/heartbeat failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// --- Track bounce-off (user leaving page) ---
apiRouter.post('/track/bounce', async (req, res) => {
  try {
    const { session_id, path } = req.body || {};
    if (!session_id || !path) return res.status(400).json({ error: 'missing fields' });

    const db = await ensureReady();
    await db.collection('page_views').findOneAndUpdate(
      { session_id, path },
      { $set: { is_bounce: 1 } },
      { sort: { _id: -1 } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('[api] track/bounce failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});
