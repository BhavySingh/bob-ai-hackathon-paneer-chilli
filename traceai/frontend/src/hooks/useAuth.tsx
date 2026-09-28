import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo credentials (hackathon prototype)
const DEMO_EMAIL = 'demo@nfsu.traceai';
const DEMO_PASSWORD = 'TraceAI@123';
const DEMO_USER: User = {
  id: 1,
  name: 'Inspector Raj Mehta',
  email: 'demo@nfsu.traceai',
  role: 'Senior Investigator',
  badge_number: 'NFSU-INV-001',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('traceai_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Try backend first, fall back to demo credentials
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('traceai_token', data.access_token);
        localStorage.setItem('traceai_user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
    } catch {
      // backend not available – use demo credentials
    }

    // Demo fallback
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = 'demo_token_' + Date.now();
      localStorage.setItem('traceai_token', token);
      localStorage.setItem('traceai_user', JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('traceai_token');
    localStorage.removeItem('traceai_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
