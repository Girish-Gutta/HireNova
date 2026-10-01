import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('HireNova Jobs & Applications API (Phase 2)', () => {
  const app = createApp();
  let createdJobId = '';

  it('GET /api/jobs should return a list of active jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.jobs)).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
  });

  it('POST /api/jobs without recruiter role should be rejected', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('x-mock-role', 'candidate')
      .send({
        title: 'Unauthorized Job',
        description: 'This job should not be allowed to be posted by a candidate.',
      });
    expect(res.status).toBe(403);
  });

  it('POST /api/jobs as recruiter should create a new job opening', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('x-mock-role', 'recruiter')
      .send({
        title: 'Principal Backend Architect',
        department: 'Infrastructure',
        description: 'Design and deploy scalable AI-driven interview orchestration engines with distributed microservices.',
        requiredSkills: ['Node.js', 'PostgreSQL', 'Docker', 'System Design'],
        seniority: 'Lead',
        phasesConfig: [
          { type: 'mcq', order: 1, durationMinutes: 15, weight: 0.2 },
          { type: 'coding', order: 2, durationMinutes: 40, weight: 0.5 },
          { type: 'scenario', order: 3, durationMinutes: 20, weight: 0.3 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.title).toBe('Principal Backend Architect');
    expect(res.body.job.phases_config.length).toBe(3);
    createdJobId = res.body.job.id;
  });

  it('GET /api/jobs/:id should return the created job', async () => {
    const res = await request(app).get(`/api/jobs/${createdJobId}`);
    expect(res.status).toBe(200);
    expect(res.body.job.id).toBe(createdJobId);
    expect(res.body.job.title).toBe('Principal Backend Architect');
  });

  it('POST /api/applications/upload-resume should handle resume upload', async () => {
    const res = await request(app)
      .post('/api/applications/upload-resume')
      .send({
        fileName: 'resume_alex_developer.pdf',
        fileContent: 'data:application/pdf;base64,JVBERi0xLjUKJ...',
        mimeType: 'application/pdf',
      });

    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
    expect(res.body.fileName).toContain('resume_alex_developer.pdf');
  });

  it('POST /api/applications should record a candidate application', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({
        jobId: createdJobId,
        candidateId: '00000000-0000-0000-0000-000000000001',
        candidateName: 'Alex Morgan',
        candidateEmail: 'alex@hirenova.dev',
        resumeUrl: 'https://storage.hirenova.local/resumes/alex_resume.pdf',
        resumeText: 'Alex Morgan - 6 years experience in Node.js, TypeScript, PostgreSQL, and Cloud Architecture.',
      });

    expect(res.status).toBe(201);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.job_id).toBe(createdJobId);
    expect(['submitted', 'matched']).toContain(res.body.application.status);
  });

  it('GET /api/applications/candidate/:id should return candidate applications', async () => {
    const res = await request(app).get('/api/applications/candidate/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applications)).toBe(true);
    expect(res.body.applications.length).toBeGreaterThan(0);
  });

  it('GET /api/applications/job/:jobId should return applicants for recruiter', async () => {
    const res = await request(app).get(`/api/applications/job/${createdJobId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applications)).toBe(true);
    expect(res.body.applications.length).toBe(1);
    expect(res.body.applications[0].candidate_name).toBe('Alex Morgan');
  });
});
