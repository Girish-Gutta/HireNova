const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  responseTimeMs: number;
  services: {
    database: {
      provider: string;
      connected: boolean;
      message: string;
    };
    aiEngine: {
      provider: string;
      configured: boolean;
    };
    codeSandbox: {
      provider: string;
      configured: boolean;
      url: string;
    };
  };
}

export interface InterviewPhaseConfig {
  type: 'mcq' | 'coding' | 'speaking' | 'listening' | 'scenario';
  order: number;
  durationMinutes: number;
  weight: number;
}

export interface Job {
  id: string;
  company_id: string;
  company_name?: string;
  created_by?: string;
  title: string;
  department: string;
  description: string;
  required_skills: string[];
  seniority: string;
  phases_config: InterviewPhaseConfig[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
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
  jobs?: Job;
}

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  return response.json();
}

// Jobs
export async function fetchJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
  const data = await response.json();
  return data.jobs || [];
}

export async function fetchJobById(id: string): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch job ${id}: ${response.status}`);
  const data = await response.json();
  return data.job;
}

export async function createJob(
  jobData: {
    title: string;
    department: string;
    description: string;
    requiredSkills: string[];
    seniority: string;
    phasesConfig: InterviewPhaseConfig[];
    companyName?: string;
  },
  roleHeader: string = 'recruiter'
): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mock-role': roleHeader,
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create job (${response.status})`);
  }

  const data = await response.json();
  return data.job;
}

// Resume Upload
export async function uploadResume(
  fileName: string,
  fileContent: string,
  mimeType: string = 'application/pdf'
): Promise<{ url: string; fileName: string }> {
  const response = await fetch(`${API_BASE_URL}/applications/upload-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileContent, mimeType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload resume');
  }

  return response.json();
}

// Applications
export async function submitApplication(payload: {
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  resumeText?: string;
}): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit application');
  }

  const data = await response.json();
  return data.application;
}

export async function fetchCandidateApplications(candidateId: string): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/applications/candidate/${candidateId}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch candidate applications');
  const data = await response.json();
  return data.applications || [];
}

export async function fetchAllApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch applications');
  const data = await response.json();
  return data.applications || [];
}
