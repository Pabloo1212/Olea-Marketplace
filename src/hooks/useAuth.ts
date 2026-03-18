'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/lib/validation/schemas';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: 'customer' | 'producer' | 'admin' | null;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    userRole: null,
  });

  const supabase = createClient();

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: authState.user?.email || '',
              role: 'customer',
              name: authState.user?.user_metadata?.name || '',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }

          return newProfile;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  }, [supabase, authState.user]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id);
          const userRole = session.user.user_metadata?.role || profile?.role || 'customer';

          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
            userRole: userRole as 'customer' | 'producer' | 'admin',
          });
        } else if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
            userRole: null,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          const userRole = session.user.user_metadata?.role || profile?.role || 'customer';

          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
            userRole: userRole as 'customer' | 'producer' | 'admin',
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
            userRole: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error: error.message };
      }

      // Session will be handled by the onAuthStateChange listener
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, [supabase]);

  // Sign up
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata: Record<string, any> = {}
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name || '',
            role: metadata.role || 'customer',
            ...metadata,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }

      // State will be updated by onAuthStateChange listener
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  }, [supabase]);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected reset password error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, [supabase]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!authState.user) {
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { error: error.message };
      }

      // Refetch profile to update state
      const updatedProfile = await fetchProfile(authState.user.id);
      if (updatedProfile) {
        setAuthState(prev => ({ ...prev, profile: updatedProfile }));
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected update profile error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, [supabase, authState.user, fetchProfile]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Refresh session error:', error);
      }
    } catch (error) {
      console.error('Unexpected refresh session error:', error);
    }
  }, [supabase]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
  };
}

// Convenience hooks for specific auth states
export const useUser = () => {
  const { user, loading, isAuthenticated } = useAuth();
  return { user, loading, isAuthenticated };
};

export const useProfile = () => {
  const { profile, loading, updateProfile } = useAuth();
  return { profile, loading, updateProfile };
};

export const useUserRole = () => {
  const { userRole, loading, isAuthenticated } = useAuth();
  return { userRole, loading, isAuthenticated };
};

// Role-based access hooks
export const useIsProducer = () => {
  const { userRole, loading, isAuthenticated } = useAuth();
  return { isProducer: isAuthenticated && userRole === 'producer', loading };
};

export const useIsAdmin = () => {
  const { userRole, loading, isAuthenticated } = useAuth();
  return { isAdmin: isAuthenticated && userRole === 'admin', loading };
};

export const useIsCustomer = () => {
  const { userRole, loading, isAuthenticated } = useAuth();
  return { isCustomer: isAuthenticated && userRole === 'customer', loading };
};
