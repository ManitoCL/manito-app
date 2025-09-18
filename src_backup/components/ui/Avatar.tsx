/**
 * Avatar Component - Manito Design System
 * Professional avatar component for user profiles and provider images
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';

export interface AvatarProps {
  /** Avatar image source */
  source?: { uri: string } | number;
  /** Fallback initials if no image */
  initials?: string;
  /** Avatar size */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** Avatar shape */
  shape?: 'circle' | 'square';
  /** Online status indicator */
  showStatus?: boolean;
  /** Status variant */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Verification badge */
  verified?: boolean;
  /** Make avatar pressable */
  onPress?: () => void;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Custom text style for initials */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = 'medium',
  shape = 'circle',
  showStatus = false,
  status = 'offline',
  verified = false,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  const avatarSize = getSizeValue(size);
  const borderRadius = shape === 'circle' ? avatarSize / 2 : theme.borderRadius.lg;

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius,
    },
    style,
  ];

  const initialsStyle = [
    styles.initials,
    styles[`initials${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    textStyle,
  ];

  const statusStyle = [
    styles.status,
    styles[status],
    styles[`statusSize${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
  ];

  const verifiedBadgeStyle = [
    styles.verified,
    styles[`verifiedSize${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
  ];

  const renderContent = () => (
    <View style={containerStyle} testID={testID}>
      {source ? (
        <Image
          source={source}
          style={[styles.image, { borderRadius }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, { borderRadius }]}>
          <Text style={initialsStyle}>{initials || '?'}</Text>
        </View>
      )}
      
      {showStatus && (
        <View style={statusStyle} />
      )}
      
      {verified && (
        <View style={verifiedBadgeStyle}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const getSizeValue = (size: string): number => {
  switch (size) {
    case 'small':
      return 32;
    case 'medium':
      return 48;
    case 'large':
      return 64;
    case 'xlarge':
      return 96;
    default:
      return 48;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Initials styles
  initials: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  
  initialsSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  initialsMedium: {
    fontSize: theme.typography.fontSize.base,
  },
  
  initialsLarge: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  initialsXlarge: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  
  // Status indicator
  status: {
    position: 'absolute',
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.semantic.background,
  },
  
  online: {
    backgroundColor: theme.colors.status.available,
  },
  
  offline: {
    backgroundColor: theme.colors.neutral[400],
  },
  
  busy: {
    backgroundColor: theme.colors.status.busy,
  },
  
  away: {
    backgroundColor: theme.colors.status.pending,
  },
  
  // Status sizes
  statusSizeSmall: {
    width: 8,
    height: 8,
    bottom: 0,
    right: 0,
  },
  
  statusSizeMedium: {
    width: 10,
    height: 10,
    bottom: 2,
    right: 2,
  },
  
  statusSizeLarge: {
    width: 12,
    height: 12,
    bottom: 2,
    right: 2,
  },
  
  statusSizeXlarge: {
    width: 16,
    height: 16,
    bottom: 4,
    right: 4,
  },
  
  // Verified badge
  verified: {
    position: 'absolute',
    backgroundColor: theme.colors.status.verified,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.semantic.background,
  },
  
  verifiedIcon: {
    color: theme.colors.semantic.background,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  // Verified badge sizes
  verifiedSizeSmall: {
    width: 12,
    height: 12,
    bottom: -2,
    right: -2,
  },
  
  verifiedSizeMedium: {
    width: 16,
    height: 16,
    bottom: -2,
    right: -2,
  },
  
  verifiedSizeLarge: {
    width: 20,
    height: 20,
    bottom: -2,
    right: -2,
  },
  
  verifiedSizeXlarge: {
    width: 24,
    height: 24,
    bottom: -2,
    right: -2,
  },
});

export default Avatar;