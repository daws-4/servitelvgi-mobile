import { useQuery } from '@tanstack/react-query';
import orderConfigService from '@/services/api/orderConfig';
import type { ServerStatusConfig, ServerTypeConfig } from '@/services/api/orderConfig';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
} from '@/constants/orderStates';
import type { OrderStatus } from '@/types/Order';

/**
 * Configuración de status adaptada para la app móvil
 */
export interface MobileStatusConfig {
  label: string;
  color: string;
  icon: string;
  isTerminal: boolean;
  countsAsCompleted: boolean;
}

/**
 * Retorno del hook useOrderConfig
 */
interface UseOrderConfigReturn {
  /** Mapa completo de statuses con su configuración */
  statuses: Record<string, MobileStatusConfig>;
  /** Mapa de tipos de orden */
  types: Record<string, { label: string; icon: string; color: string }>;
  /** Lista de statuses válidos */
  validStatuses: string[];
  /** Statuses que cuentan como "completada" */
  completedStatuses: string[];
  /** Statuses terminales */
  terminalStatuses: string[];
  /** Si está cargando la config */
  isLoading: boolean;
  /** Error (si existe) */
  error: string | null;
  /** Obtener configuración de un status con fallback */
  getStatusConfig: (status: string) => MobileStatusConfig;
}

/**
 * Fallback: convierte el mapa estático hardcodeado a MobileStatusConfig
 */
function buildFallbackStatuses(): Record<string, MobileStatusConfig> {
  const statuses: Record<string, MobileStatusConfig> = {};
  const keys = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

  for (const key of keys) {
    statuses[key] = {
      label: ORDER_STATUS_LABELS[key],
      color: ORDER_STATUS_COLORS[key],
      icon: ORDER_STATUS_ICONS[key],
      isTerminal: ['completed', 'completed_special', 'cancelled', 'visita'].includes(key),
      countsAsCompleted: ['completed', 'completed_special'].includes(key),
    };
  }

  return statuses;
}

/** Fallback para status desconocido */
const UNKNOWN_STATUS: MobileStatusConfig = {
  label: 'Desconocido',
  color: '#9e9e9e',
  icon: 'help-circle',
  isTerminal: false,
  countsAsCompleted: false,
};

/**
 * Transforma la config del servidor a formato móvil
 */
function transformServerConfig(
  serverStatuses: Record<string, ServerStatusConfig>
): Record<string, MobileStatusConfig> {
  const result: Record<string, MobileStatusConfig> = {};

  for (const [key, config] of Object.entries(serverStatuses)) {
    result[key] = {
      label: config.label,
      // Mapear colores de HeroUI a hex para React Native
      color: mapColorToHex(config.color, key),
      icon: config.icon,
      isTerminal: config.isTerminal,
      countsAsCompleted: config.countsAsCompleted,
    };
  }

  return result;
}

/**
 * Mapea color de HeroUI (e.g. "success", "warning") a hex
 * Usa los colores del fallback si los tiene, si no, un mapa genérico
 */
function mapColorToHex(heroColor: string, statusKey: string): string {
  // Si tenemos un color en el mapa estático, preferirlo
  if (statusKey in ORDER_STATUS_COLORS) {
    return ORDER_STATUS_COLORS[statusKey as OrderStatus];
  }

  // Mapeo genérico de colores de HeroUI
  const colorMap: Record<string, string> = {
    primary: '#2196f3',
    secondary: '#9c27b0',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    default: '#757575',
  };

  return colorMap[heroColor] || '#757575';
}

/**
 * Hook para obtener la configuración dinámica de statuses y tipos de orden.
 * Carga desde el endpoint /api/web/order-config y cachea con React Query.
 * Usa fallback a las constantes estáticas si el fetch falla.
 */
export function useOrderConfig(): UseOrderConfigReturn {
  const fallbackStatuses = buildFallbackStatuses();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order-config'],
    queryFn: () => orderConfigService.getOrderConfig(),
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60,    // 1 hora
    retry: 2,
  });

  // Determinar statuses activos (server o fallback)
  const statuses = data
    ? transformServerConfig(data.statuses)
    : fallbackStatuses;

  const types = data?.types || {
    instalacion: { label: 'Instalación', icon: 'wrench', color: 'purple' },
    averia: { label: 'Avería', icon: 'triangle-exclamation', color: 'red' },
    recuperacion: { label: 'Recuperación', icon: 'box-archive', color: 'blue' },
    otro: { label: 'Otro', icon: 'question', color: 'gray' },
  };

  const validStatuses = data?.validStatuses || Object.keys(statuses);
  const completedStatuses = data?.completedStatuses || Object.entries(statuses).filter(([_, v]) => v.countsAsCompleted).map(([k]) => k);
  const terminalStatuses = data?.terminalStatuses || Object.entries(statuses).filter(([_, v]) => v.isTerminal).map(([k]) => k);

  const getStatusConfig = (status: string): MobileStatusConfig => {
    return statuses[status] || UNKNOWN_STATUS;
  };

  return {
    statuses,
    types,
    validStatuses,
    completedStatuses,
    terminalStatuses,
    isLoading,
    error: error ? (error as Error).message : null,
    getStatusConfig,
  };
}
