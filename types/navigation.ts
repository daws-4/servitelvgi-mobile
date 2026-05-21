/**
 * Tipos de navegación para React Navigation y Expo Router
 */

import type { InventoryItem, InventoryBatch } from './Inventory';
import type { Order } from './Order';

// ============================================================================
// ROOT STACK (Navegación principal)
// ============================================================================

/**
 * Parámetros de navegación para el stack principal
 */
export type RootStackParamList = {
  // Autenticación
  Login: undefined;

  // Tabs principales (después de login)
  MainTabs: undefined;

  // Pantallas de órdenes
  OrderList: undefined;
  OrderDetail: { orderId: string };
  OrderCompletion: { orderId: string };
  OrderMap: { orderId: string };

  // Pantallas de inventario
  InventoryList: undefined;
  InventoryDetail: { itemId: string };
  BatchDetail: { batchCode: string };
  EquipmentInstanceDetail: { itemId: string; uniqueId: string };

  // Mapa
  Map: { orderId?: string; crewId?: string };

  // Perfil y configuración
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;

  // Utilidades
  SpeedTest: { orderId?: string };
  Camera: { orderId: string; photoIndex: number };
  Signature: { orderId: string };
};

// ============================================================================
// TAB NAVIGATION
// ============================================================================

/**
 * Parámetros para las pestañas principales
 */
export type TabParamList = {
  Orders: undefined; // Pestaña de órdenes
  Inventory: undefined; // Pestaña de inventario
  Map: undefined; // Pestaña de mapa
  Profile: undefined; // Pestaña de perfil
};

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Estado de navegación genérico
 */
export interface NavigationState {
  index: number;
  routes: {
    key: string;
    name: string;
    params?: any;
  }[];
}

/**
 * Props de navegación comunes
 */
export interface NavigationProps {
  navigation?: any;
  route?: any;
}
