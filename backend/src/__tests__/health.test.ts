import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('HireNova Backend Foundation API', () => {
  const app = createApp();

  it('GET / should return active API status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('HireNova API');
    expect(res.body.status).toBe('active');
  });

  it('GET /api/health should return ok status and service diagnostics', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('hirenova-backend');
    expect(res.body.services).toBeDefined();
    expect(res.body.services.database).toBeDefined();
  });

  it('GET /api/auth/me without auth header should return 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /api/auth/recruiter-only with mock recruiter header should succeed', async () => {
    const res = await request(app)
      .get('/api/auth/recruiter-only')
      .set('x-mock-role', 'recruiter');
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('recruiter');
  });

  it('GET /api/auth/recruiter-only with mock candidate header should return 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/auth/recruiter-only')
      .set('x-mock-role', 'candidate');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/auth/candidate-only with mock candidate header should succeed', async () => {
    const res = await request(app)
      .get('/api/auth/candidate-only')
      .set('x-mock-role', 'candidate');
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('candidate');
  });

  it('POST /api/auth/sync-profile should validate required fields', async () => {
    const res = await request(app)
      .post('/api/auth/sync-profile')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BadRequest');
  });

  it('POST /api/auth/sync-profile should return synced recruiter user payload', async () => {
    const res = await request(app)
      .post('/api/auth/sync-profile')
      .send({
        email: 'recruiter@acme.com',
        role: 'recruiter',
        fullName: 'Jane Recruiter',
        companyName: 'Acme Corp',
      });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('recruiter');
    expect(res.body.user.email).toBe('recruiter@acme.com');
  });
});
