import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

const isConfigured =
  env.SUPABASE_URL &&
  !env.SUPABASE_URL.includes('placeholder') &&
  env.SUPABASE_ANON_KEY &&
  !env.SUPABASE_ANON_KEY.includes('placeholder');

if (isConfigured) {
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    // Returns dummy client or throws if invoked in strict mode
    return createClient(
      env.SUPABASE_URL || 'https://placeholder.supabase.co',
      env.SUPABASE_ANON_KEY || 'placeholder'
    );
  }
  return supabaseClient;
};

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdminClient) {
    return createClient(
      env.SUPABASE_URL || 'https://placeholder.supabase.co',
      env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );
  }
  return supabaseAdminClient;
};

export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
}> => {
  if (!isConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials are not yet configured (using development placeholder).',
    };
  }

  try {
    const client = getSupabaseAdmin();
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        message: `Supabase query responded with error: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Supabase connected successfully.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`,
    };
  }
};
