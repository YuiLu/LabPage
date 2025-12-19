import { sql } from '@vercel/postgres';
import seedData from './db/seed-data.json';

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
    let insertedCount = 0;
    
    for (const member of seedData.members) {
      const socialLinksJson = JSON.stringify(member.social_links || []);
      
      // Check if member already exists (by name and category)
      const existing = await sql`
        SELECT id FROM team_members 
        WHERE name = ${member.name} AND category = ${member.category}
      `;
      
      if (existing.rows.length === 0) {
        await sql`
          INSERT INTO team_members (name, name_cn, role, category, photo_url, website, social_links, display_order, is_approved)
          VALUES (
            ${member.name}, 
            ${member.name_cn || null}, 
            ${member.role}, 
            ${member.category}, 
            ${member.photo_url || null}, 
            ${member.website || null}, 
            ${socialLinksJson}::jsonb, 
            ${member.display_order || 0},
            ${member.is_approved !== false}
          )
        `;
        insertedCount++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Seed completed. Inserted ${insertedCount} new members.`,
      total: seedData.members.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Seed error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to seed database: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
