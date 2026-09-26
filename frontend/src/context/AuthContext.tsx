'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  companyId?: string | null;
  companyName?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, role: UserRole, companyName?: string) => Promise<void>;
  signup: (email: string, fullName: string, role: UserRole, companyName?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'hirenova_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to read auth state from localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (profile: UserProfile | null) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const login = async (email: string, role: UserRole, companyName?: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/auth/sync-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          fullName: email.split('@')[0],
          companyName: role === 'recruiter' ? (companyName || 'HireNova Partner') : undefined,
        }),
      });

      const data = await res.json();
      const profile: UserProfile = data.user || {
        id: role === 'recruiter' ? '11111111-1111-1111-1111-111111111111' : '00000000-0000-0000-0000-000000000001',
        email,
        role,
        fullName: email.split('@')[0],
        companyId: role === 'recruiter' ? '22222222-2222-2222-2222-222222222222' : null,
        companyName: companyName || (role === 'recruiter' ? 'HireNova Partner' : null),
      };

      saveUser(profile);

      if (profile.role === 'recruiter' || profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Local fallback
      const fallback: UserProfile = {
        id: role === 'recruiter' ? '11111111-1111-1111-1111-111111111111' : '00000000-0000-0000-0000-000000000001',
        email,
        role,
        fullName: email.split('@')[0],
        companyId: role === 'recruiter' ? '22222222-2222-2222-2222-222222222222' : null,
        companyName: companyName || (role === 'recruiter' ? 'HireNova Partner' : null),
      };
      saveUser(fallback);
      router.push(role === 'recruiter' ? '/admin/dashboard' : '/candidate/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, fullName: string, role: UserRole, companyName?: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/auth/sync-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          role,
          companyName: role === 'recruiter' ? companyName : undefined,
        }),
      });

      const data = await res.json();
      const profile: UserProfile = data.user || {
        id: role === 'recruiter' ? '11111111-1111-1111-1111-111111111111' : '00000000-0000-0000-0000-000000000001',
        email,
        fullName,
        role,
        companyId: role === 'recruiter' ? '22222222-2222-2222-2222-222222222222' : null,
        companyName: companyName || null,
      };

      saveUser(profile);
      router.push(role === 'recruiter' ? '/admin/dashboard' : '/candidate/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    saveUser(null);
    router.push('/login');
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      role: newRole,
      companyId: newRole === 'recruiter' ? '22222222-2222-2222-2222-222222222222' : null,
      companyName: newRole === 'recruiter' ? 'HireNova Partner' : null,
    };
    saveUser(updated);
    router.push(newRole === 'recruiter' ? '/admin/dashboard' : '/candidate/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
