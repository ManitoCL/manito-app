/**
 * RatingDisplay Component - Manito Marketplace
 * Professional rating display with stars and review count
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

export interface RatingDisplayProps {
  /** Rating value (0-5) */
  rating: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Show rating number */
  showRating?: boolean;
  /** Show review count */
  showReviewCount?: boolean;
  /** Star size */
  size?: 'small' | 'medium' | 'large';
  /** Make rating pressable */
  onPress?: () => void;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Show empty stars for unrated */
  showEmptyStars?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  showRating = true,
  showReviewCount = true,
  size = 'medium',
  onPress,
  style,
  showEmptyStars = true,
}) => {
  const starSize = getStarSize(size);
  const fontSize = getFontSize(size);
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={`full-${i}`} style={[styles.star, { fontSize: starSize }]}>
          ★
        </Text>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <View key="half" style={styles.halfStarContainer}>
          <Text style={[styles.starEmpty, { fontSize: starSize }]}>★</Text>
          <Text style={[styles.starHalf, { fontSize: starSize }]}>★</Text>
        </View>
      );
    }

    // Empty stars
    if (showEmptyStars) {
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <Text key={`empty-${i}`} style={[styles.starEmpty, { fontSize: starSize }]}>
            ★
          </Text>
        );
      }
    }

    return stars;
  };

  const containerStyle = [
    styles.container,
    styles[size],
    style,
  ];

  const content = (
    <View style={containerStyle}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      
      {showRating && (
        <Text style={[styles.ratingText, { fontSize }]}>
          {rating.toFixed(1)}
        </Text>
      )}
      
      {showReviewCount && reviewCount !== undefined && (
        <Text style={[styles.reviewCount, { fontSize: fontSize * 0.9 }]}>
          ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const getStarSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 12;
    case 'medium':
      return 16;
    case 'large':
      return 20;
    default:
      return 16;
  }
};

const getFontSize = (size: string): number => {
  switch (size) {
    case 'small':
      return theme.typography.fontSize.xs;
    case 'medium':
      return theme.typography.fontSize.sm;
    case 'large':
      return theme.typography.fontSize.base;
    default:
      return theme.typography.fontSize.sm;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  small: {
    gap: theme.spacing[1],
  },
  
  medium: {
    gap: theme.spacing[2],
  },
  
  large: {
    gap: theme.spacing[2],
  },
  
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  star: {
    color: theme.colors.accent.amber,
    marginRight: 1,
  },
  
  starEmpty: {
    color: theme.colors.neutral[300],
    marginRight: 1,
  },
  
  halfStarContainer: {
    position: 'relative',
    marginRight: 1,
  },
  
  starHalf: {
    position: 'absolute',
    color: theme.colors.accent.amber,
    overflow: 'hidden',
    width: '50%',
  },
  
  ratingText: {
    color: theme.colors.neutral[700],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  reviewCount: {
    color: theme.colors.neutral[500],
    fontWeight: theme.typography.fontWeight.regular,
  },
});

export default RatingDisplay;