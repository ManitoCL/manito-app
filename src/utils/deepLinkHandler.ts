import * as Linking from 'expo-linking';
import { supabase, AUTH_REDIRECT_URL } from '../services/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Enhanced interface with proper typing
export interface DeepLinkAuthParams {
  access_token?: string;
  refresh_token?: string;
  code?: string;
  session_code?: string;
  type?: 'signup' | 'recovery' | 'invite' | 'magiclink';
  error?: string;
  error_description?: string;
  expires_in?: string;
  token_type?: string;
}

export interface AuthCallbackResult {
  success: boolean;
  error?: string;
  session?: Session | null;
  user?: User | null;
}
