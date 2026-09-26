import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../lib/supabase.js';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  companyId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Development bypass / mock header for fast local testing
  const devRole = req.headers['x-mock-role'] as UserRole | undefined;
  const devUserId = req.headers['x-mock-user-id'] as string | undefined;

  if (process.env.NODE_ENV !== 'production' && devRole) {
    req.user = {
      id: devUserId || '00000000-0000-0000-0000-000000000001',
      email: `${devRole}@hirenova.local`,
      role: devRole,
      fullName: `Test ${devRole.toUpperCase()}`,
      companyId: devRole === 'recruiter' ? '11111111-1111-1111-1111-111111111111' : null,
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header with Bearer token',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      });
      return;
    }

    // Fetch user profile from database to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, full_name, company_id')
      .eq('auth_id', user.id)
      .single();

    req.user = {
      id: profile?.id || user.id,
      email: user.email || '',
      role: (profile?.role as UserRole) || 'candidate',
      fullName: profile?.full_name || user.user_metadata?.full_name,
      companyId: profile?.company_id || null,
    };

    next();
  } catch (err: any) {
    res.status(500).json({
      error: 'AuthenticationError',
      message: `Failed to verify authentication: ${err.message}`,
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required before checking permissions',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
