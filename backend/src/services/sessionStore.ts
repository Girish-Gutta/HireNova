import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

export interface InterviewSession {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  linkToken: string;
  expiresAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  createdAt: Date;
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

export interface PhaseResult {
  sessionId: string;
  phaseType: 'mcq' | 'coding' | 'speaking' | 'scenario';
  rawAnswers: any;
  subScores: Record<string, number>;
  weightedScore: number;
  submittedAt: string;
  aiEvaluation?: string;
}

export interface ProctoringEvent {
  sessionId: string;
  type: 'tab_switch' | 'copy_paste' | 'webcam_lost' | 'face_absent' | 'multiple_faces' | 'browser_blur';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  metadata?: Record<string, any>;
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

interface SessionData {
  session: InterviewSession;
  questions: Record<string, GeneratedQuestion[]>;
  phaseResults: PhaseResult[];
  proctoringEvents: ProctoringEvent[];
  report?: ScoreReport;
}

// In-memory store
const store = new Map<string, SessionData>();
const tokenIndex = new Map<string, string>(); // token -> sessionId

export const sessionStore = {
  async createSession(params: {
    applicationId: string;
    jobId: string;
    candidateId: string;
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    expiryHours?: number;
  }): Promise<InterviewSession> {
    const id = crypto.randomUUID();
    const linkToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + (params.expiryHours ?? 72) * 60 * 60 * 1000);
    const createdAt = new Date();

    const session: InterviewSession = {
      id,
      applicationId: params.applicationId,
      jobId: params.jobId,
      candidateId: params.candidateId,
      candidateEmail: params.candidateEmail,
      candidateName: params.candidateName,
      jobTitle: params.jobTitle,
      linkToken,
      expiresAt,
      status: 'pending',
      createdAt,
    };

    store.set(id, {
      session,
      questions: {},
      phaseResults: [],
      proctoringEvents: [],
    });
    tokenIndex.set(linkToken, id);

    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase.from('interview_sessions').insert({
          id,
          application_id: params.applicationId,
          link_token: linkToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        });
      } catch (_err) {
        // fallback to in-memory
      }
    }

    return session;
  },

  async getSessionByToken(token: string): Promise<InterviewSession | null> {
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('link_token', token)
          .single();
        if (data) {
          return {
            id: data.id,
            applicationId: data.application_id,
            jobId: data.job_id || '',
            candidateId: data.candidate_id || '',
            candidateEmail: data.candidate_email || '',
            candidateName: data.candidate_name || '',
            jobTitle: data.job_title || '',
            linkToken: data.link_token,
            expiresAt: new Date(data.expires_at),
            status: data.status,
            createdAt: new Date(data.created_at),
          };
        }
      } catch (_err) {}
    }
    const id = tokenIndex.get(token);
    if (!id) return null;
    return store.get(id)?.session ?? null;
  },

  async getSessionById(id: string): Promise<InterviewSession | null> {
    return store.get(id)?.session ?? null;
  },

  async updateSessionStatus(id: string, status: InterviewSession['status']): Promise<void> {
    const data = store.get(id);
    if (data) {
      data.session.status = status;
    }
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase.from('interview_sessions').update({ status }).eq('id', id);
      } catch (_err) {}
    }
  },

  isSessionValid(session: InterviewSession): boolean {
    return session.status !== 'expired' && new Date() < session.expiresAt;
  },

  async expireOldSessions(): Promise<number> {
    let count = 0;
    const now = new Date();
    for (const [, data] of store) {
      if (data.session.status === 'pending' && data.session.expiresAt < now) {
        data.session.status = 'expired';
        count++;
      }
    }
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('interview_sessions')
          .update({ status: 'expired' })
          .eq('status', 'pending')
          .lt('expires_at', now.toISOString());
      } catch (_err) {}
    }
    return count;
  },

  setQuestions(sessionId: string, phaseType: string, questions: GeneratedQuestion[]): void {
    const data = store.get(sessionId);
    if (data) {
      data.questions[phaseType] = questions;
    }
  },

  getQuestions(sessionId: string, phaseType: string): GeneratedQuestion[] {
    return store.get(sessionId)?.questions[phaseType] ?? [];
  },

  addPhaseResult(result: PhaseResult): void {
    const data = store.get(result.sessionId);
    if (data) {
      // Replace if same phase was already submitted
      const idx = data.phaseResults.findIndex((r) => r.phaseType === result.phaseType);
      if (idx >= 0) data.phaseResults[idx] = result;
      else data.phaseResults.push(result);
    }
  },

  getPhaseResults(sessionId: string): PhaseResult[] {
    return store.get(sessionId)?.phaseResults ?? [];
  },

  addProctoringEvent(event: ProctoringEvent): void {
    const data = store.get(event.sessionId);
    if (data) {
      data.proctoringEvents.push(event);
    }
  },

  getProctoringEvents(sessionId: string): ProctoringEvent[] {
    return store.get(sessionId)?.proctoringEvents ?? [];
  },

  setReport(sessionId: string, report: ScoreReport): void {
    const data = store.get(sessionId);
    if (data) {
      data.report = report;
    }
  },

  getReport(sessionId: string): ScoreReport | undefined {
    return store.get(sessionId)?.report;
  },

  getAllSessions(): InterviewSession[] {
    return Array.from(store.values()).map((d) => d.session);
  },
};
