import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signInWithPin, signOut } from '@/lib/auth';
import { toast } from 'sonner';

interface AuthContextType {
  signedInPlayer: string | null;
  setSignedInPlayer: (player: string | null) => void;
  isSignedIn: boolean;
  signIn: (username: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [signedInPlayer, setSignedInPlayer] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.user_metadata?.username) {
          setSignedInPlayer(user.user_metadata.username);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initAuth();
  }, []);

  const signIn = async (username: string, pin: string) => {
    try {
      await signInWithPin(username, pin);
      setSignedInPlayer(username);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Invalid credentials');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setSignedInPlayer(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const value = {
    signedInPlayer,
    setSignedInPlayer,
    isSignedIn: signedInPlayer !== null,
    signIn,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}