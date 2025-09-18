/**
 * ServiceCard Component - Manito Marketplace
 * Professional service category card for browsing and navigation
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
import { Card, Badge, Icon, IconName } from '../ui';

export interface ServiceCardProps {
  /** Service icon name from icon library or emoji string or ReactNode */
  icon: IconName | string | React.ReactNode;
  /** Service name */
  name: string;
  /** Service description */
  description?: string;
  /** Number of available providers */
  providerCount?: number;
  /** Average rating for this service category */
  averageRating?: number;
  /** Starting price range */
  priceRange?: string;
  /** Card press handler */
  onPress?: () => void;
  /** Card variant */
  variant?: 'default' | 'featured' | 'compact';
  /** Custom style overrides */
  style?: ViewStyle;
  /** Show popular badge */
  popular?: boolean;
  /** Show new badge */
  isNew?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  name,
  description,
  providerCount,
  averageRating,
  priceRange,
  onPress,
  variant = 'default',
  style,
  popular = false,
  isNew = false,
}) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      // Check if it's an icon name from our library
      const isIconName = ['electrician', 'plumber', 'cleaner', 'gardener', 'handyman', 'painter', 'carpenter'].includes(icon);
      
      if (isIconName) {
        const iconSize = variant === 'compact' ? 'lg' : 'xl';
        return (
          <Icon 
            name={icon as IconName} 
            size={iconSize}
            color={theme.colors.primary[600]}
          />
        );
      }
      
      // Fallback for emoji strings
      return (
        <Text style={[
          styles.iconText,
          styles[`iconText${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles]
        ]}>
          {icon}
        </Text>
      );
    }
    return <View style={styles.iconContainer}>{icon}</View>;
  };

  const renderBadges = () => {
    if (!popular && !isNew) return null;
    
    return (
      <View style={styles.badgesContainer}>
        {popular && (
          <Badge
            label="Popular"
            variant="warning"
            size="small"
          />
        )}
        {isNew && (
          <Badge
            label="Nuevo"
            variant="info"
            size="small"
          />
        )}
      </View>
    );
  };

  const renderStats = () => {
    if (!providerCount && !averageRating && !priceRange) return null;

    return (
      <View style={styles.statsContainer}>
        {providerCount && (
          <Text style={styles.statText}>
            {providerCount} profesionales
          </Text>
        )}
        {averageRating && (
          <Text style={styles.statText}>
            ★ {averageRating.toFixed(1)}
          </Text>
        )}
        {priceRange && (
          <Text style={styles.priceText}>
            Desde {priceRange}
          </Text>
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
        <View style={styles.compactContent}>
          {renderIcon()}
          <Text style={styles.compactName}>{name}</Text>
          {renderBadges()}
        </View>
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
      <View style={styles.header}>
        <View style={styles.iconAndTitle}>
          {renderIcon()}
          <View style={styles.titleContainer}>
            <Text style={[
              styles.name,
              variant === 'featured' && styles.featuredName
            ]}>
              {name}
            </Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
        </View>
        {renderBadges()}
      </View>
      
      {renderStats()}
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
    minHeight: 80,
  },
  
  compactContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  
  compactName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[800],
    textAlign: 'center',
    marginTop: theme.spacing[1],
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  
  iconContainer: {
    marginRight: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  
  iconText: {
    marginRight: theme.spacing[3],
  },
  
  iconTextDefault: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  
  iconTextFeatured: {
    fontSize: theme.typography.fontSize['3xl'],
  },
  
  iconTextCompact: {
    fontSize: theme.typography.fontSize.xl,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[1],
  },
  
  featuredName: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary[800],
  },
  
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  
  badgesContainer: {
    flexDirection: 'row',
    gap: theme.spacing[1],
    alignItems: 'flex-start',
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
  },
  
  statText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  priceText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default ServiceCard;