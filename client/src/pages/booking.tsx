-- 1. Create team_members table for the "Members" (Membros) page
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL, -- e.g., 'Presidente', 'Diretor', etc.
  bio TEXT,
  image_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members
-- Public read access
DROP POLICY IF EXISTS "Public read access for active team members" ON team_members;
CREATE POLICY "Public read access for active team members" ON team_members 
  FOR SELECT USING (is_active = true);

-- Admin full access
DROP POLICY IF EXISTS "Admin full access to team_members" ON team_members;
CREATE POLICY "Admin full access to team_members" ON team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.email = auth.jwt() ->> 'email' 
    AND au.is_active = true
  )
);

-- 2. Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  notes TEXT,
  attachments TEXT[] DEFAULT '{}',
  video_conference_link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 3. Policies for applications
-- Admin full access to applications
DROP POLICY IF EXISTS "Admin full access to applications" ON applications;
CREATE POLICY "Admin full access to applications" ON applications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.email = auth.jwt() ->> 'email' 
    AND au.is_active = true
  )
);

-- Allow public to insert applications (for the form on the website)
DROP POLICY IF EXISTS "Public insert access to applications" ON applications;
CREATE POLICY "Public insert access to applications" ON applications 
  FOR INSERT WITH CHECK (true);
