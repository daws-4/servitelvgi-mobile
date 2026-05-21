import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

export interface BiometricStatus {
  available: boolean;
  biometryType?: LocalAuthentication.AuthenticationType[];
  error?: string;
}

export const biometricService = {
  /**
   * Check if hardware supports biometrics and if user has enrolled
   */
  checkAvailability: async (): Promise<BiometricStatus> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { available: false, error: 'hardware_unavailable' };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { available: false, error: 'not_enrolled' };
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        available: true,
        biometryType: supportedTypes,
      };
    } catch (error) {
      console.error('Biometric check failed:', error);
      return { available: false, error: 'unknown_error' };
    }
  },

  /**
   * Prompt user for biometric authentication
   */
  authenticate: async (
    promptMessage = 'Inicia sesión con tu huella o rostro'
  ): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false, // Allow PIN/Pattern if biometrics fail (optional)
      });

      return result.success;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  },

  /**
   * Get readable name for the biometry type
   */
  getBiometryLabel: (types?: LocalAuthentication.AuthenticationType[]): string => {
    if (!types || types.length === 0) return 'Biometría';

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Desbloqueo Facial';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Huella Dactilar';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }

    return 'Biometría';
  },
};
