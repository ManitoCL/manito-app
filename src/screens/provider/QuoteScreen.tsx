/**
 * QuoteScreen
 * Full screen for composing and sending quotes
 * Uses Airbnb host pattern: cards with bottom sheet editors
 *
 * Features:
 * - Smart distance optimization:
 *   • If Haversine < free radius → Travel fee = $0, no API call
 *   • If Haversine >= free radius → Calls Distance Matrix API for accurate fee
 * - Recalculates travel fee based on accurate distance
 * - Caches result to avoid repeated API calls
 * - Saves ~70-80% of API costs by skipping calls for nearby jobs
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProviderThemeWrapper, useProviderTheme } from '../../components/provider/ProviderThemeWrapper';
import { ChevronRightIcon, XIcon, ChevronLeftIcon } from '../../components/icons';
import { HelperText } from '../../components/common';
import { brandColors, spacing } from '../../design-system/tokens';
import type { AvailableJob } from '../../services/providerJobsService';
import { submitProviderQuote } from '../../services/providerJobsService';
import { fetchProviderQuoteOptions } from '../../services/businessEntityService';
import type { QuoteOption } from '../../types/business-entities';
import { calculateIVA, formatDocumentType } from '../../types/business-entities';
import { PriceBreakdownEditor } from '../../components/provider/PriceBreakdownEditor';
import { DurationEditor } from '../../components/provider/DurationEditor';
import { TextEditor } from '../../components/provider/TextEditor';
import { MaterialsEditor, type MaterialItem } from '../../components/provider/MaterialsEditor';
import { useAuth } from '../../contexts/AuthContext';
import { useAccurateDistance } from '../../hooks/useAccurateDistance';
import { calculateProviderQuote } from '../../services/providerPricingService';
import { supabase } from '../../services/supabase';
import type { SessionStructure } from '../../types/scheduling';
import { QuoteTypeSelector, type QuoteType, type VisitConfiguration } from '../../components/provider/QuoteTypeSelector';

interface QuoteScreenProps {
  navigation: any;
  route: {
    params: {
      job: AvailableJob;
    };
  };
}

type BottomSheetType = 'price' | 'duration' | 'materials' | 'notes' | null;

export const QuoteScreen: React.FC<QuoteScreenProps> = ({ route, navigation }) => {
  const { job } = route.params;
  const theme = useProviderTheme();
  const { user } = useAuth();

  // Helper to extract breakdown from new 4-category structure
  const getInitialBreakdown = () => {
    const calc = job.suggested_quote?.calculation_breakdown;
    if (!calc) {
      return { labor: 0, materials: 0, travel: 0, fees: 0 };
    }

    // New clean structure from backend
    return {
      labor: calc.labor_subtotal || 0,
      materials: calc.materials_subtotal || 0,
      travel: calc.travel_fee_clp || 0,
      fees: calc.fees_subtotal || 0,
    };
  };

  // Quote state
  const [priceBreakdown, setPriceBreakdown] = useState(getInitialBreakdown());
  const [customCharges, setCustomCharges] = useState<Array<{ label: string; amount: number }>>([]);
  const [suggestedLaborItems, setSuggestedLaborItems] = useState<Array<{ name: string; description?: string; amount: number }>>(
    job.suggested_quote?.calculation_breakdown?.labor_items || []
  );
  const [totalHours, setTotalHours] = useState(job.suggested_quote?.estimated_duration_hours || 2);
  const [sessionStructure, setSessionStructure] = useState<SessionStructure | undefined>(undefined);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [materialsNotes, setMaterialsNotes] = useState('');
  const [notes, setNotes] = useState(job.suggested_quote?.notes || '');

  // Bottom sheet state
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Business entity quote option (single option based on provider's account_type)
  const [quoteOption, setQuoteOption] = useState<QuoteOption | null>(null);
  const [ivaAmount, setIvaAmount] = useState<number>(0);

  // Unified quote type state (replaces fragmented visit toggle)
  const [quoteType, setQuoteType] = useState<QuoteType>('direct');
  const [visitConfig, setVisitConfig] = useState<VisitConfiguration>({
    cost: 0,
    isDeductible: true,
    notes: '',
  });

  // Fetch provider's quote option on mount
  useEffect(() => {
    if (user?.id) {
      fetchProviderQuoteOptions(user.id)
        .then(options => {
          // Will only return ONE option (individual OR business)
          if (options.length > 0) {
            setQuoteOption(options[0]);
          }
        })
        .catch(error => {
          console.error('Failed to fetch quote options:', error);
        });
    }
  }, [user?.id]);

  // Calculate IVA amount when total or quote option changes
  useEffect(() => {
    if (quoteOption && totalPrice > 0) {
      const iva = quoteOption.vat_exempt
        ? 0
        : calculateIVA(totalPrice, quoteOption.vat_rate);
      setIvaAmount(iva);
    }
  }, [totalPrice, quoteOption]);

  // Memoized callback to prevent infinite loop
  const handleQuoteRecalculated = useCallback(async () => {
    try {
      if (!user?.id) return;

      // Refetch the updated quote from the database
      const updatedQuote = await calculateProviderQuote(user.id, job.project_id);
      const calc = updatedQuote?.calculation_breakdown;
      if (calc) {
        // Update price breakdown with new clean structure
        setPriceBreakdown({
          labor: calc.labor_subtotal || 0,
          materials: calc.materials_subtotal || 0,
          travel: calc.travel_fee_clp || 0,
          fees: calc.fees_subtotal || 0,
        });
        // Update suggested labor items when distance changes
        setSuggestedLaborItems(calc.labor_items || []);
      }
    } catch (error) {
      console.error('Failed to refresh quote after distance update:', error);
    }
  }, [user?.id, job.project_id]);

  // Fetch accurate distance on mount and recalculate quote
  const {
    isLoadingDistance,
    error: distanceError,
    retry: retryDistance,
    isRetrying,
  } = useAccurateDistance(job.project_id, user?.id || '', {
    skip: !user?.id,
    onQuoteRecalculated: handleQuoteRecalculated,
  });

  // Calculate total (with NaN safety)
  const customChargesTotal = customCharges.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPrice = (Number(priceBreakdown.labor) || 0) +
                     (Number(priceBreakdown.materials) || 0) +
                     (Number(priceBreakdown.travel) || 0) +
                     customChargesTotal;

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSendQuote = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar el usuario. Por favor inicia sesión nuevamente.');
      return;
    }

    if (!quoteOption) {
      Alert.alert('Error', 'No se pudo determinar el tipo de entidad. Por favor recarga la pantalla.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Build labor items from suggested breakdown (backend-calculated base + add-ons)
      // CLEAN STRUCTURE: {name, description?, amount} - matches backend validation
      // Use suggested labor items from backend (preserves itemized breakdown like "Precio base", "Área grande", etc.)
      // instead of generic "Mano de obra" label

      // Build custom charge items from customCharges array
      // CLEAN STRUCTURE: {name, description?, amount}
      const customChargeItems = customCharges.map(charge => ({
        name: charge.label,
        description: null,
        amount: charge.amount,
      }));

      // Combine suggested labor items (backend itemization) with custom charges
      const allLaborItems = [...suggestedLaborItems, ...customChargeItems];

      // Build materials items from materials array
      // CLEAN STRUCTURE: {name, quantity, unit, price_per_unit, subtotal}
      const materialsItems = materials.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
        subtotal: item.subtotal,
      }));

      // Combine notes with materials notes and visit notes if present
      const notesToCombine = [notes.trim(), materialsNotes.trim()];
      if (quoteType === 'visit_required' && visitConfig.notes.trim()) {
        notesToCombine.push(`VISITA: ${visitConfig.notes.trim()}`);
      }
      const combinedNotes = notesToCombine.filter(Boolean).join('\n\n');

      // DEBUG: Log materials being sent
      console.log('📦 Materials being sent:', JSON.stringify(materialsItems, null, 2));
      console.log('📦 Materials count:', materialsItems.length);
      console.log('📦 Materials breakdown:', materials);
      console.log('🏠 Quote type:', quoteType);
      console.log('🏠 Visit config:', visitConfig);

      // Backend calculates ALL totals from JSONB arrays
      const { data: quoteData, error: quoteError} = await supabase.rpc('create_provider_quote_with_business_context', {
        p_project_id: job.project_id,
        p_provider_id: user.id,
        p_acting_as_business_id: quoteOption.business_id || null,
        // Send all pricing - provider always gives a quote/estimate
        p_labor_items: allLaborItems,
        p_materials_items: materialsItems,
        p_additional_fees: [],
        p_travel_fee_clp: priceBreakdown.travel,
        // Duration and session structure
        p_estimated_duration_hours: totalHours,
        p_notes: combinedNotes || null,
        p_hours_per_session: sessionStructure ? sessionStructure.sessions[0].hours : totalHours,
        p_requires_multiple_visits: sessionStructure !== undefined,
        p_project_timeline_estimate: null, // Removed - session structure is the timeline
        p_session_structure: sessionStructure || null,
        // Unified visit workflow parameters
        p_response_type: 'quote_now', // Always sending a quote/estimate
        p_requires_onsite_confirmation: quoteType === 'visit_required',
        p_site_visit_cost: quoteType === 'visit_required' ? visitConfig.cost : null,
      });

      if (quoteError) {
        console.error('❌ Quote creation error:', quoteError);
        throw quoteError;
      }

      console.log('✅ Quote created successfully:', quoteData);

      // Success message
      const alertTitle = '¡Cotización Enviada!';
      const alertMessage = quoteType === 'visit_required'
        ? 'Tu cotización ha sido enviada. Necesitarás una visita para confirmar el precio exacto.'
        : 'Tu cotización ha sido enviada al cliente.';

      Alert.alert(
        alertTitle,
        alertMessage,
        [
          {
            text: 'Entendido',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to submit quote:', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'No pudimos enviar tu cotización. Por favor intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProviderThemeWrapper>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeftIcon size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {job.project_type.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Distance Loading Banner */}
        {isLoadingDistance && (
          <View style={[styles.distanceBanner, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.distanceBannerText, { color: theme.colors.textSecondary }]}>
              {isRetrying ? 'Reintentando cálculo de distancia...' : 'Calculando distancia exacta...'}
            </Text>
          </View>
        )}

        {/* Distance Error Banner */}
        {distanceError && (
          <View style={[styles.distanceBanner, styles.errorBanner, { backgroundColor: '#FEE' }]}>
            <Text style={[styles.distanceBannerText, { color: '#C00' }]}>
              Error al calcular distancia: {distanceError.message}
            </Text>
            {distanceError.canRetry && (
              <TouchableOpacity
                onPress={retryDistance}
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Quote Entity Info Banner */}
          {quoteOption && (
            <View style={[styles.quoteInfoBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.quoteInfoRow}>
                <Text style={[styles.quoteInfoLabel, { color: theme.colors.textMuted }]}>
                  Cotizando como:
                </Text>
                <Text style={[styles.quoteInfoValue, { color: theme.colors.text }]}>
                  {quoteOption.option_type === 'business' ? '🏢' : '👤'} {quoteOption.display_name}
                </Text>
              </View>
              <View style={styles.quoteInfoRow}>
                <Text style={[styles.quoteInfoLabel, { color: theme.colors.textMuted }]}>
                  Documento:
                </Text>
                <Text style={[styles.quoteInfoValue, { color: theme.colors.text }]}>
                  {formatDocumentType(quoteOption.document_type)}
                </Text>
              </View>
              {!quoteOption.vat_exempt && (
                <View style={[styles.quoteInfoRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Text style={[styles.quoteInfoLabel, { color: '#F59E0B' }]}>
                    Se agregará {quoteOption.vat_rate}% IVA
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Unified Quote Type Selector - Replaces fragmented toggle + visit cards */}
          <QuoteTypeSelector
            value={quoteType}
            visitConfig={visitConfig}
            onChange={setQuoteType}
            onVisitConfigChange={setVisitConfig}
          />

          {/* Price Breakdown Card */}
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                onPress={() => setActiveSheet('price')}
                activeOpacity={0.7}
              >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                {quoteType === 'visit_required'
                  ? '💰 Estimación Preliminar (Opcional)'
                  : '💰 Desglose del Precio'}
              </Text>
              <ChevronRightIcon size={20} color={theme.colors.textMuted} />
            </View>
            {/* Warning banner when visit required */}
            {quoteType === 'visit_required' && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  ⚠️ Esta es solo una estimación. El precio exacto se confirmará después de la visita en sitio.
                </Text>
              </View>
            )}
            <View style={styles.priceBreakdown}>
              {/* MANO DE OBRA */}
              {(suggestedLaborItems.length > 0 || customCharges.length > 0) ? (
                <>
                  <Text style={[styles.categoryHeader, { color: theme.colors.textMuted }]}>
                    MANO DE OBRA
                  </Text>
                  {/* Pre-configured labor items from backend */}
                  {suggestedLaborItems.map((item, index) => (
                    <View key={`labor-${index}`} style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.priceValue, { color: theme.colors.textPrimary }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  ))}

                  {/* Custom charges (also under labor) */}
                  {customCharges.map((charge, index) => (
                    <View key={`charge-${index}`} style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                        {charge.label}
                      </Text>
                      <Text style={[styles.priceValue, { color: theme.colors.textPrimary }]}>
                        {formatCurrency(charge.amount)}
                      </Text>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.noPricingContainer}>
                  <Text style={[styles.noPricingText, { color: theme.colors.textMuted }]}>
                    Configura tu precio base para este tipo de servicio
                  </Text>
                  <Text style={[styles.noPricingHint, { color: theme.colors.textSecondary }]}>
                    Puedes agregar cargos personalizados por ahora
                  </Text>
                </View>
              )}

              {/* MATERIALES (only if materials exist) */}
              {materials.length > 0 && (
                <>
                  <Text style={[styles.categoryHeader, { color: theme.colors.textMuted, marginTop: spacing[3] }]}>
                    MATERIALES
                  </Text>
                  {materials.map((material, index) => (
                    <View key={`material-${index}`} style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                        {material.name}
                      </Text>
                      <Text style={[styles.priceValue, { color: theme.colors.textPrimary }]}>
                        {formatCurrency(material.subtotal)}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {/* TRASLADO (only if > 0) */}
              {priceBreakdown.travel > 0 && (
                <>
                  <Text style={[styles.categoryHeader, { color: theme.colors.textMuted, marginTop: spacing[3] }]}>
                    TRASLADO
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                      Traslado
                    </Text>
                    <Text style={[styles.priceValue, { color: theme.colors.textPrimary }]}>
                      {formatCurrency(priceBreakdown.travel)}
                    </Text>
                  </View>
                </>
              )}

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.priceRow}>
                <Text style={[styles.totalLabel, { color: theme.colors.textPrimary }]}>Total</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  {formatCurrency(totalPrice)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* IVA Breakdown */}
          {quoteOption && !quoteOption.vat_exempt && ivaAmount > 0 && (
            <View style={[styles.ivaBreakdown, { backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: '#F59E0B' }]}>
              <View style={styles.ivaRow}>
                <Text style={[styles.ivaLabel, { color: theme.colors.textSecondary }]}>Subtotal:</Text>
                <Text style={[styles.ivaAmount, { color: theme.colors.text }]}>
                  {formatCurrency(totalPrice)}
                </Text>
              </View>
              <View style={styles.ivaRow}>
                <Text style={[styles.ivaLabel, { color: '#F59E0B' }]}>IVA ({quoteOption.vat_rate}%):</Text>
                <Text style={[styles.ivaAmount, { color: '#F59E0B' }]}>
                  {formatCurrency(ivaAmount)}
                </Text>
              </View>
              <View style={[styles.ivaRow, styles.ivaTotalRow]}>
                <Text style={[styles.ivaTotalLabel, { color: theme.colors.text }]}>Total con IVA:</Text>
                <Text style={[styles.ivaTotalAmount, { color: theme.colors.text }]}>
                  {formatCurrency(totalPrice + ivaAmount)}
                </Text>
              </View>
            </View>
          )}

          {/* Duration Card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => setActiveSheet('duration')}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Duración</Text>
              <ChevronRightIcon size={20} color={theme.colors.textMuted} />
            </View>
            <View>
              <Text style={[styles.cardValue, { color: theme.colors.textSecondary }]}>
                {totalHours === 1 ? '1 hora' : `${totalHours} horas`}
                {sessionStructure && ' total'}
              </Text>
              {sessionStructure && (
                <Text style={[styles.cardSubtext, { color: theme.colors.textMuted }]}>
                  {sessionStructure.sessions.length} sesiones: {sessionStructure.sessions.map(s => `${s.hours}h`).join(', ')}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Materials Card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => setActiveSheet('materials')}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Materiales
              </Text>
              <ChevronRightIcon size={20} color={theme.colors.textMuted} />
            </View>
            {materials.length > 0 ? (
              <View style={{ gap: 6 }}>
                {materials.slice(0, 3).map((material) => (
                  <Text
                    key={material.id}
                    style={[styles.cardValue, { color: theme.colors.textSecondary }]}
                  >
                    {material.name} (x{material.quantity})
                  </Text>
                ))}
                {materials.length > 3 && (
                  <Text style={[styles.cardValue, { color: theme.colors.textMuted }]}>
                    +{materials.length - 3} más
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[styles.cardValue, { color: theme.colors.textSecondary }]}>
                Sin materiales agregados
              </Text>
            )}
          </TouchableOpacity>

          {/* Notes Card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => setActiveSheet('notes')}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Notas Adicionales
              </Text>
              <ChevronRightIcon size={20} color={theme.colors.textMuted} />
            </View>
            <Text
              style={[styles.cardValue, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {notes || 'Agrega detalles sobre el trabajo, garantías, etc.'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Send Quote CTA */}
        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
              isSubmitting && styles.sendButtonDisabled,
            ]}
            onPress={handleSendQuote}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>
                Enviar Cotización
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Sheets */}
        {activeSheet && (
          <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setActiveSheet(null)}
          >
            <SafeAreaView style={[styles.sheetContainer, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>
                  {activeSheet === 'price' && 'Desglose del Precio'}
                  {activeSheet === 'duration' && 'Duración'}
                  {activeSheet === 'materials' && 'Materiales'}
                  {activeSheet === 'notes' && 'Notas Adicionales'}
                </Text>
                <TouchableOpacity onPress={() => setActiveSheet(null)}>
                  <XIcon size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Price Breakdown Editor */}
              {activeSheet === 'price' && (
                <PriceBreakdownEditor
                  initialBreakdown={{
                    labor: priceBreakdown.labor,
                    customItems: customCharges
                  }}
                  suggestedLaborItems={suggestedLaborItems}
                  onSave={(breakdown, modifiedLaborItems) => {
                    // Update suggested labor items with modifications
                    setSuggestedLaborItems(modifiedLaborItems);

                    // Recalculate labor total from modified items (with NaN safety)
                    const laborTotal = modifiedLaborItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

                    setPriceBreakdown({
                      labor: laborTotal,
                      materials: priceBreakdown.materials, // Keep materials from MaterialsEditor
                      travel: priceBreakdown.travel, // Keep existing travel value (managed separately)
                    });
                    setCustomCharges(breakdown.customItems);
                    setActiveSheet(null);
                  }}
                  onCancel={() => setActiveSheet(null)}
                />
              )}

              {/* Duration Editor */}
              {activeSheet === 'duration' && (
                <DurationEditor
                  initialDuration={totalHours}
                  initialSessionStructure={sessionStructure}
                  onSave={(durationData) => {
                    setTotalHours(durationData.hoursPerSession);
                    setSessionStructure(durationData.sessionStructure);
                    setActiveSheet(null);
                  }}
                  onCancel={() => setActiveSheet(null)}
                />
              )}

              {/* Materials Editor */}
              {activeSheet === 'materials' && (
                <MaterialsEditor
                  initialMaterials={materials}
                  onSave={(updatedMaterials, notesValue) => {
                    setMaterials(updatedMaterials);
                    setMaterialsNotes(notesValue || '');
                    // Update materials cost in price breakdown (with NaN safety)
                    const materialsTotal = updatedMaterials.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
                    setPriceBreakdown({
                      ...priceBreakdown,
                      materials: materialsTotal,
                    });
                    setActiveSheet(null);
                  }}
                  onCancel={() => setActiveSheet(null)}
                />
              )}

              {/* Notes Editor */}
              {activeSheet === 'notes' && (
                <TextEditor
                  title="Notas Adicionales"
                  initialValue={notes}
                  placeholder="Ejemplo: Incluye materiales de primera calidad. Garantía de 6 meses en mano de obra. Acepto transferencia o efectivo..."
                  helperText={
                    <HelperText color={brandColors.textMuted}>
                      Incluye garantías, métodos de pago, o detalles que generen confianza
                    </HelperText>
                  }
                  maxLength={500}
                  onSave={(value) => {
                    setNotes(value);
                    setActiveSheet(null);
                  }}
                  onCancel={() => setActiveSheet(null)}
                />
              )}
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </ProviderThemeWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
    paddingHorizontal: spacing[2],
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  card: {
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  cardValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardSubtext: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  priceBreakdown: {
    gap: spacing[2],
  },
  categoryHeader: {
    fontSize: 12,
    fontFamily: 'Rubik-Bold',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
  },
  priceValue: {
    fontSize: 15,
    fontFamily: 'Rubik-Medium',
  },
  divider: {
    height: 1,
    marginVertical: spacing[1],
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Rubik-Bold',
  },
  totalValue: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
  },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  sendButton: {
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  // Bottom Sheet Styles
  sheetContainer: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
  },
  sheetContent: {
    flex: 1,
    padding: spacing[4],
  },
  sheetFooter: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  confirmButton: {
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  // Distance Banner Styles
  distanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    borderRadius: 8,
    gap: spacing[2],
  },
  distanceBannerText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  errorBanner: {
    flexDirection: 'column',
    gap: spacing[2],
  },
  retryButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  // Quote Info Banner
  quoteInfoBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  quoteInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteInfoLabel: {
    fontSize: 13,
    fontFamily: 'Rubik-Regular',
  },
  quoteInfoValue: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  // IVA Breakdown
  ivaBreakdown: {
    marginTop: -8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  ivaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ivaLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  ivaAmount: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  ivaTotalRow: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  ivaTotalLabel: {
    fontSize: 16,
    fontFamily: 'Rubik-Bold',
  },
  ivaTotalAmount: {
    fontSize: 16,
    fontFamily: 'Rubik-Bold',
  },
  // No Pricing Configured
  noPricingContainer: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  noPricingText: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  noPricingHint: {
    fontSize: 13,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
  },
  // Visit Requirement Toggle
  helperText: {
    fontSize: 13,
    fontFamily: 'Rubik-Regular',
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  toggleLeft: {
    flex: 1,
  },
  // Radio buttons (used in visit cost options)
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Visit Details
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: spacing[2],
  },
  visitCostContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  visitCostOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  visitCostOptionText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    minHeight: 100,
  },
  // Warning Banner (for visit-required quotes)
  warningBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 12,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontFamily: 'Rubik-Regular',
  },
});
