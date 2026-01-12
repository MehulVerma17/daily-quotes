/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 * Uses Supabase Auth for email/password and OAuth authentication.
 *
 * Features:
 * - Sign up with email/password
 * - Sign in with email/password
 * - Sign in with Google (OAuth)
 * - Password reset
 * - Session persistence
 * - Auto-refresh tokens
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { UserProfile, SignUpData, LoginData } from '../types';
// Simple logging helper
const log = {
  info: (context: string, message: string) => console.log(`[${context}] ${message}`),
  error: (context: string, message: string, error?: any) => console.error(`[${context}] ${message}`, error || ''),
};

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Profile methods
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed
  const isAuthenticated = !!user && !!session;

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================

  /**
   * Fetch user profile from Supabase
   */
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      log.info('AuthContext', `Fetching profile for user: ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet for new users
        if (error.code === 'PGRST116') {
          log.info('AuthContext', 'Profile not found, will be created on first update');
          return null;
        }
        throw error;
      }

      log.info('AuthContext', 'Profile fetched successfully');
      return data as UserProfile;
    } catch (error) {
      log.error('AuthContext', 'Error fetching profile', error);
      return null;
    }
  }, []);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  /**
   * Initialize auth state on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        log.info('AuthContext', 'Initializing auth...');

        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Fetch profile
          const profileData = await fetchProfile(currentSession.user.id);
          setProfile(profileData);

          log.info('AuthContext', 'Auth initialized with existing session');
        } else {
          log.info('AuthContext', 'No existing session found');
        }
      } catch (error) {
        log.error('AuthContext', 'Error initializing auth', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        log.info('AuthContext', `Auth state changed: ${event}`);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          log.info('AuthContext', 'User signed out');
        } else if (event === 'SIGNED_IN') {
          log.info('AuthContext', 'User signed in');
        } else if (event === 'TOKEN_REFRESHED') {
          log.info('AuthContext', 'Token refreshed');
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ============================================
  // AUTH METHODS
  // ============================================

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      log.info('AuthContext', 'Signing up new user...');

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        log.error('AuthContext', 'Sign up error', error);
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Sign up failed. Please try again.' };
      }

      log.info('AuthContext', 'Sign up successful');
      return { success: true };
    } catch (error) {
      log.error('AuthContext', 'Unexpected sign up error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      log.info('AuthContext', 'Signing in user...');

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        log.error('AuthContext', 'Sign in error', error);
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Sign in failed. Please try again.' };
      }

      log.info('AuthContext', 'Sign in successful');
      return { success: true };
    } catch (error) {
      log.error('AuthContext', 'Unexpected sign in error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      log.info('AuthContext', 'Initiating Google sign in...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        log.error('AuthContext', 'Google sign in error', error);
        return { success: false, error: error.message };
      }

      // Note: OAuth will redirect, so this success might not be reached
      return { success: true };
    } catch (error) {
      log.error('AuthContext', 'Unexpected Google sign in error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      log.info('AuthContext', 'Signing out user...');

      const { error } = await supabase.auth.signOut();

      if (error) {
        log.error('AuthContext', 'Sign out error', error);
        throw error;
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);

      log.info('AuthContext', 'Sign out successful');
    } catch (error) {
      log.error('AuthContext', 'Unexpected sign out error', error);
      throw error;
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      log.info('AuthContext', 'Sending password reset email...');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'quotevault://reset-password',
      });

      if (error) {
        log.error('AuthContext', 'Password reset error', error);
        return { success: false, error: error.message };
      }

      log.info('AuthContext', 'Password reset email sent');
      return { success: true };
    } catch (error) {
      log.error('AuthContext', 'Unexpected password reset error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (
    data: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      log.info('AuthContext', 'Updating profile...');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        log.error('AuthContext', 'Profile update error', error);
        return { success: false, error: error.message };
      }

      // Refresh profile
      await refreshProfile();

      log.info('AuthContext', 'Profile updated successfully');
      return { success: true };
    } catch (error) {
      log.error('AuthContext', 'Unexpected profile update error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, [user, refreshProfile]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    // State
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,

    // Auth methods
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,

    // Profile methods
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

/**
 * Custom hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
