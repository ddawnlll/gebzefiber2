import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { ensureReady, TR_OFFSET_MS } from '../db/mongo.js';
import { requireAuth, createToken } from '../middleware/auth.js';

export const adminRouter = Router();

/* ============================================================
   Date-range handling
   Timestamps are stored as UTC Date objects; day/hour grouping is
   bucketed in the Europe/Istanbul timezone (fixed UTC+3, no DST)
   so the panel matches the business's local clock. Range keys are
   whitelisted below — no user input reaches a query unescaped.
   ============================================================ */
const TZ = 'Europe/Istanbul';
const RANGE_LABELS = { today: 'Bugün', '7d': 'Son 7 gün', '30d': 'Son 30 gün', '90d': 'Son 90 gün' };

function trDayStart(date) {
  const t = new Date(date.getTime() + TR_OFFSET_MS);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) - TR_OFFSET_MS);
}

function rangeOf(req) {
  const key = Object.hasOwn(RANGE_LABELS, req.query.range || '') ? req.query.range : '7d';
  const now = new Date();
  if (key === 'today') {
    const curStart = trDayStart(now);
    const curEnd = new Date(curStart.getTime() + 86400000);
    return { key, label: RANGE_LABELS[key], curStart, curEnd, prevStart: new Date(curStart.getTime() - 86400000), prevEnd: curStart, days: 1, unit: 'hour' };
  }
  const days = { '7d': 7, '30d': 30, '90d': 90 }[key] || 7;
  const curEnd = now;
  const curStart = new Date(now.getTime() - days * 86400000);
  return { key, label: RANGE_LABELS[key], curStart, curEnd, prevStart: new Date(curStart.getTime() - days * 86400000), prevEnd: curStart, days, unit: 'day' };
}

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function lastNDates(n) {
  const t0 = new Date(Date.now() + TR_OFFSET_MS);
  const y = t0.getUTCFullYear(), m = t0.getUTCMonth(), d = t0.getUTCDate();
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const t = new Date(Date.UTC(y, m, d - i));
    const key = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
    out.push({ key, label: `${t.getUTCDate()} ${MONTHS_TR[t.getUTCMonth()]}` });
  }
  return out;
}

function fmtAgo(seconds) {
  if (seconds < 60) return 'az önce';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} sa önce`;
  return `${Math.floor(seconds / 86400)} gün önce`;
}

function delta(cur, prev) {
  if (prev > 0) return Math.round(((cur - prev) / prev) * 100);
  return cur > 0 ? null : 0;
}

function convRate(conversions, uniques) {
  return uniques > 0 ? +((conversions / uniques) * 100).toFixed(1) : 0;
}

function toScriptJson(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

const SEARCH_KEYS = ['google', 'bing', 'yandex', 'duckduckgo', 'baidu', 'ecosia'];
const SOCIAL_KEYS = ['facebook', 'instagram', 'twitter', 'x.com', 't.co', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'telegram', 'nextdoor'];

function bucketOf(source) {
  const s = String(source || 'direct').toLowerCase();
  if (s === 'direct') return 'direct';
  if (SEARCH_KEYS.some((k) => s.includes(k))) return 'search';
  if (SOCIAL_KEYS.some((k) => s.includes(k))) return 'social';
  return 'referral';
}

const sourceExpr = { $ifNull: ['$utm_source', { $ifNull: ['$referrer_domain', 'direct'] }] };

async function liveCount(db) {
  const rows = await db.collection('page_views').aggregate([
    { $match: { created_at: { $gte: new Date(Date.now() - 30 * 60000) } } },
    { $project: { session_id: 1, endsAt: { $add: ['$created_at', { $multiply: [{ $ifNull: ['$time_on_page', 0] }, 1000] }] } } },
    { $match: { endsAt: { $gte: new Date(Date.now() - 5 * 60000) } } },
    { $group: { _id: '$session_id' } },
    { $count: 'c' },
  ]).toArray();
  return rows[0]?.c || 0;
}

/* ============================================================
   Auth
   ============================================================ */
adminRouter.get('/login', (req, res) => {
  if (req.cookies?.token) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

adminRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.render('admin/login', { error: 'Kullanıcı adı ve şifre gerekli' });
  }
  try {
    const db = await ensureReady();
    const user = await db.collection('admin_users').findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.render('admin/login', { error: 'Hatalı kullanıcı adı veya şifre' });
    }
    const token = createToken({ id: user._id.toString(), username: user.username });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/admin');
  } catch (err) {
    console.error('[admin] login failed', err);
    res.render('admin/login', { error: 'Sunucu hatası, tekrar deneyin' });
  }
});

adminRouter.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
});

adminRouter.use(requireAuth);

/* Live visitor count — polled by the sidebar every 30s. */
adminRouter.get('/api/live', async (req, res) => {
  const db = await ensureReady();
  res.json({ live: await liveCount(db) });
});

/* ============================================================
   Dashboard
   ============================================================ */
adminRouter.get('/', async (req, res) => {
  const db = await ensureReady();
  const r = rangeOf(req);

  async function kpisFor(start, end) {
    const [pvAgg] = await db.collection('page_views').aggregate([
      { $match: { created_at: { $gte: start, $lt: end } } },
      { $group: { _id: null, views: { $sum: 1 }, uniques: { $addToSet: '$session_id' } } },
      { $project: { _id: 0, views: 1, uniques: { $size: '$uniques' } } },
    ]).toArray();
    const conversions = await db.collection('conversions').countDocuments({ created_at: { $gte: start, $lt: end } });
    const views = pvAgg?.views || 0;
    const uniques = pvAgg?.uniques || 0;
    return { views, uniques, conversions, rate: convRate(conversions, uniques) };
  }

  const [now, before] = await Promise.all([
    kpisFor(r.curStart, r.curEnd),
    kpisFor(r.prevStart, r.prevEnd),
  ]);

  const kpis = {
    uniques: { value: now.uniques, delta: delta(now.uniques, before.uniques) },
    views: { value: now.views, delta: delta(now.views, before.views) },
    conversions: { value: now.conversions, delta: delta(now.conversions, before.conversions) },
    rate: { value: now.rate, delta: delta(now.rate, before.rate) },
  };

  /* Time series for the big chart + sparklines */
  let labels, keys, dateFmt;
  if (r.unit === 'hour') {
    keys = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
    labels = keys.map((h) => `${h}:00`);
    dateFmt = '%H';
  } else {
    const days = lastNDates(r.days);
    keys = days.map((d) => d.key);
    labels = days.map((d) => d.label);
    dateFmt = '%Y-%m-%d';
  }

  async function seriesFor(collection, uniqueSessions) {
    const rows = await db.collection(collection).aggregate([
      { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd } } },
      { $group: {
        _id: { $dateToString: { format: dateFmt, date: '$created_at', timezone: TZ } },
        count: { $sum: 1 },
        sessions: { $addToSet: '$session_id' },
      } },
    ]).toArray();
    const map = new Map(rows.map((row) => [row._id, uniqueSessions ? row.sessions.length : row.count]));
    return keys.map((k) => map.get(k) || 0);
  }

  const [viewsSeries, uniquesSeries, convSeries] = await Promise.all([
    seriesFor('page_views', false),
    seriesFor('page_views', true),
    seriesFor('conversions', false),
  ]);
  const rateSeries = uniquesSeries.map((u, i) => (u > 0 ? +((convSeries[i] / u) * 100).toFixed(1) : 0));

  /* Day-of-week × hour heatmap, always last 30 days */
  const heatRows = await db.collection('page_views').aggregate([
    { $match: { created_at: { $gte: new Date(Date.now() - 30 * 86400000) } } },
    { $group: {
      _id: {
        dow: { $dayOfWeek: { date: '$created_at', timezone: TZ } },
        h: { $hour: { date: '$created_at', timezone: TZ } },
      },
      v: { $sum: 1 },
    } },
  ]).toArray();
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const row of heatRows) {
    const sqliteDow = row._id.dow - 1; // Mongo $dayOfWeek: 1=Sun..7=Sat -> 0=Sun..6=Sat
    const day = (sqliteDow + 6) % 7; // rotate to Mon..Sun rows
    heat[day][row._id.h] = row.v;
  }

  const convTypesRaw = await db.collection('conversions').aggregate([
    { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd } } },
    { $group: { _id: '$type', c: { $sum: 1 } } },
    { $sort: { c: -1 } },
  ]).toArray();
  const convTypes = convTypesRaw.map((x) => ({ type: x._id, c: x.c }));

  const [recentViews, recentConvs] = await Promise.all([
    db.collection('page_views').find({}, { projection: { path: 1, created_at: 1 } }).sort({ _id: -1 }).limit(12).toArray(),
    db.collection('conversions').find({}, { projection: { page: 1, type: 1, created_at: 1 } }).sort({ _id: -1 }).limit(12).toArray(),
  ]);
  const feed = [
    ...recentViews.map((v) => ({ kind: 'view', label: v.path, type: null, created_at: v.created_at })),
    ...recentConvs.map((c) => ({ kind: 'conversion', label: c.page || '/', type: c.type, created_at: c.created_at })),
  ]
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 12)
    .map((e) => ({ ...e, when: fmtAgo(Math.floor((Date.now() - e.created_at.getTime()) / 1000)) }));

  const topPagesRaw = await db.collection('page_views').aggregate([
    { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd } } },
    { $group: { _id: '$path', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: 6 },
  ]).toArray();
  const topPages = topPagesRaw.map((x) => ({ path: x._id, views: x.views }));

  const topSourcesRaw = await db.collection('page_views').aggregate([
    { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd } } },
    { $group: { _id: sourceExpr, visits: { $sum: 1 } } },
    { $sort: { visits: -1 } },
    { $limit: 6 },
  ]).toArray();
  const topSources = topSourcesRaw.map((x) => ({ source: x._id, visits: x.visits, bucket: bucketOf(x._id) }));

  res.render('admin/dashboard', {
    admin: req.admin, range: r, kpis, feed, topPages, topSources,
    live: await liveCount(db),
    payload: toScriptJson({ labels, views: viewsSeries, uniques: uniquesSeries, conversions: convSeries, rate: rateSeries, heat, convTypes }),
  });
});

/* ============================================================
   Traffic sources
   ============================================================ */
adminRouter.get('/sources', async (req, res) => {
  const db = await ensureReady();
  const r = rangeOf(req);

  const [rowsRaw, convRowsRaw, referrersRaw, campaignRowsRaw, campaignConvRaw] = await Promise.all([
    db.collection('page_views').aggregate([
      { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd } } },
      { $group: {
        _id: sourceExpr,
        visits: { $sum: 1 },
        uniques: { $addToSet: '$session_id' },
        engaged: { $sum: { $cond: [{ $eq: ['$is_bounce', 0] }, 1, 0] } },
        time_sum: { $sum: { $ifNull: ['$time_on_page', 0] } },
      } },
      { $project: {
        source: '$_id', visits: 1, uniques: { $size: '$uniques' }, engaged: 1,
        avg_time: { $cond: [{ $gt: ['$visits', 0] }, { $divide: ['$time_sum', '$visits'] }, 0] },
      } },
      { $sort: { visits: -1 } },
      { $limit: 50 },
    ]).toArray(),
    db.collection('conversions').aggregate([
      { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd } } },
      { $group: { _id: { $ifNull: ['$utm_source', 'direct'] }, c: { $sum: 1 } } },
    ]).toArray(),
    db.collection('page_views').aggregate([
      { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd }, referrer_domain: { $ne: null } } },
      { $group: { _id: '$referrer_domain', visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 12 },
    ]).toArray(),
    db.collection('page_views').aggregate([
      { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd }, utm_campaign: { $ne: null } } },
      { $group: {
        _id: { campaign: '$utm_campaign', source: { $ifNull: ['$utm_source', '-'] }, medium: { $ifNull: ['$utm_medium', '-'] } },
        visits: { $sum: 1 },
        uniques: { $addToSet: '$session_id' },
      } },
      { $project: { campaign: '$_id.campaign', source: '$_id.source', medium: '$_id.medium', visits: 1, uniques: { $size: '$uniques' } } },
      { $sort: { visits: -1 } },
      { $limit: 20 },
    ]).toArray(),
    db.collection('conversions').aggregate([
      { $match: { created_at: { $gte: r.curStart, $lt: r.curEnd }, utm_campaign: { $ne: null } } },
      { $group: { _id: '$utm_campaign', c: { $sum: 1 } } },
    ]).toArray(),
  ]);

  const convMap = Object.fromEntries(convRowsRaw.map((x) => [x._id, x.c]));
  const maxVisits = rowsRaw.length ? rowsRaw[0].visits : 0;
  const sources = rowsRaw.map((s) => ({
    source: s.source, visits: s.visits, uniques: s.uniques, engaged: s.engaged, avg_time: s.avg_time,
    bucket: bucketOf(s.source),
    conversions: convMap[s.source] || 0,
    rate: convRate(convMap[s.source] || 0, s.uniques),
    share: maxVisits > 0 ? Math.round((s.visits / maxVisits) * 100) : 0,
  }));

  const buckets = { search: { visits: 0, conversions: 0 }, social: { visits: 0, conversions: 0 }, referral: { visits: 0, conversions: 0 }, direct: { visits: 0, conversions: 0 } };
  for (const s of sources) {
    buckets[s.bucket].visits += s.visits;
    buckets[s.bucket].conversions += s.conversions;
  }

  const referrers = referrersRaw.map((x) => ({ domain: x._id, visits: x.visits }));

  const campaignConvMap = Object.fromEntries(campaignConvRaw.map((x) => [x._id, x.c]));
  const campaigns = campaignRowsRaw.map((c) => ({ ...c, conversions: campaignConvMap[c.campaign] || 0 }));

  res.render('admin/sources', { admin: req.admin, range: r, sources, buckets, referrers, campaigns });
});

/* ============================================================
   Visitors
   ============================================================ */
adminRouter.get('/visitors', async (req, res) => {
  const db = await ensureReady();
  const r = rangeOf(req);
  const cur = { last_visit: { $gte: r.curStart, $lt: r.curEnd } };

  async function bucketCount(field) {
    const rows = await db.collection('visitors').aggregate([
      { $match: cur },
      { $group: { _id: { $ifNull: [`$${field}`, 'desktop'] }, v: { $sum: 1 } } },
      { $sort: { v: -1 } },
    ]).toArray();
    return rows.map((x) => ({ k: x._id, v: x.v }));
  }

  async function familyBreakdown(field) {
    const rows = await db.collection('visitors').aggregate([
      { $match: cur },
      { $group: { _id: `$${field}`, v: { $sum: 1 } } },
    ]).toArray();
    const map = new Map();
    for (const row of rows) {
      const family = String(row._id || 'Bilinmiyor').replace(/[\d.\s]+$/, '').trim() || 'Bilinmiyor';
      map.set(family, (map.get(family) || 0) + row.v);
    }
    return [...map.entries()].map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 8);
  }

  const [totalsAgg, devices, browsers, systems, visitors] = await Promise.all([
    db.collection('visitors').aggregate([
      { $match: cur },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        fresh: { $sum: { $cond: [{ $lte: ['$visit_count', 1] }, 1, 0] } },
        returning_count: { $sum: { $cond: [{ $gt: ['$visit_count', 1] }, 1, 0] } },
      } },
    ]).toArray(),
    bucketCount('device'),
    familyBreakdown('browser'),
    familyBreakdown('os'),
    db.collection('visitors').find(cur).sort({ last_visit: -1 }).limit(25).toArray(),
  ]);
  const totals = totalsAgg[0] || { total: 0, fresh: 0, returning_count: 0 };

  const sessionIds = visitors.map((v) => v.session_id);
  const [firstViews, viewStats, convCounts] = sessionIds.length
    ? await Promise.all([
      db.collection('page_views').aggregate([
        { $match: { session_id: { $in: sessionIds } } },
        { $sort: { _id: 1 } },
        { $group: { _id: '$session_id', entry: { $first: '$path' }, source: { $first: sourceExpr } } },
      ]).toArray(),
      db.collection('page_views').aggregate([
        { $match: { session_id: { $in: sessionIds } } },
        { $group: { _id: '$session_id', views: { $sum: 1 }, total_time: { $sum: { $ifNull: ['$time_on_page', 0] } } } },
      ]).toArray(),
      db.collection('conversions').aggregate([
        { $match: { session_id: { $in: sessionIds } } },
        { $group: { _id: '$session_id', c: { $sum: 1 } } },
      ]).toArray(),
    ])
    : [[], [], []];

  const firstMap = Object.fromEntries(firstViews.map((x) => [x._id, x]));
  const statMap = Object.fromEntries(viewStats.map((x) => [x._id, x]));
  const convMap = Object.fromEntries(convCounts.map((x) => [x._id, x.c]));

  const sessions = visitors.map((v) => {
    const f = firstMap[v.session_id] || {};
    const s = statMap[v.session_id] || { views: 0, total_time: 0 };
    const ago = Math.floor((Date.now() - v.last_visit.getTime()) / 1000);
    const source = f.source || 'direct';
    return {
      session_id: v.session_id, device: v.device, browser: v.browser, os: v.os,
      visit_count: v.visit_count, last_visit: v.last_visit,
      entry: f.entry || '/', source, views: s.views, total_time: s.total_time,
      conversions: convMap[v.session_id] || 0, when: fmtAgo(ago), bucket: bucketOf(source),
    };
  });

  res.render('admin/visitors', { admin: req.admin, range: r, totals, devices, browsers, systems, sessions });
});

/* ============================================================
   Pages
   ============================================================ */
adminRouter.get('/pages', async (req, res) => {
  const db = await ensureReady();
  const r = rangeOf(req);
  const cur = { created_at: { $gte: r.curStart, $lt: r.curEnd } };

  const [rows, convRows] = await Promise.all([
    db.collection('page_views').aggregate([
      { $match: cur },
      { $group: {
        _id: '$path',
        title: { $last: '$title' },
        views: { $sum: 1 },
        uniques: { $addToSet: '$session_id' },
        time_sum: { $sum: { $ifNull: ['$time_on_page', 0] } },
        bounce_sum: { $sum: '$is_bounce' },
      } },
      { $project: {
        path: '$_id', title: 1, views: 1, uniques: { $size: '$uniques' },
        avg_time: { $cond: [{ $gt: ['$views', 0] }, { $divide: ['$time_sum', '$views'] }, 0] },
        bounce_rate: { $cond: [{ $gt: ['$views', 0] }, { $round: [{ $multiply: [{ $divide: ['$bounce_sum', '$views'] }, 100] }, 1] }, 0] },
      } },
      { $sort: { views: -1 } },
    ]).toArray(),
    db.collection('conversions').aggregate([
      { $match: cur },
      { $group: { _id: { $ifNull: ['$page', '/'] }, c: { $sum: 1 } } },
    ]).toArray(),
  ]);

  const convMap = Object.fromEntries(convRows.map((x) => [x._id, x.c]));
  const maxViews = rows.length ? rows[0].views : 0;
  const pages = rows.map((p) => ({
    path: p.path, title: p.title, views: p.views, uniques: p.uniques, avg_time: p.avg_time, bounce_rate: p.bounce_rate,
    conversions: convMap[p.path] || 0,
    rate: convRate(convMap[p.path] || 0, p.uniques),
    share: maxViews > 0 ? Math.round((p.views / maxViews) * 100) : 0,
  }));

  res.render('admin/pages', { admin: req.admin, range: r, pages });
});

/* ============================================================
   Conversions
   ============================================================ */
adminRouter.get('/conversions', async (req, res) => {
  const db = await ensureReady();
  const r = rangeOf(req);
  const cur = { created_at: { $gte: r.curStart, $lt: r.curEnd } };

  const [uniqueIds, engagedIds, convertedIds, total, byTypeRaw, hourRows, recentRaw] = await Promise.all([
    db.collection('page_views').distinct('session_id', cur),
    db.collection('page_views').distinct('session_id', { ...cur, is_bounce: 0 }),
    db.collection('conversions').distinct('session_id', cur),
    db.collection('conversions').countDocuments(cur),
    db.collection('conversions').aggregate([
      { $match: cur },
      { $group: { _id: '$type', c: { $sum: 1 } } },
      { $sort: { c: -1 } },
    ]).toArray(),
    db.collection('conversions').aggregate([
      { $match: cur },
      { $group: { _id: { $dateToString: { format: '%H', date: '$created_at', timezone: TZ } }, c: { $sum: 1 } } },
    ]).toArray(),
    db.collection('conversions').find(cur).sort({ _id: -1 }).limit(100).toArray(),
  ]);

  const uniques = uniqueIds.length, engaged = engagedIds.length, convertedSessions = convertedIds.length;
  const funnel = [
    { label: 'Ziyaretçi', value: uniques, pct: 100 },
    { label: 'Etkileşim', value: engaged, pct: uniques > 0 ? Math.round((engaged / uniques) * 100) : 0 },
    { label: 'Dönüşüm', value: convertedSessions, pct: uniques > 0 ? Math.round((convertedSessions / uniques) * 100) : 0 },
  ];

  const byType = byTypeRaw.map((x) => ({ type: x._id, c: x.c }));
  const hourMap = Object.fromEntries(hourRows.map((x) => [x._id, x.c]));
  const byHour = Array.from({ length: 24 }, (_, h) => hourMap[String(h).padStart(2, '0')] || 0);

  const recent = recentRaw.map((c) => {
    const ago = Math.floor((Date.now() - c.created_at.getTime()) / 1000);
    return {
      type: c.type, page: c.page, source: c.utm_source || 'direct', utm_campaign: c.utm_campaign,
      local_time: c.created_at.toLocaleString('tr-TR', { timeZone: TZ }),
      when: fmtAgo(ago),
    };
  });

  res.render('admin/conversions', {
    admin: req.admin, range: r, funnel, byType, total, rate: convRate(total, uniques), recent,
    payload: toScriptJson({ byHour, convTypes: byType }),
  });
});

/* ============================================================
   Blog CMS
   ============================================================ */
adminRouter.get('/blog', async (req, res) => {
  const db = await ensureReady();
  const posts = await db.collection('blog_posts').find().sort({ created_at: -1 }).toArray();
  const withMeta = posts.map((p) => ({
    ...p,
    id: p._id.toString(),
    created_day: p.created_at ? new Date(p.created_at.getTime() + TR_OFFSET_MS).toISOString().slice(0, 10) : null,
    content_len: (p.content || '').length,
  }));
  res.render('admin/blog', { admin: req.admin, posts: withMeta });
});

adminRouter.get('/blog/new', (req, res) => {
  res.render('admin/blog-form', { admin: req.admin, post: null, error: null });
});

async function savePost(req, res, id) {
  const { title, slug, content, excerpt, cover_url, published } = req.body || {};
  const post = { id, title, slug, content, excerpt, cover_url, published: published ? 1 : 0 };
  if (!title?.trim() || !slug?.trim() || !content?.trim()) {
    return res.render('admin/blog-form', { admin: req.admin, post, error: 'Başlık, slug ve içerik zorunludur' });
  }
  const db = await ensureReady();
  const cleanSlug = slug.trim();
  try {
    const dupFilter = id ? { slug: cleanSlug, _id: { $ne: new ObjectId(id) } } : { slug: cleanSlug };
    const existing = await db.collection('blog_posts').findOne(dupFilter);
    if (existing) {
      return res.render('admin/blog-form', { admin: req.admin, post, error: 'Bu slug zaten kullanılıyor' });
    }

    const now = new Date();
    if (id) {
      await db.collection('blog_posts').updateOne({ _id: new ObjectId(id) }, {
        $set: {
          slug: cleanSlug, title: title.trim(), content, excerpt: excerpt || null,
          cover_url: cover_url || null, published: post.published, updated_at: now,
        },
      });
    } else {
      await db.collection('blog_posts').insertOne({
        slug: cleanSlug, title: title.trim(), content, excerpt: excerpt || null,
        cover_url: cover_url || null, published: post.published, created_at: now, updated_at: now,
      });
    }
    res.redirect('/admin/blog');
  } catch (e) {
    console.error('[admin] savePost failed', e);
    res.render('admin/blog-form', { admin: req.admin, post, error: 'Kayıt hatası: ' + e.message });
  }
}

adminRouter.post('/blog', (req, res) => savePost(req, res, null));

adminRouter.get('/blog/:id/edit', async (req, res) => {
  const db = await ensureReady();
  let post = null;
  try {
    post = await db.collection('blog_posts').findOne({ _id: new ObjectId(req.params.id) });
  } catch {
    post = null;
  }
  if (!post) return res.redirect('/admin/blog');
  res.render('admin/blog-form', { admin: req.admin, post: { ...post, id: post._id.toString() }, error: null });
});

adminRouter.post('/blog/:id', (req, res) => savePost(req, res, req.params.id));

adminRouter.post('/blog/:id/delete', async (req, res) => {
  const db = await ensureReady();
  try {
    await db.collection('blog_posts').deleteOne({ _id: new ObjectId(req.params.id) });
  } catch {
    /* invalid id — nothing to delete */
  }
  res.redirect('/admin/blog');
});

/* ============================================================
   Settings
   ============================================================ */
adminRouter.get('/settings', (req, res) => {
  res.render('admin/settings', {
    admin: req.admin, error: null, success: null,
    apiBase: `${req.protocol}://${req.get('host')}`,
  });
});

adminRouter.post('/settings/password', async (req, res) => {
  const { current, next, confirm } = req.body || {};
  const apiBase = `${req.protocol}://${req.get('host')}`;
  const fail = (error) => res.render('admin/settings', { admin: req.admin, error, success: null, apiBase });

  if (!current || !next || !confirm) return fail('Tüm alanları doldur');
  if (next.length < 8) return fail('Yeni şifre en az 8 karakter olmalı');
  if (next !== confirm) return fail('Yeni şifreler birbiriyle uyuşmuyor');

  const db = await ensureReady();
  const user = await db.collection('admin_users').findOne({ _id: new ObjectId(req.admin.id) });
  if (!user || !bcrypt.compareSync(current, user.password_hash)) return fail('Mevcut şifre hatalı');

  await db.collection('admin_users').updateOne({ _id: user._id }, { $set: { password_hash: bcrypt.hashSync(next, 10) } });
  res.render('admin/settings', { admin: req.admin, error: null, success: 'Şifre güncellendi', apiBase });
});
