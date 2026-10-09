import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { jobsRouter } from './routes/jobs.js';
import { applicationsRouter } from './routes/applications.js';
import { sessionsRouter } from './routes/sessions.js';
import { agentsRouter } from './routes/agents.js';
import { proctoringRouter } from './routes/proctoring.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { env } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API rate limiter
  app.use('/api', createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 200,
  }));

  // Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/agents', agentsRouter);
  app.use('/api/proctoring', proctoringRouter);

  // Root welcome
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'HireNova API',
      status: 'active',
      docs: '/api/health',
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'NotFound',
      message: 'The requested resource was not found on this server.',
    });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      error: err.name || 'InternalServerError',
      message: err.message || 'An unexpected error occurred.',
    });
  });

  return app;
};
