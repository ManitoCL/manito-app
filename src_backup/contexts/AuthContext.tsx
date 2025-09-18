import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pendingEmailConfirmation: boolean;
  pendingConfirmationData: { email: string; userType: 'consumer' | 'provider' } | null;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<any>;
  signUpWithPhone: (phoneNumber: string, userData: Partial<User>) => Promise<any>;
  verifyPhoneOTP: (phoneNumber: string, token: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithPhone: (phoneNumber: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<any>;
  resendConfirmation: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState(false);
  const [pendingConfirmationData, setPendingConfirmationData] = useState<{ email: string; userType: 'consumer' | 'provider' } | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { user: currentUser } = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);

        if (event === "SIGNED_UP" && session?.user) {
          console.log("Auth state change: SIGNED_UP - User needs email confirmation");

          // User signed up but needs confirmation - don't set user state yet
          // The user will be set when they confirm email and SIGNED_IN event fires
          setPendingEmailConfirmation(true);
          setLoading(false);

        } else if (event === "SIGNED_IN" && session?.user) {
          console.log("Auth state change: SIGNED_IN", session.user.id);

          // Handle email confirmation completion
          if (session.user.email_confirmed_at) {
            console.log("Email confirmation detected, ensuring profile exists...");
            try {
              // Call our database function to handle post-confirmation setup
              const { error } = await supabase.rpc("handle_email_confirmation", {
                user_id: session.user.id
              });
              if (error) {
                console.error("Error handling email confirmation:", error);
              } else {
                console.log("Profile creation/verification completed");
              }
            } catch (error) {
              console.error("Email confirmation handler failed:", error);
            }
          }

          // Get and set user profile
          const { user: currentUser } = await AuthService.getCurrentUser();
          setUser(currentUser);
          setPendingEmailConfirmation(false);
          setPendingConfirmationData(null);
          setLoading(false);

        } else if (event === 'SIGNED_OUT') {
          console.log("Auth state change: SIGNED_OUT");
          setUser(null);
          setPendingEmailConfirmation(false);
          setPendingConfirmationData(null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(email, password, userData);

      // If email confirmation is needed, set pending state
      if (result.needsConfirmation) {
        console.log('Setting pendingEmailConfirmation to true');
        setPendingEmailConfirmation(true);
        setPendingConfirmationData({
          email: email,
          userType: userData.userType || 'consumer'
        });
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithPhone = async (phoneNumber: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const result = await AuthService.signUpWithPhone(phoneNumber, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async (phoneNumber: string, token: string) => {
    setLoading(true);
    try {
      const result = await AuthService.verifyPhoneOTP(phoneNumber, token);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithPhone(phoneNumber);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const result = await AuthService.updateUserProfile(user.id, updates);
      if (result.error) return result;

      // Update local user state
      setUser({ ...(user || {}), ...(updates || {}) });
      return result;
    } catch (error) {
      return { error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const result = await AuthService.resendConfirmation(email);
      return result;
    } catch (error) {
      return { data: null, error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    pendingEmailConfirmation,
    pendingConfirmationData,
    signUp,
    signUpWithPhone,
    verifyPhoneOTP,
    signIn,
    signInWithPhone,
    signOut,
    updateProfile,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
