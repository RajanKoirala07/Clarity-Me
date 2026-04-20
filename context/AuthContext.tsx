import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { User, getStoredToken, logout as authLogout } from '@/services/auth';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  signOut: async () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app start, check if a token already exists (resuming session)
    getStoredToken().then((token) => {
      if (!token) setUser(null);
      // Token exists but we don't re-fetch the user profile here.
      // The user object will be set on next login, or you can add a /me endpoint later.
      setIsLoading(false);
    });
  }, []);

  const signOut = async () => {
    await authLogout();
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
