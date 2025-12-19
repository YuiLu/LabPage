const { sql } = require('@vercel/postgres');

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all approved team members
      const { rows } = await sql`
        SELECT id, name, name_cn, role, category, photo_url, website, social_links, display_order
        FROM team_members 
        WHERE is_approved = true 
        ORDER BY display_order ASC, created_at ASC
      `;
      
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

      // Insert new member (not approved by default)
      const socialLinksJson = JSON.stringify(social_links || []);
      
      const result = await sql`
        INSERT INTO team_members (name, name_cn, role, category, photo_url, website, social_links, is_approved)
        VALUES (${name}, ${name_cn || null}, ${role}, ${category}, ${photo_url || null}, ${website || null}, ${socialLinksJson}::jsonb, false)
        RETURNING id
      `;

      return res.status(201).json({ 
        success: true, 
        message: 'Registration submitted successfully. Awaiting approval.',
        id: result.rows[0].id
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
};
