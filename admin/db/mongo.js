import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

/* Europe/Istanbul is a fixed UTC+3 offset — Turkey has not observed DST
   since 2016, so a constant offset (rather than an IANA tz lookup) is
   correct here and keeps the JS-side date math simple. */
export const TR_OFFSET_MS = 3 * 60 * 60 * 1000;

let clientPromise;
function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    clientPromise = client.connect();
  }
  return clientPromise;
}

let dbPromise;
function getDb() {
  if (!dbPromise) {
    dbPromise = getClient().then((client) => client.db(process.env.MONGODB_DB || 'gebze_fiber_admin'));
  }
  return dbPromise;
}

let readyPromise;
/* Ensures indexes exist and the default admin user is seeded. Cached across
   warm Lambda invocations so it only runs once per container lifetime. */
export function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection('visitors').createIndex({ session_id: 1 }, { unique: true }),
        db.collection('page_views').createIndex({ session_id: 1 }),
        db.collection('page_views').createIndex({ created_at: -1 }),
        db.collection('page_views').createIndex({ session_id: 1, path: 1, _id: -1 }),
        db.collection('page_views').createIndex({ utm_source: 1, utm_medium: 1 }),
        db.collection('conversions').createIndex({ session_id: 1 }),
        db.collection('conversions').createIndex({ type: 1 }),
        db.collection('conversions').createIndex({ created_at: -1 }),
        db.collection('blog_posts').createIndex({ slug: 1 }, { unique: true }),
        db.collection('admin_users').createIndex({ username: 1 }, { unique: true }),
      ]);
      await seedAdmin(db);
      return db;
    })().catch((err) => {
      readyPromise = null; // allow retry on next request instead of caching a failure
      throw err;
    });
  }
  return readyPromise;
}

async function seedAdmin(db) {
  const count = await db.collection('admin_users').countDocuments();
  if (count === 0) {
    const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(password, 10);
    await db.collection('admin_users').insertOne({ username: 'admin', password_hash: hash });
    console.log('[admin] Default user created: admin /', password);
  }
}
