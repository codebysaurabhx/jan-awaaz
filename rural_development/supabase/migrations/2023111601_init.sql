-- migrations/2023111601_init.sql

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users and Profiles (Supabase Auth will manage users, but we store additional profile info)
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  avatar_url text,
  village_id uuid,
  role text NOT NULL DEFAULT 'citizen', -- citizen, panchayat_officer, block_officer, district_admin, super_admin
  language text NOT NULL DEFAULT 'en',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_village_id ON profiles(village_id);

-- 2. Geographic hierarchy
CREATE TABLE states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
  name text NOT NULL,
  UNIQUE(state_id, name)
);

CREATE TABLE blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
  name text NOT NULL,
  UNIQUE(district_id, name)
);

CREATE TABLE panchayats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES blocks(id) ON DELETE RESTRICT,
  name text NOT NULL,
  UNIQUE(block_id, name)
);

CREATE TABLE villages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panchayat_id uuid NOT NULL REFERENCES panchayats(id) ON DELETE RESTRICT,
  name text NOT NULL,
  UNIQUE(panchayat_id, name)
);

CREATE TABLE wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
  name text NOT NULL,
  UNIQUE(village_id, name)
);

-- 3. Departments (government departments handling complaints)
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- 4. Complaints
CREATE TYPE complaint_status AS ENUM ('submitted','reviewed','assigned','in_progress','resolved','citizen_verified','reopened','overdue');

CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status complaint_status NOT NULL DEFAULT 'submitted',
  citizen_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
  ward_id uuid REFERENCES wards(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  gps_location geography(Point,4326),
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolution_deadline timestamp with time zone,
  resolution_summary text,
  resolution_evidence_url text
);

CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_village_id ON complaints(village_id);
CREATE INDEX idx_complaints_department_id ON complaints(department_id);

-- 5. Attachments (photos, videos, voice)
CREATE TABLE complaint_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL, -- image, video, audio
  uploaded_at timestamp with time zone DEFAULT now()
);

-- 6. Updates / history
CREATE TABLE complaint_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  updater_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status complaint_status NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Escalations
CREATE TABLE complaint_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  from_level text NOT NULL,
  to_level text NOT NULL,
  escalated_at timestamp with time zone DEFAULT now(),
  note text
);

-- 8. Feedback (citizen verification)
CREATE TABLE complaint_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  citizen_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  satisfied boolean NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- 9. Notifications (in‑app)
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 10. Audit logs
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 11. Village development metrics (pre‑computed for analytics)
CREATE TABLE village_development_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
  metric_key text NOT NULL,
  metric_value numeric NOT NULL,
  recorded_at date NOT NULL,
  UNIQUE(village_id, metric_key, recorded_at)
);

-- Row Level Security (RLS) policies – simple example for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_self" ON profiles FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "allow_admin" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'super_admin'));

-- Similar policies would be added for other tables (omitted for brevity).
