import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { api } from '../services/api';

// E2E/dev-only auth bypass. Guarded by import.meta.env.DEV so Vite strips this
// branch from production bundles; it can only ever activate under `vite` dev.
const E2E_AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_E2E_AUTH_BYPASS === 'true';

const E2E_STUB_USER = {
  id: 'e2e-user',
  email: 'e2e@intelx.local',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date(0).toISOString(),
} as unknown as User;

const E2E_STUB_MEMBER = {
  id: 'e2e-member',
  name: 'E2E Tester',
  email: 'e2e@intelx.local',
  avatarText: 'E2',
  avatarColor: '#3f7bf6',
  accessLevel: 'ADMIN',
};

interface AuthContextType {
  user: User | null;
  member: any | null; // Database member profile
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (E2E_AUTH_BYPASS) {
      console.warn('⚠️ VITE_E2E_AUTH_BYPASS is active: using a stub session (dev only).');
      setUser(E2E_STUB_USER);
      setMember(E2E_STUB_MEMBER);
      setLoading(false);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        api.setAuthToken(session.access_token);
        fetchMemberProfile(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        api.setAuthToken(session.access_token);
        fetchMemberProfile(session.access_token);
      } else {
        api.setAuthToken(null);
        setMember(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMemberProfile = async (token: string) => {
    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setMember(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch member profile', e);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (E2E_AUTH_BYPASS) {
      setUser(null);
      setMember(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, member, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
