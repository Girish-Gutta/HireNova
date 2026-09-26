import { Router, Request, Response } from 'express';
import { checkSupabaseConnection } from '../lib/supabase.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const dbHealth = await checkSupabaseConnection();

  const responseTimeMs = Date.now() - startTime;

  res.status(200).json({
    status: 'ok',
    service: 'hirenova-backend',
    version: '0.1.0',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    responseTimeMs,
    services: {
      database: {
        provider: 'supabase',
        connected: dbHealth.connected,
        message: dbHealth.message,
      },
      aiEngine: {
        provider: 'gemini',
        configured: Boolean(env.GEMINI_API_KEY && !env.GEMINI_API_KEY.includes('placeholder')),
      },
      codeSandbox: {
        provider: 'piston',
        configured: Boolean(env.PISTON_API_URL),
        url: env.PISTON_API_URL,
      },
    },
  });
});
