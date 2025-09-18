# Chilean Home Services Registration Components

This directory contains comprehensive registration components specifically designed for the Chilean home services marketplace **Manito**. The components are optimized for Chilean users with proper localization, validation, and marketplace-specific UX patterns.

## Components Overview

### 1. ComprehensiveRegistrationScreen
Main registration flow that orchestrates the entire registration process.

**Features:**
- Step-by-step user onboarding
- User type selection (consumer vs provider)
- Registration method selection (email vs phone)
- Progress indicator
- Smooth navigation between steps

**Usage:**
```tsx
import ComprehensiveRegistrationScreen from './components/registration/ComprehensiveRegistrationScreen';

<ComprehensiveRegistrationScreen onNavigateToLogin={() => navigation.navigate('Login')} />
```

### 2. UserTypeSelection
Allows users to select between consumer and provider accounts with clear value propositions.

**Features:**
- Visual comparison of consumer vs provider benefits
- Chilean market-specific messaging in Spanish
- Touch-optimized selection cards
- Clear value propositions for each user type

### 3. EmailRegistrationForm
Complete email-based registration form with validation.

**Features:**
- Email and password validation
- Provider-specific fields (business name, services, regions)
- Chilean service categories
- Regional selection for service providers
- Form validation with Spanish error messages

### 4. PhoneRegistrationForm
Multi-step phone-based registration with SMS verification.

**Features:**
- Chilean phone number validation (+56 format)
- SMS OTP verification flow
- Auto-resend functionality with countdown
- Profile completion step

### 5. ChileanPhoneInput
Specialized phone number input for Chilean mobile numbers.

**Features:**
- Automatic +56 country code
- Real-time formatting (9 XXXX XXXX)
- Validation for Chilean mobile format
- Visual feedback for valid/invalid numbers
- Accessibility support

### 6. RUTInput
RUT (Chilean national ID) input with validation and formatting.

**Features:**
- Real-time RUT formatting (XX.XXX.XXX-X)
- Client-side validation algorithm
- Server-side validation support
- Auto-calculation of verification digit
- Loading states during validation

## Chilean-Specific Features

### Phone Number Handling
- Supports Chilean mobile format (+56 9 XXXX XXXX)
- Automatic formatting as user types
- Validation for proper Chilean mobile numbers
- Clean number extraction for API calls

### RUT Validation
- Complete Chilean RUT validation algorithm
- Real-time formatting with dots and dash
- Verification digit calculation
- Server-side validation integration

### Localization
- All text in Spanish
- Chilean service categories
- Chilean regions (15 regions)
- Cultural preferences for professional services

### Service Categories
Comprehensive list of Chilean home service categories:
- Limpieza y Aseo
- Mantención y Reparaciones
- Jardín y Paisajismo
- Electricidad, Gasfitería
- And 12+ more categories

### Regional Coverage
All 15 Chilean regions supported:
- Arica y Parinacota
- Tarapacá
- Antofagasta
- Atacama
- Coquimbo
- Valparaíso
- Región Metropolitana
- O'Higgins
- Maule
- Ñuble
- Biobío
- La Araucanía
- Los Ríos
- Los Lagos
- Aysén
- Magallanes y Antártica Chilena

## Technical Integration

### Authentication Service Integration
Components integrate with existing `AuthService` methods:
```tsx
// Email registration
AuthService.signUp(email, password, userData)

// Phone registration
AuthService.signUpWithPhone(phoneNumber, userData)

// OTP verification
AuthService.verifyPhoneOTP(phoneNumber, otp)
```

### Form Validation
Comprehensive validation system with Spanish error messages:
```tsx
import { validationMessages } from '../../utils/chilean';

// Email validation
if (!validateEmail(email)) {
  setError(validationMessages.email.invalid);
}

// Phone validation
if (!chileanPhoneUtils.isValidPhoneNumber(phone)) {
  setError(validationMessages.phone.invalid);
}

// RUT validation
if (!rutUtils.isValidRUT(rut)) {
  setError(validationMessages.rut.invalid);
}
```

### Utility Functions
Chilean-specific utilities in `utils/chilean.ts`:
- `chileanPhoneUtils`: Phone formatting and validation
- `rutUtils`: RUT validation and formatting
- `validationMessages`: Spanish error messages
- `serviceCategories`: Chilean service types
- `chileanRegions`: Complete region list

## Styling and UX

### Design Principles
- Mobile-first responsive design
- Touch-optimized input controls
- Accessibility considerations
- Chilean cultural preferences
- Trust indicators for providers

### Color Scheme
- Primary: #4CAF50 (Green - trust and growth)
- Error: #ff4444 (Red for errors)
- Warning: #ff9800 (Orange for warnings)
- Success: #4CAF50 (Green for success states)

### Typography
- Clear hierarchy with bold headings
- Readable font sizes (16px+ for inputs)
- Proper contrast ratios
- Spanish language considerations

## Accessibility Features

### Screen Reader Support
- Proper accessibility labels
- Hint text for complex inputs
- Role definitions for form elements
- Clear focus indicators

### Keyboard Navigation
- Logical tab order
- Enter key submission
- Escape key cancellation
- Arrow key navigation where appropriate

### Visual Accessibility
- High contrast colors
- Clear focus states
- Large touch targets (44px minimum)
- Error state indicators

## Performance Optimizations

### Efficient Rendering
- Memoized components where appropriate
- Debounced validation (300ms)
- Optimistic UI updates
- Lazy validation for expensive operations

### Network Efficiency
- Batched API calls
- Optimistic form submission
- Retry mechanisms for failed requests
- Proper error boundaries

## Testing Considerations

### Unit Testing
Test each component's validation logic:
```tsx
describe('ChileanPhoneInput', () => {
  it('validates Chilean phone numbers correctly', () => {
    expect(chileanPhoneUtils.isValidPhoneNumber('956123456')).toBe(true);
    expect(chileanPhoneUtils.isValidPhoneNumber('912345678')).toBe(true);
  });
});
```

### Integration Testing
- Test complete registration flows
- Verify form submission with various inputs
- Test error handling scenarios
- Validate accessibility compliance

## Future Enhancements

### Planned Features
- Social login integration (Google, Apple)
- Document upload for provider verification
- Advanced business profile fields
- Integration with Chilean payment systems

### Internationalization
While currently Spanish-only, the structure supports:
- Multiple language support
- Region-specific customizations
- Currency localization
- Date/time formatting

## Support and Maintenance

### Common Issues
1. **Phone Validation Errors**: Ensure phone numbers include proper Chilean format
2. **RUT Validation Failures**: Check for proper server-side validation setup
3. **Form Submission Issues**: Verify all required fields are completed

### Debugging
Enable debug mode for detailed logging:
```tsx
const DEBUG = __DEV__ && true;
if (DEBUG) console.log('Registration data:', userData);
```

### Updates and Maintenance
- Regular testing with new Chilean phone number formats
- Updates to service categories as market evolves
- Regional changes as administrative divisions change
- Validation rule updates based on Chilean regulations