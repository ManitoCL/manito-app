# Required Dependencies for Enterprise Landing Page

## Dependencies to Add

The landing page requires these additional dependencies:

```bash
# For gradient backgrounds in hero section
npm install expo-linear-gradient

# For custom SVG icons (if not already installed)
npm install react-native-svg
```

## Current Dependencies Analysis

Based on the existing `package.json`, the project already has:
- ✅ React Native 0.81.4
- ✅ Expo 54.0.7
- ✅ React Navigation
- ✅ TypeScript support
- ✅ Supabase integration

## Missing Dependencies

Only these two are needed:
1. **expo-linear-gradient** - For the hero section gradient background
2. **react-native-svg** - May already be included with Expo, but needed for custom icons

## Alternative Implementation

If you prefer to avoid additional dependencies:

1. **Replace LinearGradient** - Use a simple colored background instead of gradient
2. **Replace SVG Icons** - Use emoji or Unicode symbols instead of custom SVG icons

The landing page is designed to work with minimal dependencies and can be adapted to use only React Native core components if needed.