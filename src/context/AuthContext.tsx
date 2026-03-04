import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthUser, signInWithApple, signInWithGoogle, createGuestUser,
  signOut as firebaseSignOut,
} from '../services/auth';

const AUTH_STORAGE_KEY = 'auth_user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithAppleFn: (comingSoonTitle: string, comingSoonMsg: string) => Promise<void>;
  signInWithGoogleFn: (comingSoonTitle: string, comingSoonMsg: string) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on mount
  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed: AuthUser = JSON.parse(stored);
          setUser(parsed);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    if (u) {
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } else {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const signInWithAppleFn = useCallback(
    async (comingSoonTitle: string, comingSoonMsg: string) => {
      const result = await signInWithApple(comingSoonTitle, comingSoonMsg);
      if (result) {
        persist(result);
        setUser(result);
      }
    },
    [persist],
  );

  const signInWithGoogleFn = useCallback(
    async (comingSoonTitle: string, comingSoonMsg: string) => {
      const result = await signInWithGoogle(comingSoonTitle, comingSoonMsg);
      if (result) {
        persist(result);
        setUser(result);
      }
    },
    [persist],
  );

  const continueAsGuest = useCallback(() => {
    const guest = createGuestUser();
    persist(guest);
    setUser(guest);
  }, [persist]);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    persist(null);
    setUser(null);
  }, [persist]);

  const deleteAccount = useCallback(async () => {
    await firebaseSignOut();
    persist(null);
    setUser(null);
  }, [persist]);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      signInWithAppleFn,
      signInWithGoogleFn,
      continueAsGuest,
      signOut,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
