import { Router, Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { requireAuth } from '../middleware/auth.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';
import { z } from 'zod';

export const applicationsRouter = Router();

const applySchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  candidateId: z.string().min(1, 'Candidate ID is required'),
  candidateName: z.string().optional(),
  candidateEmail: z.string().optional(),
  resumeUrl: z.string().min(1, 'Resume URL or reference is required'),
  resumeText: z.string().optional(),
});

// Resume upload endpoint (accepts base64 or raw file payload)
applicationsRouter.post('/upload-resume', async (req: Request, res: Response) => {
  const { fileName, fileContent, mimeType } = req.body;

  if (!fileName || !fileContent) {
    res.status(400).json({
      error: 'BadRequest',
      message: 'fileName and fileContent (base64 or text) are required',
    });
    return;
  }

  const cleanName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      // Ensure 'resumes' bucket exists or upload
      const buffer = Buffer.from(fileContent.replace(/^data:.*,/, ''), 'base64');
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(cleanName, buffer, {
          contentType: mimeType || 'application/pdf',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(cleanName);
        res.status(200).json({
          url: publicUrlData.publicUrl,
          fileName: cleanName,
          storageProvider: 'supabase-storage',
        });
        return;
      }
    }

    // In dev mode / fallback: return simulated secure URL
    const simulatedUrl = `https://storage.hirenova.local/resumes/${cleanName}`;
    res.status(200).json({
      url: simulatedUrl,
      fileName: cleanName,
      storageProvider: 'local-dev-store',
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'UploadFailed',
      message: err.message,
    });
  }
});

// POST /api/applications - Candidate submits application
applicationsRouter.post('/', async (req: Request, res: Response) => {
  const parseResult = applySchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'ValidationError',
      details: parseResult.error.format(),
    });
    return;
  }

  const { jobId, candidateId, candidateName, candidateEmail, resumeUrl, resumeText } = parseResult.data;

  try {
    // Verify job exists
    const job = await dbStore.getJobById(jobId);
    if (!job) {
      res.status(404).json({ error: 'NotFound', message: 'Job posting does not exist' });
      return;
    }

    const application = await dbStore.createApplication({
      job_id: jobId,
      candidate_id: candidateId,
      candidate_name: candidateName || 'Candidate',
      candidate_email: candidateEmail || 'candidate@hirenova.local',
      resume_url: resumeUrl,
      resume_text: resumeText || '',
      match_score: null,
      status: 'submitted',
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      jobTitle: job.title,
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'FailedToSubmitApplication',
      message: err.message,
    });
  }
});

// GET /api/applications/candidate/:candidateId - Candidate applications
applicationsRouter.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const applications = await dbStore.getApplicationsByCandidate(req.params.candidateId as string);
    res.status(200).json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToFetchApplications', message: err.message });
  }
});

// GET /api/applications/job/:jobId - Recruiter views applicants for a job
applicationsRouter.get('/job/:jobId', async (req: Request, res: Response) => {
  try {
    const applications = await dbStore.getApplicationsByJob(req.params.jobId as string);
    res.status(200).json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToFetchJobApplications', message: err.message });
  }
});

// GET /api/applications - Recruiter views all applications
applicationsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const applications = await dbStore.getAllApplications();
    res.status(200).json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: 'FailedToFetchAllApplications', message: err.message });
  }
});
