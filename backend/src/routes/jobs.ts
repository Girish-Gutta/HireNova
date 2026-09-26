import { Router, Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

export const jobsRouter = Router();

const createJobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  department: z.string().default('Engineering'),
  description: z.string().min(20, 'Job description must be at least 20 characters'),
  requiredSkills: z.array(z.string()).default([]),
  seniority: z.string().default('Mid'),
  companyName: z.string().optional(),
  phasesConfig: z.array(z.object({
    type: z.enum(['mcq', 'coding', 'speaking', 'listening', 'scenario']),
    order: z.number(),
    durationMinutes: z.number().min(1),
    weight: z.number().min(0).max(1),
  })).default([
    { type: 'mcq', order: 1, durationMinutes: 10, weight: 0.15 },
    { type: 'coding', order: 2, durationMinutes: 30, weight: 0.35 },
    { type: 'speaking', order: 3, durationMinutes: 15, weight: 0.20 },
    { type: 'scenario', order: 4, durationMinutes: 15, weight: 0.30 },
  ]),
});

// GET /api/jobs - List all active jobs
jobsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const jobs = await dbStore.getJobs();
    res.status(200).json({ jobs });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToFetchJobs', message: err.message });
  }
});

// GET /api/jobs/:id - Get a single job
jobsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const job = await dbStore.getJobById(req.params.id as string);
    if (!job) {
      res.status(404).json({ error: 'NotFound', message: 'Job posting not found' });
      return;
    }
    res.status(200).json({ job });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToFetchJob', message: err.message });
  }
});

// POST /api/jobs - Recruiter creates a job
jobsRouter.post('/', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  const parseResult = createJobSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'ValidationError',
      details: parseResult.error.format(),
    });
    return;
  }

  const { title, department, description, requiredSkills, seniority, phasesConfig, companyName } = parseResult.data;

  try {
    const createdJob = await dbStore.createJob({
      company_id: req.user?.companyId || '22222222-2222-2222-2222-222222222222',
      company_name: companyName || req.user?.fullName || 'Acme Systems',
      created_by: req.user?.id,
      title,
      department,
      description,
      required_skills: requiredSkills,
      seniority,
      phases_config: phasesConfig,
      is_active: true,
    });

    res.status(201).json({
      message: 'Job posting created successfully',
      job: createdJob,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToCreateJob', message: err.message });
  }
});

// PUT /api/jobs/:id - Recruiter updates a job
jobsRouter.put('/:id', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const updated = await dbStore.updateJob(req.params.id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: 'Job not found' });
      return;
    }
    res.status(200).json({ message: 'Job updated', job: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToUpdateJob', message: err.message });
  }
});

// DELETE /api/jobs/:id - Recruiter deletes a job
jobsRouter.delete('/:id', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const deleted = await dbStore.deleteJob(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ error: 'NotFound', message: 'Job not found' });
      return;
    }
    res.status(200).json({ message: 'Job posting deactivated' });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToDeleteJob', message: err.message });
  }
});
