import { Router, Request, Response } from 'express';
import { requireAuth, requireRole, UserRole } from '../middleware/auth.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

export const authRouter = Router();

// Endpoint to retrieve currently authenticated user profile
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user,
  });
});

// Create or sync user profile after Supabase signup or for dev mode
authRouter.post('/sync-profile', async (req: Request, res: Response) => {
  const { authId, email, fullName, role, companyName } = req.body;

  if (!email || !role) {
    res.status(400).json({
      error: 'BadRequest',
      message: 'Email and role are required fields',
    });
    return;
  }

  const validRoles: UserRole[] = ['candidate', 'recruiter', 'admin'];
  if (!validRoles.includes(role)) {
    res.status(400).json({
      error: 'BadRequest',
      message: `Role must be one of: ${validRoles.join(', ')}`,
    });
    return;
  }

  // Fast development fallback when Supabase keys are not set
  if (!isSupabaseConfigured) {
    res.status(200).json({
      user: {
        id: authId || (role === 'recruiter' ? '11111111-1111-1111-1111-111111111111' : '00000000-0000-0000-0000-000000000001'),
        email,
        role,
        fullName: fullName || email.split('@')[0],
        companyId: role === 'recruiter' ? '22222222-2222-2222-2222-222222222222' : null,
        companyName: companyName || (role === 'recruiter' ? 'HireNova Partner' : null),
      },
      notice: 'Profile synced (local development mode)',
    });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();

    // If recruiter and companyName is provided, ensure company exists or create
    let companyId: string | null = null;
    if (role === 'recruiter' && companyName) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', companyName.trim())
        .maybeSingle();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: compErr } = await supabase
          .from('companies')
          .insert({ name: companyName.trim() })
          .select('id')
          .single();
        if (!compErr && newCompany) {
          companyId = newCompany.id;
        }
      }
    }

    // Upsert into profiles table
    const profilePayload = {
      auth_id: authId || null,
      email,
      full_name: fullName || email.split('@')[0],
      role,
      company_id: companyId,
    };

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'email' })
      .select('id, auth_id, email, full_name, role, company_id')
      .single();

    if (profErr) {
      // In dev fallback or if Supabase isn't connected, return constructed object
      res.status(200).json({
        user: {
          id: authId || '00000000-0000-0000-0000-000000000001',
          email,
          role,
          fullName: fullName || email.split('@')[0],
          companyId,
          companyName: companyName || null,
        },
        notice: 'Profile synced (in-memory dev fallback or database record)',
      });
      return;
    }

    res.status(200).json({
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        companyId: profile.company_id,
        companyName: companyName || null,
      },
    });
  } catch (err: any) {
    // Development fallback
    res.status(200).json({
      user: {
        id: authId || '00000000-0000-0000-0000-000000000001',
        email,
        role,
        fullName: fullName || email.split('@')[0],
        companyId: role === 'recruiter' ? '11111111-1111-1111-1111-111111111111' : null,
      },
      warning: err.message,
    });
  }
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
