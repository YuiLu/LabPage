const { getDatabaseUrl, getDbDebugInfo, query } = require('./db/pg');

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Ensure API responses are never cached (so Supabase edits show up immediately)
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!getDatabaseUrl()) {
    return res.status(500).json({
      success: false,
      error: 'Database is not configured for this deployment (missing POSTGRES_URL/DATABASE_URL). Please set it to your Supabase Postgres connection string.'
    });
  }
  const dbDebug = getDbDebugInfo();

  try {
    if (req.method === 'GET') {
      // Get all approved team members
      const { rows } = await query(
        `
        SELECT id, name, name_cn, role, category, photo_url, website, social_links, display_order
        FROM team_members
        WHERE is_approved = true
        ORDER BY display_order ASC, created_at ASC
        `
      );
      
      return res.status(200).json({ success: true, members: rows });
    }

    if (req.method === 'POST') {
      // Register a new team member
      const { name, name_cn, role, category, photo_url, website, social_links } = req.body;

      // Validate required fields
      if (!name || !role || !category) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name, role, and category are required' 
        });
      }

      // Validate category
      const validCategories = ['faculty', 'postgraduate', 'undergraduate', 'ra', 'alumni'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid category. Must be one of: ' + validCategories.join(', ') 
        });
      }

      // Insert new member (approved by default)
      const socialLinksJson = JSON.stringify(social_links || []);
      const result = await query(
        `
        INSERT INTO team_members (name, name_cn, role, category, photo_url, website, social_links, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, true)
        RETURNING id
        `,
        [
          name,
          name_cn || null,
          role,
          category,
          photo_url || null,
          website || null,
          socialLinksJson
        ]
      );

      return res.status(201).json({ 
        success: true, 
        message: 'Registration submitted successfully.',
        id: result.rows[0].id
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message,
      debug: dbDebug
    });
  }
};
