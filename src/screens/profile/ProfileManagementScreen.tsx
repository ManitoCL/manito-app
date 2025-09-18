// Enterprise Profile Management Screen
// Demonstrates the new enterprise auth workflow with explicit profile management
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { useAppSelector } from '../../store';

export const ProfileManagementScreen: React.FC = () => {
  const { user, session, isEmailVerified } = useAppSelector(state => state.auth);
  const profile = useProfile();

  // Auto-ensure profile exists when screen loads
  useEffect(() => {
    if (user && session && isEmailVerified && profile.needsProfileCreation && profile.canCreateProfile) {
      console.log('Auto-ensuring profile exists...');
      profile.ensureProfile(user);
    }
  }, [user, session, isEmailVerified, profile.needsProfileCreation, profile.canCreateProfile]);

  const handleCreateProfile = async () => {
    try {
      const result = await profile.createUserProfile(user);
      if (result.success) {
        Alert.alert('Success', 'Profile created successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to create profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleRetryCreation = async () => {
    try {
      const result = await profile.retryProfileCreation(user);
      if (result.success) {
        Alert.alert('Success', 'Profile created successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to create profile after retries');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleEnsureProfile = async () => {
    const success = await profile.ensureProfile(user);
    if (success) {
      Alert.alert('Success', 'Profile is ready!');
    } else {
      Alert.alert('Error', profile.error || 'Failed to ensure profile exists');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const result = await profile.updateUserProfile({
        full_name: user?.fullName || 'Updated Name',
        phone_number: user?.phoneNumber || '+56912345678',
      });
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  if (!user || !session) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please sign in to manage your profile</Text>
      </View>
    );
  }

  if (!isEmailVerified) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please verify your email to manage your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enterprise Profile Management</Text>

      {/* Auth Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auth Status</Text>
        <Text style={styles.info}>User ID: {user.id}</Text>
        <Text style={styles.info}>Email: {user.email}</Text>
        <Text style={styles.info}>Email Verified: {isEmailVerified ? '✅' : '❌'}</Text>
        <Text style={styles.info}>User Type: {user.userType}</Text>
      </View>

      {/* Profile Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Status</Text>
        {profile.isCheckingStatus ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <>
            <Text style={styles.info}>Profile Exists: {profile.profileExists ? '✅' : '❌'}</Text>
            <Text style={styles.info}>Needs Creation: {profile.needsProfileCreation ? '⚠️' : '✅'}</Text>
            <Text style={styles.info}>Can Create: {profile.canCreateProfile ? '✅' : '❌'}</Text>
            <Text style={styles.info}>Is Provider: {profile.isProvider ? '✅' : '❌'}</Text>
            <Text style={styles.info}>Needs Provider Setup: {profile.needsProviderSetup ? '⚠️' : '✅'}</Text>
            {profile.fullName && <Text style={styles.info}>Full Name: {profile.fullName}</Text>}
            {profile.phoneNumber && <Text style={styles.info}>Phone: {profile.phoneNumber}</Text>}
            <Text style={styles.info}>Phone Verified: {profile.phoneVerified ? '✅' : '❌'}</Text>
            <Text style={styles.info}>Retry Count: {profile.retryCount}</Text>
          </>
        )}
      </View>

      {/* Provider Profile Status */}
      {profile.isProvider && profile.providerProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider Profile</Text>
          <Text style={styles.info}>Business: {profile.providerProfile.business_name || 'Not set'}</Text>
          <Text style={styles.info}>Verification: {profile.providerProfile.verification_status}</Text>
          <Text style={styles.info}>Available: {profile.providerProfile.is_available ? '✅' : '❌'}</Text>
          <Text style={styles.info}>Rating: {profile.providerProfile.rating_average || 0}/5</Text>
          <Text style={styles.info}>Jobs Completed: {profile.providerProfile.total_jobs_completed || 0}</Text>
        </View>
      )}

      {/* Error Display */}
      {profile.error && (
        <View style={styles.errorSection}>
          <Text style={styles.sectionTitle}>Error</Text>
          <Text style={styles.errorText}>{profile.error}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={profile.clearError}>
            <Text style={styles.clearButtonText}>Clear Error</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={profile.refreshProfileStatus}
          disabled={profile.isCheckingStatus}
        >
          <Text style={styles.buttonText}>
            {profile.isCheckingStatus ? 'Checking...' : 'Refresh Status'}
          </Text>
        </TouchableOpacity>

        {profile.needsProfileCreation && profile.canCreateProfile && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateProfile}
            disabled={profile.isCreatingProfile}
          >
            <Text style={styles.buttonText}>
              {profile.isCreatingProfile ? 'Creating...' : 'Create Profile'}
            </Text>
          </TouchableOpacity>
        )}

        {profile.error && profile.retryCount < 3 && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetryCreation}
            disabled={profile.isCreatingProfile}
          >
            <Text style={styles.buttonText}>
              {profile.isCreatingProfile ? 'Retrying...' : 'Retry Profile Creation'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleEnsureProfile}
          disabled={profile.isLoading}
        >
          <Text style={styles.buttonText}>
            {profile.isLoading ? 'Ensuring...' : 'Ensure Profile Exists'}
          </Text>
        </TouchableOpacity>

        {profile.profileExists && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdateProfile}
            disabled={profile.isUpdatingProfile}
          >
            <Text style={styles.buttonText}>
              {profile.isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        )}

        {profile.retryCount > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={profile.resetRetryCount}
          >
            <Text style={styles.clearButtonText}>Reset Retry Count</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <Text style={styles.debugText}>
          {JSON.stringify(profile.profileStatus, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorSection: {
    backgroundColor: '#fff2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#8E8E93',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#444',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
});