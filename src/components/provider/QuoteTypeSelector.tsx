/**
 * QuoteTypeSelector Component
 *
 * Unified quote type selector with progressive disclosure pattern.
 * Replaces fragmented visit toggle + visit details with single cohesive UI.
 *
 * UX Pattern: Radio selection with nested card that slides in when visit required
 *
 * Features:
 * - Two quote types: Direct quote vs Visit required
 * - Progressive disclosure: Visit details only shown when "visit required" selected
 * - Smooth animations using React Native Animated API
 * - Chilean market patterns: Free vs paid visit with deductibility option
 * - Full keyboard handling for price/notes inputs
 * - Accessible touch targets (44pt minimum)
 * - Integrates with Manito provider theme system
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useProviderTheme } from './ProviderThemeWrapper';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Type definitions
export type QuoteType = 'direct' | 'visit_required';

export interface VisitConfiguration {
  cost: number; // 0 = free, >0 = charged
  isDeductible: boolean;
  notes: string;
}

interface QuoteTypeSelectorProps {
  value: QuoteType;
  visitConfig: VisitConfiguration;
  onChange: (type: QuoteType) => void;
  onVisitConfigChange: (config: VisitConfiguration) => void;
}

// Character limits
const MAX_VISIT_NOTES_LENGTH = 300;

/**
 * Main Component
 *
 * Architecture: Single component with conditional rendering
 * State management: Internal state for smooth UX, syncs with parent immediately
 * Animation: LayoutAnimation for smooth expand/collapse
 */
export const QuoteTypeSelector: React.FC<QuoteTypeSelectorProps> = ({
  value,
  visitConfig,
  onChange,
  onVisitConfigChange,
}) => {
  const theme = useProviderTheme();

  // Internal state for smooth transitions
  const [selectedType, setSelectedType] = useState<QuoteType>(value);
  const [localVisitConfig, setLocalVisitConfig] = useState<VisitConfiguration>(visitConfig);
  const [visitCostInputValue, setVisitCostInputValue] = useState<string>(
    visitConfig.cost > 0 ? visitConfig.cost.toString() : ''
  );

  // Animation value for nested card
  const nestedCardOpacity = useRef(new Animated.Value(value === 'visit_required' ? 1 : 0)).current;

  // Sync external changes to internal state
  useEffect(() => {
    setSelectedType(value);
  }, [value]);

  useEffect(() => {
    setLocalVisitConfig(visitConfig);
    setVisitCostInputValue(visitConfig.cost > 0 ? visitConfig.cost.toString() : '');
  }, [visitConfig]);

  // Handle quote type selection
  const handleQuoteTypeChange = (type: QuoteType) => {
    // Configure smooth animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Update internal state
    setSelectedType(type);

    // Animate nested card
    Animated.timing(nestedCardOpacity, {
      toValue: type === 'visit_required' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Notify parent immediately
    onChange(type);
  };

  // Handle visit cost type change (free vs paid)
  const handleVisitCostTypeChange = (isFree: boolean) => {
    const updatedConfig = {
      ...localVisitConfig,
      cost: isFree ? 0 : (parseInt(visitCostInputValue, 10) || 5000), // Default to $5,000 CLP
    };

    setLocalVisitConfig(updatedConfig);
    onVisitConfigChange(updatedConfig);

    // If switching to paid, set default value and show it
    if (!isFree && updatedConfig.cost > 0) {
      setVisitCostInputValue(updatedConfig.cost.toString());
    }
  };

  // Handle price input change
  const handlePriceChange = (text: string) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    setVisitCostInputValue(numericValue);

    // Update parent on every keystroke (for real-time validation)
    const cost = parseInt(numericValue, 10) || 0;
    const updatedConfig = {
      ...localVisitConfig,
      cost,
    };
    setLocalVisitConfig(updatedConfig);
    onVisitConfigChange(updatedConfig);
  };

  // Handle deductible toggle
  const handleDeductibleToggle = () => {
    const updatedConfig = {
      ...localVisitConfig,
      isDeductible: !localVisitConfig.isDeductible,
    };
    setLocalVisitConfig(updatedConfig);
    onVisitConfigChange(updatedConfig);
  };

  // Handle notes change
  const handleNotesChange = (text: string) => {
    // Enforce max length
    if (text.length > MAX_VISIT_NOTES_LENGTH) return;

    const updatedConfig = {
      ...localVisitConfig,
      notes: text,
    };
    setLocalVisitConfig(updatedConfig);
    onVisitConfigChange(updatedConfig);
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('es-CL')}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            📋 Tipo de Cotización
          </Text>
        </View>

        {/* Radio Option 1: Direct Quote */}
        <TouchableOpacity
          style={[
            styles.radioOption,
            selectedType === 'direct' && [
              styles.radioOptionSelected,
              { backgroundColor: `${theme.colors.primary}08`, borderColor: theme.colors.primary },
            ],
          ]}
          onPress={() => handleQuoteTypeChange('direct')}
          activeOpacity={0.7}
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedType === 'direct' }}
          accessibilityLabel="Puedo cotizar ahora"
        >
          <View style={styles.radioOptionLeft}>
            <View style={[styles.radioCircle, { borderColor: theme.colors.border }]}>
              {selectedType === 'direct' && (
                <View style={[styles.radioCircleInner, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <View style={styles.radioOptionText}>
              <Text style={[styles.radioLabel, { color: theme.colors.textPrimary }]}>
                Puedo cotizar ahora
              </Text>
              <Text style={[styles.radioSublabel, { color: theme.colors.textSecondary }]}>
                Conozco el alcance del trabajo
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Radio Option 2: Visit Required */}
        <TouchableOpacity
          style={[
            styles.radioOption,
            selectedType === 'visit_required' && [
              styles.radioOptionSelected,
              { backgroundColor: `${theme.colors.primary}08`, borderColor: theme.colors.primary },
            ],
          ]}
          onPress={() => handleQuoteTypeChange('visit_required')}
          activeOpacity={0.7}
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedType === 'visit_required' }}
          accessibilityLabel="Necesito visita en sitio"
        >
          <View style={styles.radioOptionLeft}>
            <View style={[styles.radioCircle, { borderColor: theme.colors.border }]}>
              {selectedType === 'visit_required' && (
                <View style={[styles.radioCircleInner, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <View style={styles.radioOptionText}>
              <Text style={[styles.radioLabel, { color: theme.colors.textPrimary }]}>
                Necesito visita en sitio
              </Text>
              <Text style={[styles.radioSublabel, { color: theme.colors.textSecondary }]}>
                Debo evaluar antes de cotizar
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Nested Card: Visit Details (Progressive Disclosure) */}
        {selectedType === 'visit_required' && (
          <Animated.View
            style={[
              styles.nestedCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                opacity: nestedCardOpacity,
              },
            ]}
          >
            {/* Nested Card Header */}
            <View style={styles.nestedCardHeader}>
              <Text style={[styles.nestedCardTitle, { color: theme.colors.textPrimary }]}>
                📍 Detalles de la Visita
              </Text>
            </View>

            {/* Visit Cost Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>
                Costo de la visita:
              </Text>

              {/* Horizontal Radio: Free vs Paid */}
              <View style={styles.horizontalRadioContainer}>
                {/* Free Option */}
                <TouchableOpacity
                  style={[
                    styles.horizontalRadioOption,
                    localVisitConfig.cost === 0 && [
                      styles.horizontalRadioOptionSelected,
                      { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}08` },
                    ],
                  ]}
                  onPress={() => handleVisitCostTypeChange(true)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: localVisitConfig.cost === 0 }}
                  accessibilityLabel="Visita gratis"
                >
                  <View style={[styles.smallRadioCircle, { borderColor: theme.colors.border }]}>
                    {localVisitConfig.cost === 0 && (
                      <View
                        style={[styles.smallRadioCircleInner, { backgroundColor: theme.colors.primary }]}
                      />
                    )}
                  </View>
                  <Text style={[styles.horizontalRadioLabel, { color: theme.colors.textPrimary }]}>
                    Gratis
                  </Text>
                </TouchableOpacity>

                {/* Paid Option */}
                <TouchableOpacity
                  style={[
                    styles.horizontalRadioOption,
                    styles.paidRadioOption,
                    localVisitConfig.cost > 0 && [
                      styles.horizontalRadioOptionSelected,
                      { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}08` },
                    ],
                  ]}
                  onPress={() => handleVisitCostTypeChange(false)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: localVisitConfig.cost > 0 }}
                  accessibilityLabel="Cobrar por visita"
                >
                  <View style={[styles.smallRadioCircle, { borderColor: theme.colors.border }]}>
                    {localVisitConfig.cost > 0 && (
                      <View
                        style={[styles.smallRadioCircleInner, { backgroundColor: theme.colors.primary }]}
                      />
                    )}
                  </View>
                  <Text style={[styles.horizontalRadioLabel, { color: theme.colors.textPrimary }]}>
                    Cobrar:
                  </Text>

                  {/* Inline Price Input */}
                  {localVisitConfig.cost > 0 && (
                    <TextInput
                      style={[
                        styles.inlinePriceInput,
                        {
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surface,
                        },
                      ]}
                      value={visitCostInputValue}
                      onChangeText={handlePriceChange}
                      keyboardType="numeric"
                      placeholder="5000"
                      placeholderTextColor={theme.colors.textMuted}
                      maxLength={7} // Max 9,999,999 CLP
                      autoFocus={false} // Don't auto-focus to avoid keyboard popping up unexpectedly
                      accessibilityLabel="Costo de la visita"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Deductible Checkbox */}
            {localVisitConfig.cost > 0 && (
              <TouchableOpacity
                style={[styles.checkboxRow, { borderColor: theme.colors.border }]}
                onPress={handleDeductibleToggle}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: localVisitConfig.isDeductible }}
                accessibilityLabel="Descontable del trabajo final"
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: localVisitConfig.isDeductible
                        ? theme.colors.primary
                        : theme.colors.surface,
                    },
                  ]}
                >
                  {localVisitConfig.isDeductible && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}>
                  Descontable del trabajo final
                </Text>
              </TouchableOpacity>
            )}

            {/* Notes TextArea */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>
                Notas para el cliente:
              </Text>
              <TextInput
                style={[
                  styles.notesTextArea,
                  {
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                value={localVisitConfig.notes}
                onChangeText={handleNotesChange}
                placeholder='Ej: "Necesito medir el espacio y evaluar el estado de las instalaciones"'
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={MAX_VISIT_NOTES_LENGTH}
                accessibilityLabel="Notas de la visita"
              />
              <Text style={[styles.characterCount, { color: theme.colors.textMuted }]}>
                {localVisitConfig.notes.length}/{MAX_VISIT_NOTES_LENGTH}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  // Outer Card
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    lineHeight: 22,
  },

  // Radio Options
  radioOption: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
    minHeight: 44, // Accessibility: minimum touch target
  },

  radioOptionSelected: {
    borderWidth: 2,
    // backgroundColor and borderColor set dynamically
  },

  radioOptionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2, // Align with first line of text
  },

  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  radioOptionText: {
    flex: 1,
  },

  radioLabel: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    lineHeight: 22,
    marginBottom: 4,
  },

  radioSublabel: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    lineHeight: 20,
  },

  // Nested Card (Progressive Disclosure)
  nestedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
  },

  nestedCardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },

  nestedCardTitle: {
    fontSize: 15,
    fontFamily: 'Rubik-Bold',
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    marginBottom: 12,
    lineHeight: 20,
  },

  // Horizontal Radio (Free vs Paid)
  horizontalRadioContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  horizontalRadioOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 44, // Accessibility: minimum touch target
  },

  paidRadioOption: {
    flex: 2, // More space for price input
  },

  horizontalRadioOptionSelected: {
    borderWidth: 2,
    // backgroundColor and borderColor set dynamically
  },

  smallRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  smallRadioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  horizontalRadioLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    marginRight: 8,
  },

  // Inline Price Input
  inlinePriceInput: {
    flex: 1,
    height: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    textAlign: 'right',
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 44, // Accessibility: minimum touch target
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Rubik-Bold',
  },

  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    lineHeight: 20,
  },

  // Notes TextArea
  notesTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    lineHeight: 20,
    minHeight: 100,
  },

  characterCount: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
});
