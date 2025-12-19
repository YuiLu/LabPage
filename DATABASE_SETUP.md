# MAGIC Lab Database Setup Guide

This guide explains how to set up the Vercel Postgres database for dynamic team member management.

## Prerequisites

1. A Vercel account with Postgres storage enabled
2. Access to the Vercel project dashboard

## Setup Steps

### 1. Create a Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** and select **Postgres**
4. Choose a name for your database (e.g., `magic-lab-db`)
5. Select your preferred region
6. Click **Create**

### 2. Connect the Database to Your Project

After creating the database:
1. Click on the database to open its settings
2. Go to the **Getting Started** tab
3. Copy the environment variables and add them to your Vercel project

The required environment variables are:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

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

You can update approval status using Vercel's Data Browser:
1. Go to your database in Vercel dashboard
2. Click on **Data Browser**
3. Find the member and update `is_approved` to `true`

## Local Development

For local development, you can set up environment variables in a `.env.local` file:

```
POSTGRES_URL=your_postgres_url
BLOB_READ_WRITE_TOKEN=your_blob_token
```

Note: The API endpoints will only work when deployed to Vercel, as they use Vercel's serverless infrastructure.
