import { Router, Request, Response } from 'express';
import { sessionStore } from '../services/sessionStore.js';
import { z } from 'zod';

export const proctoringRouter = Router();

const eventSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  type: z.enum(['tab_switch', 'copy_paste', 'webcam_lost', 'face_absent', 'multiple_faces', 'browser_blur']),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  timestamp: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// POST /api/proctoring/events - Client streams proctoring violation event
proctoringRouter.post('/events', async (req: Request, res: Response) => {
  const parse = eventSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'ValidationError', details: parse.error.format() });
    return;
  }

  const { sessionId, type, severity, timestamp, metadata } = parse.data;

  try {
    sessionStore.addProctoringEvent({
      sessionId,
      type,
      severity,
      timestamp: timestamp || new Date().toISOString(),
      metadata,
    });

    res.status(200).json({ success: true, message: 'Event logged' });
  } catch (err: any) {
    res.status(500).json({ error: 'LogEventFailed', message: err.message });
  }
});

// GET /api/proctoring/events/:sessionId - Get proctoring events for session
proctoringRouter.get('/events/:sessionId', async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  try {
    const events = sessionStore.getProctoringEvents(sessionId);
    res.status(200).json({ events, count: events.length });
  } catch (err: any) {
    res.status(500).json({ error: 'FetchEventsFailed', message: err.message });
  }
});
