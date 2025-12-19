import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Create the team_members table if it doesn't exist
    await sql`
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
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_approved ON team_members(is_approved)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order)`;

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Database initialized successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to initialize database: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
