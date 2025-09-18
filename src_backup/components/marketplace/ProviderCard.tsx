/**
 * ProviderCard Component - Manito Marketplace
 * Professional provider profile card with trust indicators
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { Card, Avatar, Badge } from '../ui';
import VerificationBadge from './VerificationBadge';
import RatingDisplay from './RatingDisplay';

export interface ProviderCardProps {
  /** Provider ID */
  id: string;
  /** Provider name */
  name: string;
  /** Provider profession/specialization */
  profession: string;
  /** Provider description */
  description?: string;
  /** Profile image source */
  avatarSource?: { uri: string };
  /** Verification status */
  verified?: boolean;
  /** Rating (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Number of completed jobs */
  completedJobs?: number;
  /** Location/area served */
  location?: string;
  /** Price range or hourly rate */
  priceRange?: string;
  /** Availability status */
  availability?: 'available' | 'busy' | 'offline';
  /** Response time (in hours) */
  responseTime?: number;
  /** Card press handler */
  onPress?: () => void;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Custom style overrides */
  style?: ViewStyle;
  /** Show favorite button */
  showFavorite?: boolean;
  /** Favorite state */
  isFavorite?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id,
  name,
  profession,
  description,
  avatarSource,
  verified = false,
  rating,
  reviewCount,
  completedJobs,
  location,
  priceRange,
  availability = 'available',
  responseTime,
  onPress,
  variant = 'default',
  style,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const getAvailabilityConfig = () => {
    switch (availability) {
      case 'available':
        return {
          label: 'Disponible',
          variant: 'success' as const,
          color: theme.colors.status.available,
        };
      case 'busy':
        return {
          label: 'Ocupado',
          variant: 'warning' as const,
          color: theme.colors.status.busy,
        };
      case 'offline':
        return {
          label: 'No Disponible',
          variant: 'secondary' as const,
          color: theme.colors.neutral[400],
        };
      default:
        return {
          label: 'Desconocido',
          variant: 'secondary' as const,
          color: theme.colors.neutral[400],
        };
    }
  };

  const availabilityConfig = getAvailabilityConfig();

  const renderHeader = () => (
    <View style={styles.header}>
      <Avatar
        source={avatarSource}
        initials={name.charAt(0).toUpperCase()}
        size={variant === 'compact' ? 'medium' : 'large'}
        verified={verified}
        showStatus={true}
        status={availability === 'available' ? 'online' : 'offline'}
      />
      
      <View style={styles.headerInfo}>
        <View style={styles.nameRow}>
          <Text style={[
            styles.name,
            variant === 'featured' && styles.featuredName
          ]}>
            {name}
          </Text>
          {showFavorite && (
            <TouchableOpacity
              onPress={onFavoriteToggle}
              style={styles.favoriteButton}
            >
              <Text style={[
                styles.favoriteIcon,
                isFavorite && styles.favoriteIconActive
              ]}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.profession}>{profession}</Text>
        
        <View style={styles.badgesRow}>
          {verified && (
            <VerificationBadge
              status="verified"
              size="small"
            />
          )}
          <Badge
            label={availabilityConfig.label}
            variant={availabilityConfig.variant}
            size="small"
          />
        </View>
      </View>
    </View>
  );

  const renderStats = () => {
    const hasStats = rating || completedJobs || responseTime;
    if (!hasStats) return null;

    return (
      <View style={styles.statsContainer}>
        {rating && (
          <RatingDisplay
            rating={rating}
            reviewCount={reviewCount}
            size="small"
            showReviewCount={variant !== 'compact'}
          />
        )}
        
        {completedJobs && (
          <Text style={styles.statText}>
            {completedJobs} trabajos completados
          </Text>
        )}
        
        {responseTime && (
          <Text style={styles.statText}>
            Responde en {responseTime}h
          </Text>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    const hasFooter = location || priceRange;
    if (!hasFooter) return null;

    return (
      <View style={styles.footer}>
        {location && (
          <Text style={styles.location}>📍 {location}</Text>
        )}
        {priceRange && (
          <Text style={styles.price}>{priceRange}</Text>
        )}
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <Card
        style={[styles.compactCard, style]}
        onPress={onPress}
        padding="small"
      >
        {renderHeader()}
        {renderStats()}
      </Card>
    );
  }

  return (
    <Card
      style={[
        styles.card,
        variant === 'featured' && styles.featuredCard,
        style
      ]}
      onPress={onPress}
      variant={variant === 'featured' ? 'elevated' : 'default'}
      padding="medium"
    >
      {renderHeader()}
      
      {description && variant !== 'compact' && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
      
      {renderStats()}
      {renderFooter()}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing[3],
  },
  
  featuredCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    backgroundColor: theme.colors.primary[50],
  },
  
  compactCard: {
    marginBottom: theme.spacing[2],
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  
  headerInfo: {
    flex: 1,
    marginLeft: theme.spacing[3],
  },
  
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
  },
  
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    flex: 1,
  },
  
  featuredName: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary[800],
  },
  
  profession: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[2],
  },
  
  badgesRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    alignItems: 'center',
  },
  
  favoriteButton: {
    padding: theme.spacing[1],
  },
  
  favoriteIcon: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  favoriteIconActive: {
    // Active state handled by emoji change
  },
  
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[3],
  },
  
  statsContainer: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  
  statText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
  },
  
  location: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    flex: 1,
  },
  
  price: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default ProviderCard;