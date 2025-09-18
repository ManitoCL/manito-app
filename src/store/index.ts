import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { authReducer } from './auth/authSlice';
import { authMiddleware } from './middleware/authMiddleware';
import { authApi } from './api/authApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Session objects
        ignoredActions: [
          'auth/initialize/fulfilled',
          'auth/setAuthState',
          'auth/authStateChanged',
          'auth/handleDeepLink',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.session', 'payload.user'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.session'],
      },
    })
    .concat(authMiddleware)
    .concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;