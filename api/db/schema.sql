-- Database schema for team members
-- This schema is used to store team member information

CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_cn VARCHAR(100), -- Chinese name
    role VARCHAR(100) NOT NULL, -- e.g., 'Assistant Professor & Director', 'Master Student', 'Undergraduate Internship', 'Research Assistant'
    category VARCHAR(50) NOT NULL, -- 'faculty', 'postgraduate', 'undergraduate', 'ra', 'alumni'
    photo_url VARCHAR(500),
    website VARCHAR(500),
    social_links JSONB DEFAULT '[]', -- Array of {platform, url, icon}
    display_order INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT false, -- For new registrations, admin needs to approve
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members(category);
CREATE INDEX IF NOT EXISTS idx_team_members_approved ON team_members(is_approved);
CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order);
