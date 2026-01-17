import Toast from 'react-native-toast-message';
import { StatusColors, BrandColors } from '@/constants/colors';

/**
 * Configuración personalizada para Toast con colores corporativos de ENLARED
 */
export const toastConfig = {
    success: {
        style: {
            borderLeftColor: StatusColors.success,
            borderLeftWidth: 6,
        },
    },
    error: {
        style: {
            borderLeftColor: StatusColors.error,
            borderLeftWidth: 6,
        },
    },
    info: {
        style: {
            borderLeftColor: BrandColors.primary,
            borderLeftWidth: 6,
        },
    },
};

/**
 * Muestra un toast de éxito
 * 
 * @example
 * ```tsx
 * showSuccessToast('Orden creada exitosamente');
 * ```
 */
export const showSuccessToast = (message: string, title?: string) => {
    Toast.show({
        type: 'success',
        text1: title || '✓ Éxito',
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
    });
};

/**
 * Muestra un toast de error
 * 
 * @example
 * ```tsx
 * showErrorToast('No se pudo guardar la orden');
 * ```
 */
export const showErrorToast = (message: string, title?: string) => {
    Toast.show({
        type: 'error',
        text1: title || '✕ Error',
        text2: message,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
    });
};

/**
 * Muestra un toast informativo
 * 
 * @example
 * ```tsx
 * showInfoToast('Se han guardado los cambios localmente');
 * ```
 */
export const showInfoToast = (message: string, title?: string) => {
    Toast.show({
        type: 'info',
        text1: title || 'ⓘ Información',
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
    });
};

/**
 * Muestra un toast de advertencia
 * 
 * @example
 * ```tsx
 * showWarningToast('La conexión es inestable');
 * ```
 */
export const showWarningToast = (message: string, title?: string) => {
    Toast.show({
        type: 'info', // react-native-toast-message no tiene tipo 'warning', usamos 'info'
        text1: title || '⚠ Advertencia',
        text2: message,
        position: 'top',
        visibilityTime: 3500,
        topOffset: 60,
    });
};
