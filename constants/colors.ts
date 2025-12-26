/**
 * Paleta de colores corporativos de Servitel
 * y colores de la aplicación
 */

// ============================================================================
// COLORES CORPORATIVOS DE SERVITEL
// ============================================================================

export const BrandColors = {
  /**
   * Rich Cerulean - Azul corporativo principal
   */
  primary: '#3e78b2',
  
  /**
   * Cobalt Blue - Azul secundario
   */
  secondary: '#004ba8',
  
  /**
   * Tea Green - Color de fondo/acento
   */
  background: '#deefb7',
  accent: '#deefb7',
  
  /**
   * Lilac Ash - Color neutral
   */
  neutral: '#bcabae',
  
  /**
   * Onyx - Color oscuro
   */
  dark: '#0f0f0f',
} as const;

// ============================================================================
// COLORES DE ESTADO
// ============================================================================

export const StatusColors = {
  success: '#17c964',    // Verde - éxito (del proyecto web)
  warning: '#f5a524',    // Naranja - advertencia (del proyecto web)
  error: '#f44336',      // Rojo - error
  info: '#2196f3',       // Azul - información
  pending: '#f5a524',    // Naranja - pendiente
  active: '#17c964',     // Verde - activo
  inactive: '#9e9e9e',   // Gris - inactivo
} as const;

// ============================================================================
// COLORES NEUTRALES (LIGHT MODE)
// ============================================================================

export const LightColors = {
  background: '#f5f5f5',      // Fondo principal
  surface: '#ffffff',         // Superficie de cards/modales
  surfaceVariant: '#f9f9f9',  // Variante de superficie
  text: '#212121',            // Texto principal
  textSecondary: '#757575',   // Texto secundario
  disabled: '#bdbdbd',        // Elementos deshabilitados
  border: '#e0e0e0',          // Bordes
  divider: '#eeeeee',         // Divisores
  overlay: 'rgba(0,0,0,0.5)', // Overlay de modales
} as const;

// ============================================================================
// COLORES OSCUROS (DARK MODE)
// ============================================================================

export const DarkColors = {
  background: '#121212',      // Fondo principal
  surface: '#1e1e1e',         // Superficie de cards/modales
  surfaceVariant: '#2c2c2c',  // Variante de superficie
  text: '#ffffff',            // Texto principal
  textSecondary: '#b0b0b0',   // Texto secundario
  disabled: '#666666',        // Elementos deshabilitados
  border: '#2c2c2c',          // Bordes
  divider: '#333333',         // Divisores
  overlay: 'rgba(0,0,0,0.7)', // Overlay de modales
} as const;

// ============================================================================
// SET COMPLETO DE COLORES (EXPORTACIÓN PRINCIPAL)
// ============================================================================

export const Colors = {
  // Marca
  ...BrandColors,
  
  // Estados
  ...StatusColors,
  
  // Modo claro (por defecto)
  ...LightColors,
  
  // Modo oscuro
  dark: DarkColors,
} as const;

// ============================================================================
// HELPER PARA OBTENER COLORES SEGÚN EL TEMA
// ============================================================================

/**
 * Obtener colores según el tema activo
 * @param isDark - Si el modo oscuro está activo
 */
export const getThemeColors = (isDark: boolean) => {
  if (isDark) {
    return {
      ...BrandColors,
      ...StatusColors,
      ...DarkColors,
    };
  }
  
  return Colors;
};

// Tipo para autocompletado
export type ColorScheme = typeof Colors;
