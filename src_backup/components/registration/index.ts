// Registration Components Export
export { default as UserTypeSelection } from './UserTypeSelection';
export { default as ChileanPhoneInput } from './ChileanPhoneInput';
export { default as RUTInput } from './RUTInput';
export { default as EmailRegistrationForm } from './EmailRegistrationForm';
export { default as PhoneRegistrationForm } from './PhoneRegistrationForm';
export { default as ComprehensiveRegistrationScreen } from './ComprehensiveRegistrationScreen';

// Export types that might be needed
export interface UserTypeSelectionProps {
  selectedType: 'consumer' | 'provider' | null;
  onSelectType: (type: 'consumer' | 'provider') => void;
}

export interface ChileanPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  showValidation?: boolean;
}

export interface RUTInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}