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

// Interview Sessions
export interface InterviewSession {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  linkToken: string;
  expiresAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  createdAt: string;
}

export interface GeneratedQuestion {
  id: string;
  type: 'mcq' | 'coding' | 'speaking' | 'scenario';
  text: string;
  options?: string[];
  correctAnswer?: string;
  testCases?: { input: string; expectedOutput: string; isHidden: boolean }[];
  scoringRubric?: string;
  timeLimit?: number;
}

export interface ScoreReport {
  sessionId: string;
  applicationId: string;
  totalScore: number;
  phaseBreakdown: Record<string, number>;
  proctoringFlags: number;
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire';
  strengths: string[];
  improvements: string[];
  summary: string;
  generatedAt: string;
}

export interface SessionVerificationResponse {
  session: InterviewSession;
  job: Job;
  application: Application;
  phases: InterviewPhaseConfig[];
}

export async function fetchSessionByToken(token: string): Promise<SessionVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/sessions/${token}`, { cache: 'no-store' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to verify interview token (${response.status})`);
  }
  return response.json();
}

export async function createInterviewSession(
  applicationId: string,
  expiryHours: number = 72
): Promise<{ session: InterviewSession; interviewUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, expiryHours }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create interview session');
  }
  return response.json();
}

export async function fetchSessionByApplication(applicationId: string): Promise<{
  session: InterviewSession;
  report?: ScoreReport;
  proctoringFlagsCount: number;
}> {
  const response = await fetch(`${API_BASE_URL}/sessions/application/${applicationId}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch session for application');
  }
  return response.json();
}

// Question Generation
export async function generateQuestions(
  sessionId: string,
  phaseType: 'mcq' | 'coding' | 'speaking' | 'scenario'
): Promise<GeneratedQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/agents/generate-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, phaseType }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to generate questions');
  }
  const data = await response.json();
  return data.questions || [];
}

// Code Execution
export async function executeCode(
  language: string,
  sourceCode: string,
  stdin?: string
): Promise<{ success: boolean; output: string; stdout: string; stderr: string; executionTime?: number }> {
  const response = await fetch(`${API_BASE_URL}/agents/execute-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, sourceCode, stdin }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to execute code');
  }
  const data = await response.json();
  return data.result;
}

// Phase Results & Completion
export async function submitPhaseResult(
  token: string,
  payload: {
    phaseType: 'mcq' | 'coding' | 'speaking' | 'scenario';
    rawAnswers: any;
    subScores?: Record<string, number>;
    weightedScore: number;
    aiEvaluation?: string;
  }
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/sessions/${token}/phase-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit phase result');
  }
  return response.json();
}

export async function completeInterview(token: string): Promise<{ message: string; report: ScoreReport }> {
  const response = await fetch(`${API_BASE_URL}/sessions/${token}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to complete interview');
  }
  return response.json();
}

export async function fetchSessionReport(token: string): Promise<{
  session: InterviewSession;
  report: ScoreReport | null;
  proctoringEvents: any[];
  phaseResults: any[];
}> {
  const response = await fetch(`${API_BASE_URL}/sessions/${token}/report`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch interview report');
  }
  return response.json();
}

// Proctoring
export async function logProctoringEvent(payload: {
  sessionId: string;
  type: 'tab_switch' | 'copy_paste' | 'webcam_lost' | 'face_absent' | 'multiple_faces' | 'browser_blur';
  severity?: 'low' | 'medium' | 'high';
  timestamp?: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/proctoring/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    return { success: false };
  }
  return response.json();
}
