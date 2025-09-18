/**
 * VerificationBadge Component - Manito Marketplace
 * Trust indicator for verified service providers
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';
import { Badge } from '../ui';

export interface VerificationBadgeProps {
  /** Verification status */
  status: 'verified' | 'pending' | 'rejected' | 'not_verified';
  /** Verification type */
  type?: 'identity' | 'background' | 'certification' | 'insurance' | 'all';
  /** Show detailed verification info */
  detailed?: boolean;
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  /** Custom style overrides */
  style?: ViewStyle;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  type = 'all',
  detailed = false,
  size = 'medium',
  style,
}) => {
  const getVerificationConfig = () => {
    switch (status) {
      case 'verified':
        return {
          label: getVerificationLabel(type, true),
          variant: 'verified' as const,
          icon: '✓',
          description: 'Profesional verificado por Manito',
        };
      case 'pending':
        return {
          label: 'Verificación Pendiente',
          variant: 'pending' as const,
          icon: '⏳',
          description: 'Verificación en proceso',
        };
      case 'rejected':
        return {
          label: 'Verificación Rechazada',
          variant: 'error' as const,
          icon: '✗',
          description: 'No cumple con los requisitos',
        };
      default:
        return {
          label: 'Sin Verificar',
          variant: 'secondary' as const,
          icon: '?',
          description: 'Verificación no completada',
        };
    }
  };

  const getVerificationLabel = (verificationType: string, isVerified: boolean) => {
    if (!isVerified) return 'Sin Verificar';
    
    switch (verificationType) {
      case 'identity':
        return 'RUT Verificado';
      case 'background':
        return 'Antecedentes OK';
      case 'certification':
        return 'Certificado';
      case 'insurance':
        return 'Asegurado';
      case 'all':
      default:
        return 'Verificado';
    }
  };

  const config = getVerificationConfig();

  if (detailed) {
    return (
      <View style={[styles.detailedContainer, style]}>
        <View style={styles.badgeRow}>
          <Text style={styles.icon}>{config.icon}</Text>
          <Badge
            label={config.label}
            variant={config.variant}
            size={size}
          />
        </View>
        <Text style={styles.description}>{config.description}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Badge
        label={config.label}
        variant={config.variant}
        size={size}
        icon={<Text style={styles.badgeIcon}>{config.icon}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  
  detailedContainer: {
    alignItems: 'flex-start',
  },
  
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
  },
  
  icon: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing[2],
  },
  
  badgeIcon: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.background,
  },
  
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontStyle: 'italic',
  },
});

export default VerificationBadge;