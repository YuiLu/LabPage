const { getDatabaseUrl, getDbDebugInfo, query } = require('./db/pg');

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!getDatabaseUrl()) {
    return res.status(500).json({
      success: false,
      error: 'Database is not configured for this deployment (missing POSTGRES_URL/DATABASE_URL). Please set it to your Supabase Postgres connection string.'
    });
  }
  const dbDebug = getDbDebugInfo();

  try {
    // Create the team_members table if it doesn't exist
    await query(
      `
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_cn VARCHAR(100),
        role VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        photo_url VARCHAR(500),
        website VARCHAR(500),
        social_links JSONB DEFAULT '[]',
        display_order INTEGER DEFAULT 0,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_team_members_approved ON team_members(is_approved)');
    await query('CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order)');

    return res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize database: ' + error.message,
      debug: dbDebug
    });
  }
};
