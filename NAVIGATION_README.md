# Manito Navigation System

This document describes the complete navigation architecture for the Manito marketplace app.

## Architecture Overview

### 1. Root App Navigator (`AppNavigator.tsx`)
- **Purpose**: Main entry point that decides between Auth and Main navigation based on user state
- **Deep Linking**: Handles URL schemes `manito://` and `https://auth.manito.cl`
- **Auth State**: Routes to Auth stack if not authenticated, Main stack if authenticated
- **Loading States**: Shows LoadingScreen during auth state determination

### 2. Auth Navigator (`AuthNavigator.tsx`)
- **Flow**: UserTypeSelection ’ SignUp ’ EmailConfirmation ’ EmailConfirmed
- **Purpose**: Handles complete registration and email verification flow
- **TypeScript**: Fully typed navigation params

### 3. Main Navigator (`MainNavigator.tsx`)
- **Type**: Bottom Tab Navigator
- **Screens**: Home (marketplace dashboard), Profile (user profile)
- **Design**: Mobile-first with Spanish labels and emoji icons

### 4. Auth Context (`AuthContext.tsx`)
- **Global State**: User session, loading states, email verification status
- **Deep Link Handling**: Processes auth callbacks from Vercel edge function
- **Auto-refresh**: Periodically checks email verification for pending users
- **Session Management**: Handles Supabase auth state changes

## Deep Link Integration

### URL Schemes Supported
- `manito://auth/callback` - Mobile app callback
- `https://auth.manito.cl/api/auth/callback` - Web callback (Vercel)

### Flow
1. User clicks email verification link on any device
2. Link goes to `https://auth.manito.cl/api/auth/callback`
3. Vercel edge function processes auth and redirects to `manito://auth/callback`
4. App deep link handler processes tokens and updates auth state
5. Navigation automatically switches to Main stack on successful verification

### Deep Link Handler (`utils/deepLinkHandler.ts`)
- **Parse URLs**: Extracts auth tokens from callback URLs
- **Validate Tokens**: Ensures tokens are present and valid
- **Session Management**: Sets Supabase session with callback tokens
- **Error Handling**: Graceful error handling for invalid callbacks

## User Experience Features

### Authentication State Management
- **Persistent Sessions**: Users stay logged in between app launches
- **Email Verification**: Real-time detection when email is verified on any device
- **Loading States**: Professional loading indicators during auth operations
- **Error Recovery**: Graceful error handling with user-friendly messages

### Navigation Patterns
- **Conditional Navigation**: Auth vs Main stack based on user state
- **Type Safety**: Full TypeScript navigation typing
- **Mobile Optimized**: Bottom tabs with touch-friendly design
- **Spanish Localization**: All labels and messages in Spanish

### Marketplace-Specific Features
- **User Type Detection**: Different home screen for customers vs providers
- **Profile Management**: Complete user profile with verification status
- **Quick Actions**: Contextual action cards based on user type
- **Trust Indicators**: Clear email verification status throughout UI

## Screen Breakdown

### HomeScreen
- **Purpose**: Main dashboard after authentication
- **Customer View**: Search services, view bookings, manage payments
- **Provider View**: Manage services, view requests, track earnings
- **Features**: User type detection, quick action cards, activity feed

### ProfileScreen
- **Purpose**: User profile management and settings
- **Features**: Avatar, user info, verification status, account actions
- **Provider Extra**: Business info, verification status, service management
- **Actions**: Edit profile, change password, resend verification, settings

## Security & Error Handling

### Error Boundary
- **Purpose**: Catches navigation and React errors gracefully
- **Recovery**: "Try Again" button to reset error state
- **Development**: Shows error details in development mode
- **User Experience**: Spanish error messages with friendly design

### Deep Link Security
- **Token Validation**: Validates auth tokens before processing
- **Error Handling**: Graceful handling of malformed URLs
- **Session Security**: Uses Supabase's secure session management
- **CSRF Protection**: Inherent protection through Supabase auth flow

## Configuration

### app.json
```json
{
  "expo": {
    "scheme": "manito"
  }
}
```

### Environment Variables Required
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Vercel Edge Function Setup
The Vercel callback at `https://auth.manito.cl/api/auth/callback` should:
1. Process Supabase auth callback
2. Extract tokens and user data
3. Redirect to `manito://auth/callback#access_token=...&refresh_token=...`

## Testing

### Deep Link Testing
```bash
# iOS Simulator
xcrun simctl openurl booted "manito://auth/callback#access_token=example"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "manito://auth/callback#access_token=example"
```

### Email Verification Testing
1. Sign up with real email
2. Open email verification link on different device/browser
3. App should automatically detect verification and navigate to Main stack