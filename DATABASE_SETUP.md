# MAGIC Lab Database Setup Guide

This guide explains how to set up a Supabase Postgres database for dynamic team member management.

## Prerequisites

1. A Supabase project (Postgres database)
2. Access to the Vercel project dashboard (to set environment variables)

## Setup Steps

### 1. Create a Supabase Postgres Database

1. Go to your Supabase dashboard
2. Create a new project (or use an existing one)
3. In **Project Settings → Database**, copy the connection string

### 2. Configure Vercel Environment Variables

This project uses a serverless API on Vercel and connects directly to Supabase Postgres via the `pg` driver.

In your Vercel Project → **Settings → Environment Variables**, set one of the following:
- `POSTGRES_URL` (recommended in this project)
  - Set it to your Supabase Postgres connection string
- OR `DATABASE_URL`

Important:
- Apply it to the **Production** environment (and Preview if needed)
- After changing env vars, **Redeploy** to make them take effect

### 3. (Optional) Create a Vercel Blob Store for Image Uploads

If you want to allow users to upload profile photos:

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** and select **Blob**
4. Choose a name (e.g., `magic-lab-images`)
5. Click **Create**
6. Copy the `BLOB_READ_WRITE_TOKEN` environment variable

### 4. Initialize the Database

After deploying to Vercel, you need to initialize the database:

1. Visit: `https://your-domain.vercel.app/api/init-db` (POST request)
   - You can use curl: `curl -X POST https://your-domain.vercel.app/api/init-db`

2. Seed the initial data: `https://your-domain.vercel.app/api/seed-db` (POST request)
   - This will import all existing team members from the seed-data.json file

## API Endpoints

### GET /api/members
Retrieves all approved team members.

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "name_cn": "张三",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/...",
      "website": "https://...",
      "social_links": [],
      "display_order": 1
    }
  ]
}
```

### POST /api/members
Register a new team member.

**Request Body:**
```json
{
  "name": "John Doe",
  "name_cn": "张三",
  "role": "Master Student",
  "category": "postgraduate",
  "photo_url": "https://...",
  "website": "https://...",
  "social_links": [
    {"platform": "github", "url": "https://github.com/..."}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration submitted successfully. Awaiting approval.",
  "id": 1
}
```

### POST /api/upload
Upload a profile photo.

**Request:** multipart/form-data with `file` field

**Response:**
```json
{
  "success": true,
  "url": "https://..."
}
```

### POST /api/init-db
Initialize the database schema (run once).

### POST /api/seed-db
Seed the database with initial team member data.

## Switching to Dynamic People Section

To use the dynamic version of the People section (loaded from database):

1. In `source/index.html`, change:
   ```html
   @@include('blocks/People.htm')
   ```
   to:
   ```html
   @@include('blocks/People-dynamic.htm')
   ```

2. Run `npm run build` to rebuild the site

## Category Values

- `faculty` - Faculty members (professors)
- `postgraduate` - Master/PhD students
- `undergraduate` - Undergraduate interns
- `ra` - Research assistants
- `alumni` - Graduated members

## Admin Management

New registrations have `is_approved = false` by default. To approve members, you'll need to directly update the database or create an admin interface.

You can approve members using Supabase:
1. Go to Supabase → **Table Editor**
2. Open the `team_members` table
3. Find the row and set `is_approved` to `true`

Alternatively, run SQL in Supabase → **SQL Editor**:
```sql
UPDATE team_members
SET is_approved = true
WHERE id = 123;
```

Notes:
- Approved members will show up on the website only when `is_approved = true`.
- Ordering uses `display_order` first; if you want a specific position in the list, set `display_order` accordingly.

## Local Development

For local development, you can set up environment variables in a `.env.local` file:

```
POSTGRES_URL=your_postgres_url
BLOB_READ_WRITE_TOKEN=your_blob_token
```

Note: The API endpoints are designed for Vercel Serverless Functions.
