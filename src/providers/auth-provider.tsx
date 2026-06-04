'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from '@/config/firebase-client';
import { useAuthStore } from '@/store/useAuthStore';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user: FirebaseUser | null) => {
      setLoading(true);
      if (user) {
        const idToken = await user.getIdToken();
        
        // Synchronize State Token to Backend Server Context Cookie for Edge Validation Security Middleware
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        // Resolve Detailed Claims
        const tokenResult = await user.getIdTokenResult();
        const role = (tokenResult.claims.role as string) || 'Viewer';

        setUser({
          uid: user.uid,
          email: user.email!,
          name: user.displayName || 'Enterprise Corporate Agent',
          role: role,
        });
      } else {
        clearAuth();
        await fetch('/api/auth/session', { method: 'DELETE' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, clearAuth]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
