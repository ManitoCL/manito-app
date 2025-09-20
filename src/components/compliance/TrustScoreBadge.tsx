/**
 * Trust Score Badge Component
 *
 * Displays user trust score with Chilean compliance indicators
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrustScoreResult } from '../../services/chilean/chileanComplianceService';

interface TrustScoreBadgeProps {
  trustScore: TrustScoreResult;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  trustScore,
  size = 'medium',
  showDetails = false
}) => {
  const getTrustLevelColor = (level: string): string => {
    switch (level) {
      case 'elite': return '#FFD700'; // Gold
      case 'premium': return '#C0C0C0'; // Silver
      case 'verified': return '#1976D2'; // Blue
      case 'basic': return '#4CAF50'; // Green
      default: return '#757575'; // Gray
    }
  };

  const getTrustLevelText = (level: string): string => {
    switch (level) {
      case 'elite': return 'Elite';
      case 'premium': return 'Premium';
      case 'verified': return 'Verificado';
      case 'basic': return 'Básico';
      default: return 'Sin verificar';
    }
  };

  const getTrustIcon = (level: string): string => {
    switch (level) {
      case 'elite': return '=Q';
      case 'premium': return 'P';
      case 'verified': return '';
      case 'basic': return '';
      default: return 'S';
    }
  };

  const sizeStyles = size === 'small' ? { width: 60, height: 20, fontSize: 12 } :
                     size === 'large' ? { width: 120, height: 40, fontSize: 16 } :
                     { width: 80, height: 30, fontSize: 14 };

  const trustColor = getTrustLevelColor(trustScore.trust_level);

  return (
    <View style={styles.container}>
      <View style={[
        styles.badge,
        {
          backgroundColor: trustColor,
          width: sizeStyles.width,
          height: sizeStyles.height,
        }
      ]}>
        <Text style={[styles.icon, { fontSize: sizeStyles.fontSize }]}>
          {getTrustIcon(trustScore.trust_level)}
        </Text>
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize - 2 }]}>
          {getTrustLevelText(trustScore.trust_level)}
        </Text>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.scoreText}>
            Puntaje: {trustScore.trust_score}/100
          </Text>
          <Text style={styles.dateText}>
            Actualizado: {new Date(trustScore.calculated_at).toLocaleDateString('es-CL')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 4,
    color: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  details: {
    marginTop: 8,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});