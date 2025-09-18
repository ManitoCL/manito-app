/**
 * Manito Custom Icon Library
 * Enterprise-level custom SVG icons designed specifically for the Chilean marketplace
 */

import * as React from 'react';
import { Svg, Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Base Icon Component
const IconBase: React.FC<IconProps & { children: React.ReactNode; viewBox?: string }> = ({
  size = 24,
  color = '#374151',
  children,
  viewBox = '0 0 24 24',
}) => (
  <Svg width={size} height={size} viewBox={viewBox} fill="none">
    {children}
  </Svg>
);

// Shield with checkmark - Trust and verification
export const ShieldCheckIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M12 2L4 6v6c0 5.55 3.84 9.74 8 10 4.16-.26 8-4.45 8-10V6l-8-4z"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Home services icon - House with tools
export const HomeServicesIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M3 12l2-2m0 0l7-7 7 7m-2 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m2-2l5-5 5 5"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 16h4v2h-4v-2z"
      fill={props.color}
    />
    <Circle cx="15" cy="8" r="1" fill={props.color} />
  </IconBase>
);

// Secure payment - Credit card with lock
export const SecurePaymentIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Rect
      x="2"
      y="6"
      width="20"
      height="12"
      rx="3"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M2 10h20"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M12 14h3"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M8 14a1 1 0 100-2 1 1 0 000 2z"
      fill={props.color}
    />
    <Path
      d="M17 4v2m0 0a2 2 0 012 2v1m-2-3a2 2 0 00-2 2v1m4 0H15"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 1.5}
      strokeLinecap="round"
    />
  </IconBase>
);

// Professional verified - User with badge
export const VerifiedProfessionalIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M18 8l2 2 4-4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// 24/7 Support - Clock with headphones
export const SupportIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 8a3 3 0 00-6 0v4a3 3 0 006 0V8z"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 1.5}
      strokeLinecap="round"
    />
  </IconBase>
);

// Star rating - Five-pointed star
export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <IconBase {...props}>
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Chilean map outline
export const ChileMapIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} viewBox="0 0 24 48">
    <Path
      d="M12 2c-1 0-2 .5-2.5 1.5L8 6l-1 3v6l1 3 1 4v6l1 3 1 4v6l1 3 1 2c.5 1 1.5 1.5 2.5 1.5s2-.5 2.5-1.5l1-2 1-3v-6l1-4 1-3v-6l1-4 1-3v-6l-1-3-1.5-2.5C14 2.5 13 2 12 2z"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </IconBase>
);

// RUT ID card - Chilean identification
export const RutIdIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Rect
      x="2"
      y="6"
      width="20"
      height="12"
      rx="2"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Circle cx="8" cy="12" r="2" stroke={props.color} strokeWidth={props.strokeWidth || 2} />
    <Path
      d="M14 10h4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M14 14h4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M2 16h20"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 1}
      strokeDasharray="2 2"
    />
  </IconBase>
);

// Tools - Wrench and screwdriver crossed
export const ToolsIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 7l3 3"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Insurance/Protection - Umbrella
export const InsuranceIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7h6v7z"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M12 2v10"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
  </IconBase>
);

// Quick response - Lightning bolt
export const QuickResponseIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill={props.color}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Mobile app - Phone with interface
export const MobileAppIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="2"
      ry="2"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M12 18h.01"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 6h8"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M8 10h8"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M8 14h5"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
  </IconBase>
);

// Arrow right - Navigation
export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M5 12h14"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 5l7 7-7 7"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Check circle - Success/completion
export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Thumbs up - Satisfaction/approval
export const ThumbsUpIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </IconBase>
);

// Search - Magnifying glass
export const SearchIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Circle
      cx="11"
      cy="11"
      r="8"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Chevron Left - Navigation arrow
export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M15 18l-6-6 6-6"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Chevron Right - Navigation arrow
export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path
      d="M9 18l6-6-6-6"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Navigation Icons

// Home - House icon for main tab
export const HomeIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <IconBase {...props}>
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12h6v10"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// User Profile - Person icon for profile tab
export const UserIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <IconBase {...props}>
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
  </IconBase>
);

// Marketplace/Services - Grid icon for services tab (future use)
export const ServicesIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <IconBase {...props}>
    <Rect
      x="3"
      y="3"
      width="7"
      height="7"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x="14"
      y="3"
      width="7"
      height="7"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x="14"
      y="14"
      width="7"
      height="7"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x="3"
      y="14"
      width="7"
      height="7"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Messages/Chat - Message icon for messaging tab (future use)
export const MessageIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <IconBase {...props}>
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Bookings - Calendar icon for bookings tab (future use)
export const BookingsIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <IconBase {...props}>
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      fill={filled ? props.color : 'none'}
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
    />
    <Path
      d="M16 2v4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M8 2v4"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
    <Path
      d="M3 10h18"
      stroke={props.color}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
    />
  </IconBase>
);

// Export all icons
export const Icons = {
  ShieldCheck: ShieldCheckIcon,
  Shield: ShieldCheckIcon, // Alias for backward compatibility
  HomeServices: HomeServicesIcon,
  SecurePayment: SecurePaymentIcon,
  VerifiedProfessional: VerifiedProfessionalIcon,
  Support: SupportIcon,
  Star: StarIcon,
  ChileMap: ChileMapIcon,
  RutId: RutIdIcon,
  Tools: ToolsIcon,
  Insurance: InsuranceIcon,
  QuickResponse: QuickResponseIcon,
  MobileApp: MobileAppIcon,
  ArrowRight: ArrowRightIcon,
  CheckCircle: CheckCircleIcon,
  ThumbsUp: ThumbsUpIcon,
  Search: SearchIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  // Navigation Icons
  Home: HomeIcon,
  User: UserIcon,
  Services: ServicesIcon,
  Message: MessageIcon,
  Bookings: BookingsIcon,
};