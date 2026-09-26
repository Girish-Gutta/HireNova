'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { 
  Sparkles, 
  Building2, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Mail, 
  Lock, 
  User,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('candidate');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide an email address');
      return;
    }

    try {
      if (mode === 'signup') {
        if (!fullName) {
          setError('Please provide your full name');
          return;
        }
        if (role === 'recruiter' && !companyName) {
          setError('Please provide your company or organization name');
          return;
        }
        await signup(email, fullName, role, companyName);
      } else {
        await login(email, role, role === 'recruiter' ? (companyName || 'HireNova Partner') : undefined);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setError(null);
    if (demoRole === 'recruiter') {
      await login('recruiter@acmepartners.com', 'recruiter', 'Acme Systems');
    } else {
      await login('candidate.alex@hirenova.dev', 'candidate');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 bg-[#0B0F19]">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">
        {/* Logo and Brand */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">HireNova</span>
          </Link>
          <p className="text-xs text-slate-400">
            Autonomous Multi-Phase AI Interview & Evaluation Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Sign In vs Sign Up Tab */}
          <div className="flex p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Selector Toggle */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-medium text-slate-400 block">Select Portal Access</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  role === 'candidate'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${role === 'candidate' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-semibold">Candidate</div>
                  <div className="text-[10px] opacity-75">Take Interviews</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  role === 'recruiter'
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'recruiter' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-semibold">Recruiter / HR</div>
                  <div className="text-[10px] opacity-75">Post & Screen</div>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'recruiter' && (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Company Name</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                {role === 'recruiter' ? 'Work Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'recruiter' ? 'name@company.com' : 'you@domain.com'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                role === 'recruiter'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {mode === 'signup' ? 'Create Account & Continue' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Instant Demo Access
              </span>
              <span className="text-[10px] text-slate-500">Bypass credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('candidate')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/80 text-[11px] font-medium text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3 h-3" /> Candidate Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('recruiter')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/80 text-[11px] font-medium text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3 h-3" /> Recruiter Demo
              </button>
            </div>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
          <span>Role-Guarded Supabase Authentication & RLS Policies</span>
        </div>
      </div>
    </div>
  );
}
