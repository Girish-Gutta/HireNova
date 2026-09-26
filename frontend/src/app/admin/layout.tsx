'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Sparkles, 
  LogOut, 
  Building2, 
  ArrowLeftRight,
  ShieldAlert
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Job Postings', href: '/admin/jobs', icon: Briefcase },
  { name: 'Applicants & Screenings', href: '/admin/candidates', icon: Users },
  { name: 'AI Interview Reports', href: '/admin/reports', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, switchRole } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
      <div className="min-h-screen flex bg-[#0B0F19] text-white">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between shrink-0">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-slate-800/60">
              <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    HireNova
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      HR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Recruiter Portal</div>
                </div>
              </Link>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 mb-2 tracking-wider">
                Recruitment Operations
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile & actions footer */}
          <div className="p-4 border-t border-slate-800/60 space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold uppercase">
                  {user?.fullName?.charAt(0) || 'R'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{user?.fullName}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                    <Building2 className="w-2.5 h-2.5" />
                    {user?.companyName || 'HireNova Corp'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => switchRole('candidate')}
                title="Switch to Candidate Portal"
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3 text-emerald-400" />
                <span>Candidate View</span>
              </button>
              <button
                type="button"
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top header bar */}
          <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/30">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Recruiter Portal</span>
              <span>/</span>
              <span className="text-white capitalize">
                {pathname.split('/')[2] || 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Interview Engine Active
              </span>
            </div>
          </header>

          <main className="p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
