// Core user types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userType: 'consumer' | 'provider';
  createdAt: string;
  updatedAt: string;
}

export interface Consumer extends User {
  userType: 'consumer';
  addresses?: Address[];
  preferences?: ConsumerPreferences;
}

export interface Provider extends User {
  userType: 'provider';
  businessName?: string;
  description?: string;
  services: string[];
  serviceAreas: string[];
  hourlyRate?: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating?: number;
  totalReviews: number;
  bankDetails?: BankDetails;
}

// Service and booking types
export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Booking {
  id: string;
  consumerId: string;
  providerId: string;
  serviceId: string;
  scheduledDate: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  description?: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

// Supporting types
export interface Address {
  id?: string;
  street: string;
  city: string;
  region: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ConsumerPreferences {
  preferredServiceTypes?: string[];
  notificationSettings?: NotificationSettings;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  rutNumber: string; // Chilean ID number
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  consumerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  BookingDetails: { bookingId: string };
  ProviderProfile: { providerId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailConfirmation: { email: string; userType: 'consumer' | 'provider' };
  EmailConfirmed: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};