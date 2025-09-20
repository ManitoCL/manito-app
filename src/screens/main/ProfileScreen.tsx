import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../types';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList>;
import { useAuth } from '../../hooks/useEnterpriseAuth';
import { EnterpriseCard, Button, Input } from '../../components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '../../design/tokens';

const { width } = Dimensions.get('window');

// Mock data for Chilean customer profile features
const MOCK_BOOKINGS = [
  { id: '1', service: 'Electricista', provider: 'Juan Pérez', date: '2024-01-15', status: 'completed', amount: 45000 },
  { id: '2', service: 'Plomero', provider: 'Carlos Mendoza', date: '2024-01-10', status: 'completed', amount: 35000 },
  { id: '3', service: 'Limpieza', provider: 'María González', date: '2024-01-20', status: 'scheduled', amount: 25000 },
];

const PAYMENT_METHODS = [
  { id: '1', type: 'card', last4: '4321', brand: 'Visa', isDefault: true },
  { id: '2', type: 'webpay', account: 'Transbank', isDefault: false },
];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut, refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: '',
    rut: '',
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Let the AppNavigator handle navigation via auth state
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Save changes logic would go here
      console.log('Saving profile changes:', editForm);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'profile-management':
        navigation.navigate('ProfileManagement');
        break;
      case 'detailed-profile':
        if (user?.userType === 'provider') {
          navigation.navigate('ProviderProfile');
        } else {
          navigation.navigate('CustomerProfile');
        }
        break;
      case 'verification':
        if (user?.userType === 'provider') {
          navigation.navigate('ProviderVerification');
        }
        break;
      case 'bookings':
        // TODO: Navigate to bookings screen
        console.log('Navigate to bookings');
        break;
      case 'payments':
        // TODO: Navigate to payments screen
        console.log('Navigate to payments');
        break;
      case 'favorites':
        // TODO: Navigate to favorites screen
        console.log('Navigate to favorites');
        break;
      case 'support':
        // TODO: Navigate to support screen
        console.log('Navigate to support');
        break;
      default:
        console.log('Unknown quick action:', action);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isProvider = user?.userType === 'provider';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Guardar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Summary Card */}
        <EnterpriseCard style={styles.profileCard} variant="feature">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.fullName.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.avatarEditButton}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <Text style={styles.userType}>Cliente Manito</Text>
              <Text style={styles.memberSince}>
                Miembro desde {formatDate(user?.createdAt || '')}
              </Text>
            </View>
          </View>
        </EnterpriseCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('bookings')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Mis Reservas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('payments')}
            >
              <Text style={styles.quickActionIcon}>💳</Text>
              <Text style={styles.quickActionText}>Pagos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('favorites')}
            >
              <Text style={styles.quickActionIcon}>⭐</Text>
              <Text style={styles.quickActionText}>Favoritos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('support')}
            >
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionText}>Soporte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('detailed-profile')}
            >
              <Text style={styles.quickActionIcon}>👤</Text>
              <Text style={styles.quickActionText}>Mi Perfil Completo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('profile-management')}
            >
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionText}>Gestión</Text>
            </TouchableOpacity>

            {user?.userType === 'provider' && (
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('verification')}
              >
                <Text style={styles.quickActionIcon}>✅</Text>
                <Text style={styles.quickActionText}>Verificación</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <EnterpriseCard style={styles.infoCard}>
            {isEditing ? (
              <View style={styles.editForm}>
                <Input
                  label="Nombre completo"
                  value={editForm.fullName}
                  onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
                  placeholder="Ingresa tu nombre completo"
                />
                <Input
                  label="Teléfono"
                  value={editForm.phoneNumber}
                  onChangeText={(text) => setEditForm({ ...editForm, phoneNumber: text })}
                  placeholder="+56 9 1234 5678"
                  keyboardType="phone-pad"
                />
                <Input
                  label="RUT"
                  value={editForm.rut}
                  onChangeText={(text) => setEditForm({ ...editForm, rut: text })}
                  placeholder="12.345.678-9"
                />
                <Input
                  label="Dirección"
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                  placeholder="Dirección completa"
                  multiline
                  numberOfLines={2}
                />
              </View>
            ) : (
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nombre completo</Text>
                  <Text style={styles.infoValue}>{user?.fullName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>
                    {user?.phoneNumber || 'No especificado'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>RUT</Text>
                  <Text style={styles.infoValue}>No especificado</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>No especificada</Text>
                </View>
              </View>
            )}
          </EnterpriseCard>
        </View>

        {/* Booking History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de Reservas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {MOCK_BOOKINGS.slice(0, 3).map((booking) => (
            <EnterpriseCard key={booking.id} style={styles.bookingCard} variant="interactive">
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingService}>{booking.service}</Text>
                  <Text style={styles.bookingProvider}>con {booking.provider}</Text>
                  <Text style={styles.bookingDate}>{formatDate(booking.date)}</Text>
                </View>

                <View style={styles.bookingMeta}>
                  <View style={[
                    styles.statusBadge,
                    booking.status === 'completed' ? styles.statusCompleted : styles.statusScheduled
                  ]}>
                    <Text style={[
                      styles.statusText,
                      booking.status === 'completed' ? styles.statusCompletedText : styles.statusScheduledText
                    ]}>
                      {booking.status === 'completed' ? 'Completado' : 'Programado'}
                    </Text>
                  </View>
                  <Text style={styles.bookingAmount}>{formatCurrency(booking.amount)}</Text>
                </View>
              </View>
            </EnterpriseCard>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Métodos de Pago</Text>
            <TouchableOpacity>
              <Text style={styles.addText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {PAYMENT_METHODS.map((method) => (
            <EnterpriseCard key={method.id} style={styles.paymentCard} variant="interactive">
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentIcon}>
                  {method.type === 'card' ? '💳' : '🏦'}
                </Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentBrand}>
                    {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : method.account}
                  </Text>
                  {method.isDefault && (
                    <Text style={styles.defaultBadge}>Por defecto</Text>
                  )}
                </View>
              </View>
            </EnterpriseCard>
          ))}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <EnterpriseCard style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔒</Text>
                <Text style={styles.settingText}>Seguridad y Privacidad</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔔</Text>
                <Text style={styles.settingText}>Notificaciones</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌐</Text>
                <Text style={styles.settingText}>Idioma y Región</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>❓</Text>
                <Text style={styles.settingText}>Ayuda y Soporte</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📄</Text>
                <Text style={styles.settingText}>Términos y Condiciones</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </EnterpriseCard>
        </View>

        {/* Trust & Safety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confianza y Seguridad</Text>
          <EnterpriseCard style={styles.trustCard} variant="feature">
            <View style={styles.trustHeader}>
              <Text style={styles.trustIcon}>🛡️</Text>
              <View style={styles.trustInfo}>
                <Text style={styles.trustTitle}>Perfil Verificado</Text>
                <Text style={styles.trustSubtitle}>
                  Tu cuenta cumple con los estándares de seguridad de Manito
                </Text>
              </View>
            </View>

            <View style={styles.trustFeatures}>
              <View style={styles.trustFeature}>
                <Text style={styles.trustFeatureIcon}>✅</Text>
                <Text style={styles.trustFeatureText}>Email verificado</Text>
              </View>
              <View style={styles.trustFeature}>
                <Text style={styles.trustFeatureIcon}>📱</Text>
                <Text style={styles.trustFeatureText}>Teléfono confirmado</Text>
              </View>
              <View style={styles.trustFeature}>
                <Text style={styles.trustFeatureIcon}>🏛️</Text>
                <Text style={styles.trustFeatureText}>Identidad validada</Text>
              </View>
            </View>
          </EnterpriseCard>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Button
            title="Cerrar Sesión"
            onPress={handleSignOut}
            variant="secondary"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  scrollContent: {
    paddingBottom: 84, // Extra padding for tab bar (64px tab bar + 20px spacing)
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral[900],
  },
  editButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.neutral[0],
    fontWeight: '600',
  },

  // Profile Card
  profileCard: {
    marginBottom: spacing[8],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.neutral[0],
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  userType: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  memberSince: {
    fontSize: 12,
    color: colors.neutral[600],
  },

  // Sections
  section: {
    marginBottom: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500',
  },
  addText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    width: (width - spacing[4] * 2 - spacing[3]) / 2,
    marginBottom: spacing[3],
    alignItems: 'center',
    ...shadows.base,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing[3],
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    padding: spacing[5],
  },
  editForm: {
    gap: spacing[4],
  },
  infoList: {
    gap: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral[600],
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: colors.neutral[900],
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  // Booking Cards
  bookingCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  bookingProvider: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: spacing[1],
  },
  bookingDate: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  bookingMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginBottom: spacing[2],
  },
  statusCompleted: {
    backgroundColor: colors.success[100],
  },
  statusScheduled: {
    backgroundColor: colors.warning[100],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusCompletedText: {
    color: colors.success[700],
  },
  statusScheduledText: {
    color: colors.warning[700],
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  // Payment Cards
  paymentCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: spacing[4],
  },
  paymentDetails: {
    flex: 1,
  },
  paymentBrand: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  defaultBadge: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: '500',
  },

  // Settings
  settingsCard: {
    padding: spacing[5],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing[4],
  },
  settingText: {
    fontSize: 16,
    color: colors.neutral[800],
  },
  settingArrow: {
    fontSize: 20,
    color: colors.neutral[400],
  },

  // Trust & Safety
  trustCard: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
    borderWidth: 1,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  trustIcon: {
    fontSize: 32,
    marginRight: spacing[4],
  },
  trustInfo: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success[800],
    marginBottom: spacing[1],
  },
  trustSubtitle: {
    fontSize: 14,
    color: colors.success[700],
    lineHeight: 20,
  },
  trustFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trustFeature: {
    alignItems: 'center',
    flex: 1,
  },
  trustFeatureIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
  },
  trustFeatureText: {
    fontSize: 12,
    color: colors.success[700],
    textAlign: 'center',
    fontWeight: '500',
  },

  // Sign Out
  signOutContainer: {
    marginBottom: spacing[8],
  },
  signOutButton: {
    marginTop: spacing[4],
  },
});
