import { Router, Request, Response } from 'express';
import { matchResumeToJD } from '../agents/matchingAgent.js';
import { generateInterviewQuestions } from '../agents/questionGenerator.js';
import { scoringAgent } from '../agents/scoringAgent.js';
import { executeCodeInSandbox } from '../services/codeSandbox.js';
import { sessionStore } from '../services/sessionStore.js';
import { dbStore } from '../services/dbStore.js';
import { z } from 'zod';

export const agentsRouter = Router();

// POST /api/agents/match - Test or run matching agent
const matchSchema = z.object({
  jobId: z.string().optional(),
  resumeText: z.string().min(1, 'Resume text is required'),
  jobDescription: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  seniority: z.string().optional(),
  jobTitle: z.string().optional(),
});

agentsRouter.post('/match', async (req: Request, res: Response) => {
  const parse = matchSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'ValidationError', details: parse.error.format() });
    return;
  }

  const { jobId, resumeText } = parse.data;
  let { jobDescription, requiredSkills, seniority, jobTitle } = parse.data;

  if (jobId) {
    const job = await dbStore.getJobById(jobId);
    if (!job) {
      res.status(404).json({ error: 'NotFound', message: 'Job not found' });
      return;
    }
    jobDescription = jobDescription || job.description;
    requiredSkills = requiredSkills || job.required_skills;
    seniority = seniority || job.seniority;
    jobTitle = jobTitle || job.title;
  }

  try {
    const result = await matchResumeToJD({
      resumeText,
      jobDescription: jobDescription || 'General Software Engineering role',
      requiredSkills: requiredSkills || ['TypeScript', 'Node.js', 'Problem Solving'],
      seniority: seniority || 'Mid',
      jobTitle: jobTitle || 'Software Engineer',
    });

    res.status(200).json({ result });
  } catch (err: any) {
    res.status(500).json({ error: 'MatchingFailed', message: err.message });
  }
});

// POST /api/agents/generate-questions - Generate questions for session or phase
const questionGenSchema = z.object({
  sessionId: z.string().optional(),
  phaseType: z.enum(['mcq', 'coding', 'speaking', 'scenario']),
  questionCount: z.number().min(1).max(10).optional().default(3),
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  seniority: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
});

agentsRouter.post('/generate-questions', async (req: Request, res: Response) => {
  const parse = questionGenSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'ValidationError', details: parse.error.format() });
    return;
  }

  const { sessionId, phaseType, questionCount } = parse.data;
  let jobTitle = parse.data.jobTitle || 'Software Engineer';
  let jobDescription = parse.data.jobDescription || 'Full Stack development role';
  let requiredSkills = parse.data.requiredSkills || ['TypeScript', 'JavaScript'];
  let seniority = parse.data.seniority || 'Mid';
  let focusAreas = parse.data.focusAreas || ['Problem Solving', 'System Design'];
  let difficulty = parse.data.difficulty || 'Mid';

  // If sessionId provided, look up cached questions first, or fetch job context
  if (sessionId) {
    const cached = sessionStore.getQuestions(sessionId, phaseType);
    if (cached && cached.length > 0) {
      res.status(200).json({ questions: cached, cached: true });
      return;
    }

    const session = await sessionStore.getSessionById(sessionId);
    if (session) {
      jobTitle = session.jobTitle || jobTitle;
      const job = await dbStore.getJobById(session.jobId);
      if (job) {
        jobDescription = job.description;
        requiredSkills = job.required_skills;
        seniority = job.seniority;
        difficulty = job.seniority;
      }
    }
  }

  try {
    const questions = await generateInterviewQuestions({
      phaseType,
      jobTitle,
      jobDescription,
      requiredSkills,
      seniority,
      focusAreas,
      difficulty,
      questionCount: phaseType === 'coding' ? 1 : phaseType === 'mcq' ? 4 : 2,
    });

    if (sessionId) {
      sessionStore.setQuestions(sessionId, phaseType, questions);
    }

    res.status(200).json({ questions, cached: false });
  } catch (err: any) {
    res.status(500).json({ error: 'QuestionGenFailed', message: err.message });
  }
});

// POST /api/agents/execute-code - Code execution sandbox
const codeExecSchema = z.object({
  language: z.string().default('javascript'),
  sourceCode: z.string().min(1, 'Source code cannot be empty'),
  stdin: z.string().optional(),
});

agentsRouter.post('/execute-code', async (req: Request, res: Response) => {
  const parse = codeExecSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'ValidationError', details: parse.error.format() });
    return;
  }

  try {
    const result = await executeCodeInSandbox(parse.data);
    res.status(200).json({ result });
  } catch (err: any) {
    res.status(500).json({ error: 'ExecutionFailed', message: err.message });
  }
});

// POST /api/agents/score - Evaluate interview session
agentsRouter.post('/score', async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    res.status(400).json({ error: 'BadRequest', message: 'sessionId is required' });
    return;
  }

  const session = await sessionStore.getSessionById(sessionId);
  if (!session) {
    res.status(404).json({ error: 'NotFound', message: 'Session not found' });
    return;
  }

  const phaseResults = sessionStore.getPhaseResults(sessionId);
  const proctoringEvents = sessionStore.getProctoringEvents(sessionId);
  const job = await dbStore.getJobById(session.jobId);

  try {
    const report = await scoringAgent({
      sessionId,
      applicationId: session.applicationId,
      jobTitle: session.jobTitle,
      requiredSkills: job?.required_skills || ['Software Engineering'],
      phaseResults,
      proctoringEvents,
    });

    sessionStore.setReport(sessionId, report);
    await sessionStore.updateSessionStatus(sessionId, 'completed');
    await dbStore.updateApplication(session.applicationId, {
      status: 'interview_completed',
    });

    res.status(200).json({ report });
  } catch (err: any) {
    res.status(500).json({ error: 'ScoringFailed', message: err.message });
  }
});
