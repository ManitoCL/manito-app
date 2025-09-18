# Manito Authentication UI Components

Complete authentication flow components for the Manito Chilean marketplace platform.

## Components Overview

### Base UI Components (`/ui/`)

#### Button
- **Variants**: `primary`, `secondary`, `ghost`
- **Sizes**: `small`, `medium`, `large`
- **Features**: Loading states, disabled states, custom styling
- **Spanish labels** with loading indicator

#### Input
- **Variants**: `default`, `error`, `success`
- **Features**: Password toggle, validation states, icons, multiline support
- **Keyboard types**: email, numeric, phone-pad
- **Accessibility**: Proper labels and contrast

#### PhoneInput
- **Americas countries support** with flags and country codes
- **Chilean phone validation** with formatting
- **Modal country picker** with search functionality
- **Integrated with Input component** styling

#### Card
- **Variants**: `default`, `elevated`, `outlined`
- **Padding options**: `none`, `small`, `medium`, `large`
- **Touch support** with onPress handler
- **Professional shadows** and borders

#### LoadingScreen
- Simple loading indicator with customizable message
- Chilean marketplace branding colors
- Centered layout with spinner and text

### Authentication Screens (`/screens/auth/`)

#### UserTypeSelectionScreen
- **Chilean marketplace branding** with trust indicators
- **Two user types**: Customer and Provider
- **Feature lists** for each user type
- **Professional card layout** with icons and descriptions
- **Trust section** with security badges

#### SignUpScreen
- **Dynamic form** based on user type (Customer/Provider)
- **Email/Phone toggle** (phone coming soon)
- **Provider-specific fields**: Business name, description
- **Comprehensive validation** with Spanish error messages
- **Terms and conditions** checkbox
- **Form state management** with explicit property assignment

#### EmailConfirmationScreen
- **Spanish instructions** with step-by-step guidance
- **Auto-refresh functionality** to detect email verification
- **Resend email** with cooldown timer
- **Email app integration** with deep links
- **Provider-specific messaging** for professionals
- **Status indicators** and help text

#### EmailConfirmedScreen
- **Success confirmation** with celebration design
- **Auto-redirect** to main app after 3 seconds
- **Manual continue** button option
- **Welcome messaging** for new users

## Usage Example

```tsx
import { AuthNavigator } from '../navigation/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
```

## Authentication Service (`/services/auth.ts`)

### Functions Available

```tsx
// Sign up new user
const result = await signUpWithEmail({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'Juan Pérez',
  userType: 'customer',
  businessName: 'Optional for providers',
  description: 'Optional for providers'
});

// Sign in existing user
const result = await signInWithEmail({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { user, error } = await getCurrentUser();

// Resend email confirmation
const result = await resendEmailConfirmation('user@example.com');

// Validation helpers
const isValid = validateEmail('user@example.com');
const { isValid, message } = validatePassword('password123');
const { isValid, message } = validateChileanPhone('912345678');
```

## Design System

### Colors
- **Primary**: `#2563EB` (Professional blue)
- **Secondary**: `#10B981` (Success green)
- **Background**: `#F9FAFB` (Light gray)
- **Text**: `#111827` (Dark gray)
- **Error**: `#EF4444` (Red)

### Typography
- **Titles**: 28px, bold
- **Subtitles**: 16px, regular
- **Body**: 14px, regular
- **Labels**: 14px, semi-bold

### Spacing
- **Container padding**: 20px
- **Component gaps**: 16px, 20px
- **Card padding**: 16px, 24px

## Features

### Chilean Market Adaptations
- **Spanish language** throughout all components
- **Chilean phone validation** (9-digit mobile, 8-9 digit landline)
- **Professional marketplace** design with trust indicators
- **Local payment method** mentions (future integration)

### Mobile-First Design
- **Touch-friendly** button sizes (minimum 48px height)
- **Keyboard handling** with KeyboardAvoidingView
- **Safe area** support for modern devices
- **Responsive layout** across screen sizes

### Security & Trust
- **Email verification** flow with auto-detection
- **Password strength** validation
- **Error handling** with user-friendly Spanish messages
- **Rate limiting** respect with cooldown timers

### Performance
- **No spread operators** to avoid Object conversion errors
- **Memoization** ready component structure
- **Efficient re-renders** with explicit state updates
- **Lazy loading** compatible design

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── PhoneInput.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── LoadingScreen.tsx
│   └── README.md
├── screens/
│   └── auth/
│       ├── UserTypeSelectionScreen.tsx
│       ├── SignUpScreen.tsx
│       ├── EmailConfirmationScreen.tsx
│       ├── EmailConfirmedScreen.tsx
│       └── index.ts
├── services/
│   ├── auth.ts
│   └── supabase.ts
├── navigation/
│   └── AuthNavigator.tsx
└── types/
    └── index.ts
```

## Integration Notes

1. **Supabase Integration**: All components integrate with Supabase auth
2. **Navigation**: Uses React Navigation v6 with TypeScript
3. **State Management**: Local state with explicit property assignment
4. **Error Handling**: Comprehensive error messages in Spanish
5. **Validation**: Client-side validation with server-side backup

## Accessibility

- **Screen reader** support with proper labels
- **High contrast** colors meeting WCAG guidelines
- **Touch targets** minimum 44px for iOS, 48px for Android
- **Focus management** for keyboard navigation
- **Error announcements** for form validation

## Next Steps

1. **Phone authentication** implementation
2. **Social login** (Google, Apple, Facebook)
3. **Biometric authentication** for returning users
4. **Offline support** for form data persistence
5. **Push notification** setup for email verification alerts