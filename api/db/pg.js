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

  let poolConfig;
  try {
    const parsed = new URL(connectionString);
    poolConfig = {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      user: decodeURIComponent(parsed.username || ''),
      password: decodeURIComponent(parsed.password || ''),
      database: (parsed.pathname || '').replace(/^\//, '') || 'postgres',
      // Supabase requires SSL; disable cert verification to avoid CA-chain issues in serverless.
      ssl: { rejectUnauthorized: false },
      max: 5
    };
  } catch {
    // Fallback: use raw string, but still force SSL.
    poolConfig = {
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5
    };
  }

  pool = new Pool(poolConfig);

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
