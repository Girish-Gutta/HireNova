import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now > record.resetAt) {
      requests.set(ip, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    if (record.count >= options.maxRequests) {
      res.status(429).json({
        error: 'TooManyRequests',
        message: options.message || 'Rate limit exceeded. Please wait a moment before retrying.',
        retryAfterMs: record.resetAt - now,
      });
      return;
    }

    record.count++;
    next();
  };
}
