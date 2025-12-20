const { Pool } = require('pg');

let pool;

function getDatabaseUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL;
}

function getDbDebugInfo() {
  const rawUrl = getDatabaseUrl();
  if (!rawUrl) return { databaseUrlPresent: false };

  try {
    const parsed = new URL(rawUrl);
    return {
      databaseUrlPresent: true,
      databaseUrlScheme: parsed.protocol.replace(':', ''),
      databaseUrlHost: parsed.host
    };
  } catch {
    return { databaseUrlPresent: true, databaseUrlScheme: 'unparseable' };
  }
}

function getPool() {
  if (pool) return pool;

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error('Database is not configured (missing POSTGRES_URL/DATABASE_URL).');
  }

  // Supabase requires SSL. In serverless, keep a small pool.
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5
  });

  return pool;
}

async function query(text, params) {
  const poolInstance = getPool();
  return poolInstance.query(text, params);
}

module.exports = {
  getDatabaseUrl,
  getDbDebugInfo,
  getPool,
  query
};
