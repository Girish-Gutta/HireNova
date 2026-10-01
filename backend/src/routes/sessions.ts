import { Router, Request, Response } from 'express';
import { sessionStore } from '../services/sessionStore.js';
import { dbStore } from '../services/dbStore.js';
import { createInterviewSession } from '../agents/schedulingAgent.js';
import { scoringAgent } from '../agents/scoringAgent.js';
import { sendResultsNotification } from '../agents/emailAgent.js';
import { z } from 'zod';

export const sessionsRouter = Router();

// POST /api/sessions - Recruiter creates interview session
const createSessionSchema = z.object({
  applicationId: z.string().min(1, 'applicationId is required'),
  expiryHours: z.number().min(1).max(336).optional().default(72),
});

sessionsRouter.post('/', async (req: Request, res: Response) => {
  const parse = createSessionSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'ValidationError', details: parse.error.format() });
    return;
  }

  try {
    const { session, interviewUrl } = await createInterviewSession({
      applicationId: parse.data.applicationId,
      expiryHours: parse.data.expiryHours,
    });

    res.status(201).json({
      message: 'Interview session created and invitation sent',
      session,
      interviewUrl,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'SessionCreationFailed', message: err.message });
  }
});

// GET /api/sessions/:token - Public interview session verification
sessionsRouter.get('/:token', async (req: Request, res: Response) => {
  const token = req.params.token as string;
  try {
    const session = await sessionStore.getSessionByToken(token);
    if (!session) {
      res.status(404).json({ error: 'NotFound', message: 'Interview session does not exist or invalid link token' });
      return;
    }

    const isValid = sessionStore.isSessionValid(session);
    if (!isValid) {
      res.status(410).json({
        error: 'SessionExpired',
        message: 'This interview link has expired. Please contact the hiring team for an extension.',
        session: { id: session.id, status: 'expired', expiresAt: session.expiresAt },
      });
      return;
    }

    const job = await dbStore.getJobById(session.jobId);
    const application = await dbStore.getApplicationById(session.applicationId);

    // If pending, mark as in_progress when candidate opens it
    if (session.status === 'pending') {
      await sessionStore.updateSessionStatus(session.id, 'in_progress');
      session.status = 'in_progress';
    }

    res.status(200).json({
      session,
      job,
      application,
      phases: job?.phases_config || [
        { type: 'mcq', order: 1, durationMinutes: 10, weight: 0.15 },
        { type: 'coding', order: 2, durationMinutes: 30, weight: 0.35 },
        { type: 'speaking', order: 3, durationMinutes: 15, weight: 0.20 },
        { type: 'scenario', order: 4, durationMinutes: 15, weight: 0.30 },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'SessionFetchFailed', message: err.message });
  }
});

// GET /api/sessions/application/:applicationId - Recruiter fetches session for application
sessionsRouter.get('/application/:applicationId', async (req: Request, res: Response) => {
  const applicationId = req.params.applicationId as string;
  try {
    const all = sessionStore.getAllSessions();
    const found = all.find((s) => s.applicationId === applicationId);
    if (!found) {
      res.status(404).json({ error: 'NotFound', message: 'No session found for this application' });
      return;
    }

    const report = sessionStore.getReport(found.id);
    const events = sessionStore.getProctoringEvents(found.id);

    res.status(200).json({ session: found, report, proctoringFlagsCount: events.length });
  } catch (err: any) {
    res.status(500).json({ error: 'SessionFetchFailed', message: err.message });
  }
});

// POST /api/sessions/:token/phase-result - Submit result for a specific phase
const phaseResultSchema = z.object({
  phaseType: z.enum(['mcq', 'coding', 'speaking', 'scenario']),
  rawAnswers: z.any(),
  subScores: z.record(z.string(), z.number()).default({}),
  weightedScore: z.number().min(0).max(100),
  aiEvaluation: z.string().optional(),
});

sessionsRouter.post('/:token/phase-result', async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const parse = phaseResultSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'ValidationError', details: parse.error.format() });
    return;
  }

  const session = await sessionStore.getSessionByToken(token);
  if (!session) {
    res.status(404).json({ error: 'NotFound', message: 'Session not found' });
    return;
  }

  try {
    sessionStore.addPhaseResult({
      sessionId: session.id,
      phaseType: parse.data.phaseType,
      rawAnswers: parse.data.rawAnswers,
      subScores: parse.data.subScores,
      weightedScore: parse.data.weightedScore,
      submittedAt: new Date().toISOString(),
      aiEvaluation: parse.data.aiEvaluation,
    });

    res.status(200).json({ message: 'Phase result saved successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'SavePhaseFailed', message: err.message });
  }
});

// POST /api/sessions/:token/complete - Final interview submission
sessionsRouter.post('/:token/complete', async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const session = await sessionStore.getSessionByToken(token);
  if (!session) {
    res.status(404).json({ error: 'NotFound', message: 'Session not found' });
    return;
  }

  try {
    const phaseResults = sessionStore.getPhaseResults(session.id);
    const proctoringEvents = sessionStore.getProctoringEvents(session.id);
    const job = await dbStore.getJobById(session.jobId);

    // Compute final holistic score with scoring agent
    const report = await scoringAgent({
      sessionId: session.id,
      applicationId: session.applicationId,
      jobTitle: session.jobTitle,
      requiredSkills: job?.required_skills || ['Software Engineering'],
      phaseResults,
      proctoringEvents,
    });

    sessionStore.setReport(session.id, report);
    await sessionStore.updateSessionStatus(session.id, 'completed');
    await dbStore.updateApplication(session.applicationId, {
      status: 'interview_completed',
    });

    // Send results notification email (async)
    sendResultsNotification(
      session.candidateEmail,
      session.candidateName,
      session.jobTitle,
      report.recommendation,
    ).catch((e) => console.warn('[SessionsRouter] Results email failed:', e.message));

    res.status(200).json({
      message: 'Interview completed and evaluated successfully',
      report,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'CompleteFailed', message: err.message });
  }
});

// GET /api/sessions/:token/report - Retrieve full report
sessionsRouter.get('/:token/report', async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const session = await sessionStore.getSessionByToken(token);
  if (!session) {
    res.status(404).json({ error: 'NotFound', message: 'Session not found' });
    return;
  }

  const report = sessionStore.getReport(session.id);
  const events = sessionStore.getProctoringEvents(session.id);
  const phaseResults = sessionStore.getPhaseResults(session.id);

  res.status(200).json({
    session,
    report: report || null,
    proctoringEvents: events,
    phaseResults,
  });
});
