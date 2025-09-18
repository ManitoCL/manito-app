import React, { forwardRef, useCallback, useRef, useImperativeHandle } from 'react';
import {
  Platform,
  TextInput,
  TextInputProps,
} from 'react-native';
import { Input, InputProps } from './Input';

interface AutofillAwareInputProps extends Omit<InputProps, 'ref'> {
  // iOS-specific autofill handling
  isPasswordField?: boolean;
  isNewPassword?: boolean;
  isEmailField?: boolean;
  isNameField?: boolean;
  // Prevent iOS autofill conflicts
  preventAutofillConflicts?: boolean;
}

export interface AutofillAwareInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export const AutofillAwareInput = forwardRef<AutofillAwareInputRef, AutofillAwareInputProps>(
  (
    {
      isPasswordField = false,
      isNewPassword = false,
      isEmailField = false,
      isNameField = false,
      preventAutofillConflicts = false,
      secureTextEntry,
      autoComplete,
      textContentType,
      keyboardType,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
    }));

    // Get optimized props for iOS autofill
    const getIOSAutofillProps = useCallback((): Partial<TextInputProps> => {
      if (Platform.OS !== 'ios') {
        return {
          autoComplete,
          keyboardType,
          secureTextEntry: secureTextEntry || isPasswordField,
        };
      }

      // iOS-specific optimizations
      if (isPasswordField) {
        return {
          secureTextEntry: true,
          textContentType: isNewPassword ? 'newPassword' : 'password',
          autoComplete: isNewPassword ? 'new-password' : 'current-password',
          keyboardType: 'default',
          // Add password rules for new passwords to help iOS understand
          passwordRules: isNewPassword ? 'minlength: 6; required: lower; required: upper; required: digit;' : undefined,
          // Enable autofill but prevent conflicts
          importantForAutofill: 'yes',
        };
      }

      if (isEmailField) {
        return {
          textContentType: 'emailAddress',
          autoComplete: 'email',
          keyboardType: 'email-address',
          importantForAutofill: 'yes',
        };
      }

      if (isNameField) {
        return {
          textContentType: 'name',
          autoComplete: 'name',
          keyboardType: 'default',
          importantForAutofill: 'yes',
        };
      }

      // For other fields, prevent autofill conflicts
      if (preventAutofillConflicts) {
        return {
          textContentType: 'none',
          autoComplete: 'off',
          keyboardType: keyboardType || 'default',
          importantForAutofill: 'no',
        };
      }

      // Default case
      return {
        textContentType: textContentType || 'none',
        autoComplete: autoComplete || 'off',
        keyboardType: keyboardType || 'default',
        secureTextEntry: secureTextEntry || isPasswordField,
      };
    }, [
      isPasswordField,
      isNewPassword,
      isEmailField,
      isNameField,
      preventAutofillConflicts,
      autoComplete,
      textContentType,
      keyboardType,
      secureTextEntry,
    ]);

    const optimizedProps = getIOSAutofillProps();

    return (
      <Input
        ref={inputRef}
        {...props}
        {...optimizedProps}
      />
    );
  }
);

AutofillAwareInput.displayName = 'AutofillAwareInput';