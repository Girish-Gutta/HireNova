import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

export interface JobRecord {
  id: string;
  company_id: string;
  company_name?: string;
  created_by?: string;
  title: string;
  department: string;
  description: string;
  required_skills: string[];
  seniority: string;
  phases_config: Array<{
    type: 'mcq' | 'coding' | 'speaking' | 'listening' | 'scenario';
    order: number;
    durationMinutes: number;
    weight: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRecord {
  id: string;
  job_id: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  resume_url: string;
  resume_text?: string;
  match_score?: number | null;
  match_details?: any;
  status: 'submitted' | 'matched' | 'interview_scheduled' | 'interview_completed' | 'reviewed' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
}

// In-memory fallback store
const inMemoryJobs: JobRecord[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    company_id: '22222222-2222-2222-2222-222222222222',
    company_name: 'Acme Systems',
    title: 'Senior Full Stack TypeScript Engineer',
    department: 'Engineering',
    description: 'We are seeking an experienced Full Stack Engineer proficient in Next.js, Node.js, TypeScript, and distributed cloud systems to build real-time AI products. You will lead development of high-performance web applications and backend microservices.',
    required_skills: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'REST APIs'],
    seniority: 'Senior',
    phases_config: [
      { type: 'mcq', order: 1, durationMinutes: 10, weight: 0.15 },
      { type: 'coding', order: 2, durationMinutes: 30, weight: 0.35 },
      { type: 'speaking', order: 3, durationMinutes: 15, weight: 0.20 },
      { type: 'scenario', order: 4, durationMinutes: 15, weight: 0.30 },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    company_id: '22222222-2222-2222-2222-222222222222',
    company_name: 'Acme Systems',
    title: 'AI / LLM Systems Engineer',
    department: 'Artificial Intelligence',
    description: 'Join our Core AI team to build autonomous agentic workflows, prompt-engineering pipelines, and model evaluation systems leveraging Gemini API and local inference engines.',
    required_skills: ['Python', 'TypeScript', 'LLMs', 'Prompt Engineering', 'Vector DBs', 'System Architecture'],
    seniority: 'Mid',
    phases_config: [
      { type: 'mcq', order: 1, durationMinutes: 10, weight: 0.15 },
      { type: 'coding', order: 2, durationMinutes: 25, weight: 0.35 },
      { type: 'scenario', order: 3, durationMinutes: 20, weight: 0.50 },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const inMemoryApplications: ApplicationRecord[] = [];

export const dbStore = {
  // Jobs
  async getJobs(): Promise<JobRecord[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((j: any) => ({
          ...j,
          company_name: j.companies?.name || 'Partner Company',
        }));
      }
    }
    return inMemoryJobs.filter((j) => j.is_active);
  },

  async getJobById(id: string): Promise<JobRecord | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .eq('id', id)
        .single();
      if (!error && data) {
        return {
          ...data,
          company_name: data.companies?.name || 'Partner Company',
        };
      }
    }
    const found = inMemoryJobs.find((j) => j.id === id);
    return found || null;
  },

  async createJob(job: Omit<JobRecord, 'id' | 'created_at' | 'updated_at'>): Promise<JobRecord> {
    const id = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `job-${Date.now()}`;
    const now = new Date().toISOString();
    const newJob: JobRecord = {
      ...job,
      id,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          company_id: job.company_id,
          created_by: job.created_by,
          title: job.title,
          department: job.department,
          description: job.description,
          required_skills: job.required_skills,
          seniority: job.seniority,
          phases_config: job.phases_config,
          is_active: job.is_active,
        })
        .select()
        .single();
      if (!error && data) {
        return { ...data, company_name: job.company_name || 'Partner Company' };
      }
    }

    inMemoryJobs.unshift(newJob);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<JobRecord>): Promise<JobRecord | null> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('jobs')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }

    const index = inMemoryJobs.findIndex((j) => j.id === id);
    if (index === -1) return null;
    inMemoryJobs[index] = {
      ...inMemoryJobs[index],
      ...updates,
      updated_at: now,
    };
    return inMemoryJobs[index];
  },

  async deleteJob(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from('jobs').update({ is_active: false }).eq('id', id);
      return !error;
    }

    const index = inMemoryJobs.findIndex((j) => j.id === id);
    if (index !== -1) {
      inMemoryJobs[index].is_active = false;
      return true;
    }
    return false;
  },

  // Applications
  async createApplication(app: Omit<ApplicationRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ApplicationRecord> {
    const id = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `app-${Date.now()}`;
    const now = new Date().toISOString();
    const newApp: ApplicationRecord = {
      ...app,
      id,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: app.job_id,
          candidate_id: app.candidate_id,
          resume_url: app.resume_url,
          resume_text: app.resume_text,
          match_score: app.match_score || null,
          match_details: app.match_details || {},
          status: app.status,
        })
        .select()
        .single();
      if (!error && data) return data;
    }

    inMemoryApplications.unshift(newApp);
    return newApp;
  },

  async getApplicationsByCandidate(candidateId: string): Promise<ApplicationRecord[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*)')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return inMemoryApplications.filter((a) => a.candidate_id === candidateId);
  },

  async getApplicationsByJob(jobId: string): Promise<ApplicationRecord[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('applications')
        .select('*, profiles(full_name, email)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return inMemoryApplications.filter((a) => a.job_id === jobId);
  },

  async getAllApplications(): Promise<ApplicationRecord[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return [...inMemoryApplications];
  },

  async getApplicationById(id: string): Promise<ApplicationRecord | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    }
    const found = inMemoryApplications.find((a) => a.id === id);
    return found || null;
  },

  async updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<ApplicationRecord | null> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('applications')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }

    const index = inMemoryApplications.findIndex((a) => a.id === id);
    if (index === -1) return null;
    inMemoryApplications[index] = {
      ...inMemoryApplications[index],
      ...updates,
      updated_at: now,
    };
    return inMemoryApplications[index];
  }
};
