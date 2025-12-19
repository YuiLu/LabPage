import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (request.method === 'GET') {
      // Get all approved team members
      const { rows } = await sql`
        SELECT id, name, name_cn, role, category, photo_url, website, social_links, display_order
        FROM team_members 
        WHERE is_approved = true 
        ORDER BY display_order ASC, created_at ASC
      `;
      
      return new Response(JSON.stringify({ success: true, members: rows }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (request.method === 'POST') {
      // Register a new team member
      const body = await request.json();
      const { name, name_cn, role, category, photo_url, website, social_links } = body;

      // Validate required fields
      if (!name || !role || !category) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Name, role, and category are required' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Validate category
      const validCategories = ['faculty', 'postgraduate', 'undergraduate', 'ra', 'alumni'];
      if (!validCategories.includes(category)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid category. Must be one of: ' + validCategories.join(', ') 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Insert new member (not approved by default)
      const socialLinksJson = JSON.stringify(social_links || []);
      
      const result = await sql`
        INSERT INTO team_members (name, name_cn, role, category, photo_url, website, social_links, is_approved)
        VALUES (${name}, ${name_cn || null}, ${role}, ${category}, ${photo_url || null}, ${website || null}, ${socialLinksJson}::jsonb, false)
        RETURNING id
      `;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Registration submitted successfully. Awaiting approval.',
        id: result.rows[0].id
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
