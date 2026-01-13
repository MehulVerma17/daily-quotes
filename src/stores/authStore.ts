/**
 * Auth Store (Zustand)
 *
 * Manages authentication state using Zustand.
 * Replaces AuthContext with simpler, more performant state management.
 */

import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { UserProfile, SignUpData, LoginData } from '../types';

// Simple logging helper
const log = {
  info: (context: string, message: string) => console.log(`[${context}] ${message}`),
  error: (context: string, message: string, error?: any) => console.error(`[${context}] ${message}`, error || ''),
};

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  // Set session (used by auth listener)
  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
    });
  },

  // Initialize auth state
  initialize: async () => {
    const { isInitialized } = get();
    if (isInitialized) return;

    try {
      log.info('AuthStore', 'Initializing auth...');

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
        });

        // Fetch profile
        const profile = await fetchProfile(session.user.id);
        set({ profile });

        log.info('AuthStore', 'Auth initialized with existing session');
      } else {
        log.info('AuthStore', 'No existing session found');
      }
    } catch (error) {
      log.error('AuthStore', 'Error initializing auth', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      log.info('AuthStore', `Auth state changed: ${event}`);

      set({
        session: newSession,
        user: newSession?.user ?? null,
        isAuthenticated: !!newSession?.user,
      });

      if (newSession?.user) {
        const profile = await fetchProfile(newSession.user.id);
        set({ profile });
      } else {
        set({ profile: null });
      }
    });
  },

  // Sign up
  signUp: async (data: SignUpData) => {
    try {
      log.info('AuthStore', 'Signing up new user...');

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
        log.error('AuthStore', 'Sign up error', error);
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Sign up failed. Please try again.' };
      }

      // Create profile immediately after successful signup
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        log.error('AuthStore', 'Profile creation error', profileError);
        // Don't fail signup if profile creation fails - it can be created later
      } else {
        log.info('AuthStore', 'Profile created successfully');
      }

      log.info('AuthStore', 'Sign up successful');
      return { success: true };
    } catch (error) {
      log.error('AuthStore', 'Unexpected sign up error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  // Sign in
  signIn: async (data: LoginData) => {
    try {
      log.info('AuthStore', 'Signing in user...');

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        log.error('AuthStore', 'Sign in error', error);
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Sign in failed. Please try again.' };
      }

      log.info('AuthStore', 'Sign in successful');
      return { success: true };
    } catch (error) {
      log.error('AuthStore', 'Unexpected sign in error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      log.info('AuthStore', 'Initiating Google sign in...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        log.error('AuthStore', 'Google sign in error', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      log.error('AuthStore', 'Unexpected Google sign in error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      log.info('AuthStore', 'Signing out user...');

      const { error } = await supabase.auth.signOut();

      if (error) {
        log.error('AuthStore', 'Sign out error', error);
        throw error;
      }

      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
      });

      log.info('AuthStore', 'Sign out successful');
    } catch (error) {
      log.error('AuthStore', 'Unexpected sign out error', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      log.info('AuthStore', 'Sending password reset email...');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'quotevault://reset-password',
      });

      if (error) {
        log.error('AuthStore', 'Password reset error', error);
        return { success: false, error: error.message };
      }

      log.info('AuthStore', 'Password reset email sent');
      return { success: true };
    } catch (error) {
      log.error('AuthStore', 'Unexpected password reset error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  // Update profile
  updateProfile: async (data: Partial<UserProfile>) => {
    const { user, refreshProfile } = get();

    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      log.info('AuthStore', 'Updating profile...');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        log.error('AuthStore', 'Profile update error', error);
        return { success: false, error: error.message };
      }

      await refreshProfile();

      log.info('AuthStore', 'Profile updated successfully');
      return { success: true };
    } catch (error) {
      log.error('AuthStore', 'Unexpected profile update error', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  // Refresh profile
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const profile = await fetchProfile(user.id);
    set({ profile });
  },
}));

// Helper function to fetch profile (auto-creates if not found)
async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    log.info('AuthStore', `Fetching profile for user: ${userId}`);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found - try to create it from auth metadata
        log.info('AuthStore', 'Profile not found, creating from auth metadata...');

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name || null;
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: user.email,
              full_name: fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            log.error('AuthStore', 'Error creating profile', createError);
            return null;
          }

          log.info('AuthStore', 'Profile created successfully');
          return newProfile as UserProfile;
        }
        return null;
      }
      throw error;
    }

    log.info('AuthStore', 'Profile fetched successfully');
    return data as UserProfile;
  } catch (error) {
    log.error('AuthStore', 'Error fetching profile', error);
    return null;
  }
}
