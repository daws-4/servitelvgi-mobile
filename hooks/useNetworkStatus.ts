import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  /**
   * Estado de conexión (true si está conectado, false si no, null si es desconocido)
   */
  isConnected: boolean | null;
  
  /**
   * Si internet es alcanzable (puede estar conectado a WiFi pero sin internet)
   */
  isInternetReachable: boolean | null;
  
  /**
   * Tipo de conexión (wifi, cellular, etc.)
   */
  connectionType: string | null;
}

/**
 * Hook personalizado para detectar el estado de la conexión de red
 * 
 * @example
 * ```tsx
 * const { isConnected, isInternetReachable, connectionType } = useNetworkStatus();
 * 
 * if (!isConnected) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    connectionType: null,
  });

  useEffect(() => {
    // Obtener el estado inicial
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Suscribirse a cambios en el estado de red
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}
