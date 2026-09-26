-- HireNova Core Database Schema Migration
-- Database: PostgreSQL (Supabase compatible)
-- Description: Core schema for AI-run interview platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types and Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('submitted', 'matched', 'interview_scheduled', 'interview_completed', 'reviewed', 'rejected', 'accepted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('pending', 'in-progress', 'completed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE phase_type AS ENUM ('mcq', 'coding', 'speaking', 'listening', 'scenario');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proctoring_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recommendation_type AS ENUM ('Strong Hire', 'Hire', 'Borderline', 'No Hire');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles / Users Table (linked with Supabase auth.users if available, or standalone)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- references auth.users(id) in Supabase
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    seniority VARCHAR(50) NOT NULL DEFAULT 'Mid', -- Junior, Mid, Senior, Lead, Executive
    phases_config JSONB NOT NULL DEFAULT '[
        {"type": "mcq", "order": 1, "durationMinutes": 10, "weight": 0.15},
        {"type": "coding", "order": 2, "durationMinutes": 30, "weight": 0.35},
        {"type": "speaking", "order": 3, "durationMinutes": 15, "weight": 0.20},
        {"type": "scenario", "order": 4, "durationMinutes": 15, "weight": 0.30}
    ]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    resume_text TEXT,
    match_score NUMERIC(5, 2), -- e.g. 85.50
    match_details JSONB DEFAULT '{}'::jsonb, -- skill matches, gaps, suggested plan
    status application_status NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- 5. Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    link_token VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status session_status NOT NULL DEFAULT 'pending',
    current_phase_index INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Phase Results Table
CREATE TABLE IF NOT EXISTS phase_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    phase_type phase_type NOT NULL,
    raw_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    agent_notes TEXT,
    score NUMERIC(5, 2),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Proctoring Events Table
CREATE TABLE IF NOT EXISTS proctoring_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'multiple_faces', 'face_missing', 'tab_switched', 'object_detected', 'copy_paste'
    severity proctoring_severity NOT NULL DEFAULT 'low',
    evidence_ref TEXT, -- snapshot reference or audio snippet reference
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
    final_score NUMERIC(5, 2) NOT NULL,
    recommendation recommendation_type NOT NULL,
    rationale TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    phase_summaries JSONB NOT NULL DEFAULT '{}'::jsonb,
    company_notes TEXT,
    is_overridden BOOLEAN NOT NULL DEFAULT false,
    override_reason TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_companies_updated_at') THEN
        CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
        CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jobs_updated_at') THEN
        CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_applications_updated_at') THEN
        CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_interview_sessions_updated_at') THEN
        CREATE TRIGGER trg_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_application_id ON interview_sessions(application_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON interview_sessions(link_token);
CREATE INDEX IF NOT EXISTS idx_proctoring_session_id ON proctoring_events(session_id);
CREATE INDEX IF NOT EXISTS idx_phase_results_session_id ON phase_results(session_id);

-- Enable RLS on tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Basic Permissive RLS Policies for Service Role / Authenticated users
-- (Fine-grained policies get extended in Phase 1 & 13)
CREATE POLICY "Public jobs are readable by all" ON jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Profiles readable by owner or recruiter" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles updatable by owner" ON profiles FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Applications viewable by candidate or recruiter" ON applications FOR ALL USING (true);
CREATE POLICY "Sessions accessible with token or recruiter" ON interview_sessions FOR ALL USING (true);
CREATE POLICY "Phase results accessible by session owner" ON phase_results FOR ALL USING (true);
CREATE POLICY "Proctoring events accessible by session owner" ON proctoring_events FOR ALL USING (true);
CREATE POLICY "Reports accessible by recruiter and candidate" ON reports FOR ALL USING (true);
