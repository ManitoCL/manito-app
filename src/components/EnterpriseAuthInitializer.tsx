/**
 * Enterprise Auth Initializer - Redux Middleware Pattern
 * Minimal component that triggers auth initialization via Redux
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { initializeAuth, markAsInitialized, selectAuth } from '../store/auth/authSlice';

export const EnterpriseAuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isInitialized, isLoading } = useAppSelector(selectAuth);

  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Enterprise Auth: Initializing via Redux middleware...');

      // This triggers the middleware to set up all auth listeners
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // This component doesn't render anything - auth is handled in middleware
  return null;
};