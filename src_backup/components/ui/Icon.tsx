/**
 * Icon Component - Manito Design System
 * Scalable icon system using Unicode emojis and symbols
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';

// Professional icon library for the Manito marketplace using vector-style Unicode symbols
export const iconLibrary = {
  // Navigation & UI
  home: '⌂',
  search: '⌕',
  filter: '⚿',
  menu: '≡',
  close: '✕',
  back: '‹',
  forward: '›',
  up: '↑',
  down: '↓',
  
  // User & Profile
  user: '⚮',
  users: '⚭',
  avatar: '⚮',
  profile: '⚮',
  
  // Communication
  phone: '☎',
  email: '✉',
  message: '💬',
  notification: '⚠',
  
  // Services
  electrician: '⚡',
  plumber: '🔧',
  cleaner: '⚆',
  gardener: '❀',
  handyman: '⚒',
  painter: '⚏',
  carpenter: '⚒',
  
  // Trust & Security
  verified: '✓',
  shield: '⛨',
  lock: '🔒',
  unlock: '🔓',
  security: '⚿',
  
  // Rating & Reviews
  star: '★',
  starEmpty: '☆',
  thumbsUp: '⤴',
  thumbsDown: '⤵',
  heart: '♥',
  heartEmpty: '♡',
  
  // Status
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ⓘ',
  pending: '⧗',
  
  // Payment & Money
  money: '$',
  card: '💳',
  wallet: '⚈',
  payment: '$',
  escrow: '⚿',
  
  // Location
  location: '⌖',
  map: '⚞',
  
  // Calendar & Time
  calendar: '☷',
  clock: '⧖',
  
  // Media
  camera: '📷',
  image: '⚏',
  upload: '⤴',
  download: '⤵',
  
  // Actions
  edit: '✎',
  delete: '✗',
  save: '⚈',
  share: '⚋',
  copy: '⧉',
  
  // Chilean Specific
  chile: 'CL',
  peso: '$',
  rut: 'ID',
  
  // Marketplace
  booking: '☷',
  provider: '⚮',
  customer: '⚮',
  job: '⚏',
  
  // Miscellaneous
  settings: '⚙',
  help: '?',
  document: '⚏',
  folder: '⚏',
} as const;

export type IconName = keyof typeof iconLibrary;

export interface IconProps {
  /** Icon name from the icon library */
  name: IconName;
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Icon color */
  color?: string;
  /** Custom style overrides */
  style?: TextStyle;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  style,
}) => {
  const iconStyle = [
    styles.base,
    styles[size],
    color && { color },
    style,
  ];

  return (
    <Text style={iconStyle}>
      {iconLibrary[name]}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  
  // Sizes
  xs: {
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.fontSize.xs * 1.2,
  },
  sm: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.fontSize.sm * 1.2,
  },
  md: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.fontSize.base * 1.2,
  },
  lg: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.fontSize.lg * 1.2,
  },
  xl: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.fontSize.xl * 1.2,
  },
  '2xl': {
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: theme.typography.fontSize['2xl'] * 1.2,
  },
  '3xl': {
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: theme.typography.fontSize['3xl'] * 1.2,
  },
});

export default Icon;