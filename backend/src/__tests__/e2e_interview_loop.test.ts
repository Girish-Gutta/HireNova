import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('HireNova Full End-to-End Interview Journey', () => {
  const app = createApp();

  it('exercises the complete candidate and recruiter lifecycle', async () => {
    // 1. Fetch available jobs
    const jobsRes = await request(app).get('/api/jobs');
    expect(jobsRes.status).toBe(200);
    const job = jobsRes.body.jobs[0];
    expect(job).toBeDefined();

    // 2. Candidate applies with resume
    const applyRes = await request(app)
      .post('/api/applications')
      .send({
        jobId: job.id,
        candidateId: 'cand-e2e-001',
        candidateName: 'Jordan Lee',
        candidateEmail: 'jordan.lee@example.com',
        resumeUrl: 'https://storage.hirenova.local/resumes/jordan_resume.pdf',
        resumeText: 'Full Stack Engineer with 5+ years experience in TypeScript, React, Next.js, Node.js, and PostgreSQL. Built scalable distributed systems.',
      });

    expect(applyRes.status).toBe(201);
    const application = applyRes.body.application;
    expect(application.match_score).toBeGreaterThanOrEqual(50);
    expect(application.status).toBe('matched');

    // 3. Recruiter creates interview session (Scheduling Agent)
    const sessionRes = await request(app)
      .post('/api/sessions')
      .send({
        applicationId: application.id,
        expiryHours: 72,
      });

    expect(sessionRes.status).toBe(201);
    const token = sessionRes.body.session.linkToken;
    const sessionId = sessionRes.body.session.id;
    expect(token).toBeDefined();

    // 4. Candidate verifies token
    const verifyRes = await request(app).get(`/api/sessions/${token}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.session.id).toBe(sessionId);
    expect(verifyRes.body.job.id).toBe(job.id);

    // 5. Question Generation Agent produces questions for all 4 phases
    const mcqQ = await request(app)
      .post('/api/agents/generate-questions')
      .send({ sessionId, phaseType: 'mcq' });
    expect(mcqQ.status).toBe(200);
    expect(mcqQ.body.questions.length).toBeGreaterThan(0);

    const codingQ = await request(app)
      .post('/api/agents/generate-questions')
      .send({ sessionId, phaseType: 'coding' });
    expect(codingQ.status).toBe(200);
    expect(codingQ.body.questions.length).toBeGreaterThan(0);

    const speakingQ = await request(app)
      .post('/api/agents/generate-questions')
      .send({ sessionId, phaseType: 'speaking' });
    expect(speakingQ.status).toBe(200);

    const scenarioQ = await request(app)
      .post('/api/agents/generate-questions')
      .send({ sessionId, phaseType: 'scenario' });
    expect(scenarioQ.status).toBe(200);

    // 6. Candidate executes code in sandbox
    const codeExecRes = await request(app)
      .post('/api/agents/execute-code')
      .send({
        language: 'javascript',
        sourceCode: 'function solve(arr) { return arr.reverse(); } console.log(solve([1,2,3]));',
      });
    expect(codeExecRes.status).toBe(200);
    expect(codeExecRes.body.result).toBeDefined();

    // 7. Proctoring agent logs events
    const tabSwitchRes = await request(app)
      .post('/api/proctoring/events')
      .send({
        sessionId,
        type: 'tab_switch',
        severity: 'medium',
        metadata: { durationSeconds: 3 },
      });
    expect(tabSwitchRes.status).toBe(200);

    // 8. Submit results for each phase
    await request(app)
      .post(`/api/sessions/${token}/phase-result`)
      .send({
        phaseType: 'mcq',
        rawAnswers: { 'mcq-1': 'Option A' },
        weightedScore: 85,
      });

    await request(app)
      .post(`/api/sessions/${token}/phase-result`)
      .send({
        phaseType: 'coding',
        rawAnswers: { code: 'function solve() { return true; }' },
        weightedScore: 90,
      });

    await request(app)
      .post(`/api/sessions/${token}/phase-result`)
      .send({
        phaseType: 'speaking',
        rawAnswers: { transcript: 'I designed the architectural layer to minimize latency.' },
        weightedScore: 80,
      });

    await request(app)
      .post(`/api/sessions/${token}/phase-result`)
      .send({
        phaseType: 'scenario',
        rawAnswers: { answer: 'First I isolate the problem, then rollback, and update status page.' },
        weightedScore: 85,
      });

    // 9. Complete interview & trigger scoring agent
    const completeRes = await request(app)
      .post(`/api/sessions/${token}/complete`)
      .send();

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.report).toBeDefined();
    expect(completeRes.body.report.totalScore).toBeGreaterThanOrEqual(60);
    expect(['strong_hire', 'hire', 'maybe', 'no_hire']).toContain(completeRes.body.report.recommendation);

    // 10. Recruiter retrieves report
    const reportRes = await request(app).get(`/api/sessions/${token}/report`);
    expect(reportRes.status).toBe(200);
    expect(reportRes.body.report).toBeDefined();
    expect(reportRes.body.proctoringEvents.length).toBeGreaterThanOrEqual(1);
  });
});
