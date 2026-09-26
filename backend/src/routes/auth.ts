import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const authRouter = Router();

// Endpoint to retrieve currently authenticated user profile
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user,
  });
});

// Protected test endpoint for recruiter role
authRouter.get('/recruiter-only', requireAuth, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Authorized recruiter access verified',
    user: req.user,
  });
});

// Protected test endpoint for candidate role
authRouter.get('/candidate-only', requireAuth, requireRole(['candidate', 'admin']), (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Authorized candidate access verified',
    user: req.user,
  });
});
