import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('HireNova Multi-Agent & Interview Sessions API (Phases 3-5)', () => {
  const app = createApp();
  let createdAppId = '';
  let sessionToken = '';
  let sessionId = '';

  it('POST /api/agents/match evaluates candidate resume against JD', async () => {
    const res = await request(app)
      .post('/api/agents/match')
      .send({
        jobTitle: 'Senior Full Stack TypeScript Engineer',
        jobDescription: 'Seeking expert in TypeScript, Next.js, Node.js, and PostgreSQL for AI web applications.',
        requiredSkills: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL'],
        seniority: 'Senior',
        resumeText: 'Experienced Software Engineer with 6 years building Next.js and Node.js web applications in TypeScript and PostgreSQL.',
      });

    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
    expect(typeof res.body.result.matchScore).toBe('number');
    expect(res.body.result.matchScore).toBeGreaterThanOrEqual(40);
    expect(Array.isArray(res.body.result.matchedSkills)).toBe(true);
    expect(res.body.result.suggestedPlan).toBeDefined();
    expect(res.body.result.suggestedPlan.phases.length).toBeGreaterThan(0);
  });

  it('POST /api/applications automatically runs matching agent', async () => {
    // Get a job first
    const jobsRes = await request(app).get('/api/jobs');
    const targetJob = jobsRes.body.jobs[0];

    const res = await request(app)
      .post('/api/applications')
      .send({
        jobId: targetJob.id,
        candidateId: 'test-candidate-123',
        candidateName: 'Jane Doe',
        candidateEmail: 'jane.doe@example.com',
        resumeUrl: 'https://example.com/resumes/jane_doe.pdf',
        resumeText: 'Senior developer proficient in TypeScript, React, Next.js, and distributed backend architectures.',
      });

    expect(res.status).toBe(201);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.match_score).toBeDefined();
    expect(typeof res.body.application.match_score).toBe('number');
    createdAppId = res.body.application.id;
  });

  it('POST /api/sessions creates a secure interview session and token', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        applicationId: createdAppId,
        expiryHours: 48,
      });

    expect(res.status).toBe(201);
    expect(res.body.session).toBeDefined();
    expect(res.body.session.linkToken).toBeDefined();
    expect(res.body.interviewUrl).toContain(res.body.session.linkToken);
    sessionToken = res.body.session.linkToken;
    sessionId = res.body.session.id;
  });

  it('GET /api/sessions/:token returns valid session, job, and phase configs', async () => {
    const res = await request(app).get(`/api/sessions/${sessionToken}`);

    expect(res.status).toBe(200);
    expect(res.body.session.id).toBe(sessionId);
    expect(res.body.job).toBeDefined();
    expect(Array.isArray(res.body.phases)).toBe(true);
  });

  it('POST /api/agents/generate-questions produces questions for interview phases', async () => {
    const mcqRes = await request(app)
      .post('/api/agents/generate-questions')
      .send({
        sessionId,
        phaseType: 'mcq',
        questionCount: 3,
      });

    expect(mcqRes.status).toBe(200);
    expect(Array.isArray(mcqRes.body.questions)).toBe(true);
    expect(mcqRes.body.questions.length).toBeGreaterThan(0);
    expect(mcqRes.body.questions[0].type).toBe('mcq');

    const codingRes = await request(app)
      .post('/api/agents/generate-questions')
      .send({
        sessionId,
        phaseType: 'coding',
        questionCount: 1,
      });

    expect(codingRes.status).toBe(200);
    expect(codingRes.body.questions[0].type).toBe('coding');
  });

  it('POST /api/agents/execute-code runs code in sandbox', async () => {
    const res = await request(app)
      .post('/api/agents/execute-code')
      .send({
        language: 'javascript',
        sourceCode: 'function solve() { return 42; } console.log(solve());',
      });

    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
    expect(res.body.result.output).toBeDefined();
  });

  it('POST /api/proctoring/events logs violation events', async () => {
    const res = await request(app)
      .post('/api/proctoring/events')
      .send({
        sessionId,
        type: 'tab_switch',
        severity: 'medium',
        metadata: { durationMs: 2400 },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/proctoring/events/${sessionId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.events.length).toBeGreaterThanOrEqual(1);
    expect(getRes.body.events[0].type).toBe('tab_switch');
  });

  it('POST /api/sessions/:token/phase-result records candidate answers', async () => {
    const res = await request(app)
      .post(`/api/sessions/${sessionToken}/phase-result`)
      .send({
        phaseType: 'mcq',
        rawAnswers: { 'mcq-1': 'O(log n)', 'mcq-2': 'PUT' },
        subScores: { accuracy: 90 },
        weightedScore: 90,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('saved');
  });

  it('POST /api/sessions/:token/complete finalizes interview and generates score report', async () => {
    const res = await request(app)
      .post(`/api/sessions/${sessionToken}/complete`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.report).toBeDefined();
    expect(typeof res.body.report.totalScore).toBe('number');
    expect(['strong_hire', 'hire', 'maybe', 'no_hire']).toContain(res.body.report.recommendation);
    expect(Array.isArray(res.body.report.strengths)).toBe(true);
  });
});
