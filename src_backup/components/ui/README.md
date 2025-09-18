# Manito Design System

A comprehensive, professional design system for the Chilean home services marketplace app, focused on trust, credibility, and mobile-first user experience.

## Design Principles

### 🛡️ Trust & Credibility
- Professional color palette that conveys trust and reliability
- Clear visual hierarchy with verification indicators
- Consistent branding throughout the app
- Security-focused UI elements

### 🇨🇱 Chilean Market Adaptation
- Colors and design elements that resonate with Chilean culture
- Spanish-language considerations in typography
- Local market trust indicators (RUT verification, etc.)
- Cultural sensitivity in iconography and messaging

### 📱 Mobile-First Excellence
- Touch-friendly component sizes (minimum 44px tap targets)
- Optimized for one-handed use
- Responsive design across all mobile screen sizes
- Performance-optimized with minimal re-renders

### ♿ Accessibility Compliance
- WCAG 2.1 AA compliant color contrast ratios
- Screen reader friendly components
- Keyboard navigation support
- Focus indicators for all interactive elements

## Core Components

### Buttons
```tsx
import { Button } from '../../components/ui';

<Button 
  title="Primary Action"
  variant="primary"
  size="large"
  onPress={handlePress}
  fullWidth
/>
```

**Variants:** `primary`, `secondary`, `success`, `outline`, `ghost`
**Sizes:** `small`, `medium`, `large`

### Cards
```tsx
import { Card } from '../../components/ui';

<Card variant="elevated" padding="large">
  <Text>Card content goes here</Text>
</Card>
```

**Variants:** `default`, `elevated`, `outlined`, `flat`
**Padding:** `none`, `small`, `medium`, `large`

### Inputs
```tsx
import { Input } from '../../components/ui';

<Input
  label="Email"
  placeholder="tu@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  required
  leftIcon={<Icon name="email" />}
/>
```

**Features:** Validation states, icons, password toggle, Chilean phone formatting

### Badges
```tsx
import { Badge } from '../../components/ui';

<Badge 
  label="Verificado" 
  variant="verified" 
  size="medium" 
/>
```

**Variants:** `primary`, `secondary`, `success`, `warning`, `error`, `verified`, `pending`

### Avatars
```tsx
import { Avatar } from '../../components/ui';

<Avatar
  source={{ uri: userImageUrl }}
  size="large"
  verified={true}
  showStatus={true}
  status="online"
/>
```

**Features:** Status indicators, verification badges, fallback initials

### Icons
```tsx
import { Icon } from '../../components/ui';

<Icon name="electrician" size="lg" />
```

**Icon Library:** 60+ carefully curated icons for marketplace functionality

## Marketplace Components

### Verification Badge
```tsx
import { VerificationBadge } from '../../components/marketplace';

<VerificationBadge 
  status="verified" 
  type="identity" 
  detailed={true} 
/>
```

Shows trust indicators for service providers with Chilean-specific verification types.

### Rating Display
```tsx
import { RatingDisplay } from '../../components/marketplace';

<RatingDisplay
  rating={4.7}
  reviewCount={127}
  size="medium"
  onPress={handleViewReviews}
/>
```

Professional star rating component with Chilean number formatting.

### Service Card
```tsx
import { ServiceCard } from '../../components/marketplace';

<ServiceCard
  icon="electrician"
  name="Electricista"
  description="Instalaciones y reparaciones eléctricas"
  providerCount={245}
  averageRating={4.7}
  priceRange="$15.000/hora"
  popular={true}
  onPress={handleServicePress}
/>
```

### Provider Card
```tsx
import { ProviderCard } from '../../components/marketplace';

<ProviderCard
  name="Juan Pérez"
  profession="Electricista Certificado"
  verified={true}
  rating={4.8}
  reviewCount={89}
  location="Las Condes, Santiago"
  availability="available"
  onPress={handleProviderPress}
/>
```

## Theme System

### Colors
The color system is built around trust and professionalism:

- **Primary Blue**: `#007AFF` - Professional, trustworthy
- **Success Green**: `#00A355` - Verification, completion
- **Chilean Copper**: `#B87333` - Cultural connection
- **Status Colors**: Green for verified, orange for pending, red for errors

### Typography
- **Primary Font**: System font (San Francisco on iOS, Roboto on Android)
- **Scale**: 12px to 48px with consistent line heights
- **Weights**: Light (300) to Extra Bold (800)

### Spacing
8-point grid system for consistent spacing:
- `spacing[1]` = 4px
- `spacing[4]` = 16px
- `spacing[8]` = 32px

### Shadows
iOS-style shadows with varying elevations:
- `shadows.sm` - Subtle elevation
- `shadows.base` - Standard cards
- `shadows.lg` - Important elements

## Usage Guidelines

### Do's ✅
- Use consistent spacing from the theme system
- Apply proper color contrast ratios
- Include loading states for all async actions
- Provide clear error messages in Spanish
- Use verification badges for trust indicators

### Don'ts ❌
- Don't use hardcoded colors or spacing values
- Don't create custom components without following the design system
- Don't ignore accessibility requirements
- Don't use inconsistent button styles across the app

### Performance Best Practices
- Use memoization for expensive calculations
- Optimize image loading with proper sizing
- Implement proper key props for lists
- Use FlatList for large data sets
- Minimize re-renders with React.memo

## Chilean Market Considerations

### Language & Localization
- All text in Chilean Spanish
- Proper currency formatting (CLP)
- Date/time in Chilean format
- Chilean phone number formatting

### Trust Indicators
- RUT validation and display
- Professional certification badges  
- Escrow payment indicators
- Verification status prominently displayed

### Cultural Elements
- Chilean color palette references (copper, Andes blue)
- Local iconography where appropriate
- Professional service imagery
- Trust-building visual elements

## Implementation Notes

All components are built with TypeScript for type safety and include:
- Comprehensive prop interfaces
- Default values for optional props
- Error boundaries for graceful failure
- Accessibility props and attributes
- Performance optimizations

The design system is documented with Storybook stories and includes unit tests for all components.