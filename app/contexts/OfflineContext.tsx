import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
    OfflineAction,
    addToQueue as addToQueueUtil,
    getQueue,
    processQueue,
    getQueueCount,
} from '@/utils/offlineQueue';
import { showInfoToast, showSuccessToast, showErrorToast } from '@/components/ui/Toast';

interface OfflineContextValue {
    /**
     * Estado de conexión
     */
    isConnected: boolean | null;

    /**
     * Si internet es alcanzable
     */
    isInternetReachable: boolean | null;

    /**
     * Si está sincronizando acciones pendientes
     */
    isSyncing: boolean;

    /**
     * Acciones pendientes en la cola
     */
    pendingActions: OfflineAction[];

    /**
     * Número de acciones pendientes
     */
    pendingCount: number;

    /**
     * Agrega una acción a la cola offline
     */
    addOfflineAction: (action: OfflineAction) => Promise<void>;

    /**
     * Sincroniza las acciones pendientes
     */
    syncPendingActions: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

interface OfflineProviderProps {
    children: ReactNode;
    /**
     * Función personalizada para procesar cada acción
     * Debe retornar true si la acción se procesó exitosamente
     */
    processAction?: (action: OfflineAction) => Promise<boolean>;
}

/**
 * Provider para gestionar el estado offline de la aplicación
 */
export function OfflineProvider({ children, processAction }: OfflineProviderProps) {
    const { isConnected, isInternetReachable } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [wasOffline, setWasOffline] = useState(false);

    // Cargar acciones pendientes al iniciar
    useEffect(() => {
        loadPendingActions();
    }, []);

    // Sincronizar automáticamente cuando se recupere la conexión
    useEffect(() => {
        if (isConnected && wasOffline && pendingCount > 0) {
            showInfoToast('Conexión restablecida', 'Sincronizando acciones pendientes...');
            syncPendingActions();
        }

        if (isConnected === false) {
            setWasOffline(true);
        } else if (isConnected === true) {
            setWasOffline(false);
        }
    }, [isConnected]);

    const loadPendingActions = async () => {
        const queue = await getQueue();
        const count = await getQueueCount();
        setPendingActions(queue);
        setPendingCount(count);
    };

    const addOfflineAction = async (action: OfflineAction) => {
        try {
            await addToQueueUtil(action);
            await loadPendingActions();
            showInfoToast('Acción guardada', 'Se sincronizará cuando haya conexión');
        } catch (error) {
            showErrorToast('Error al guardar la acción offline');
            throw error;
        }
    };

    const syncPendingActions = async () => {
        if (!isConnected || isSyncing) {
            return;
        }

        setIsSyncing(true);

        try {
            // Función por defecto si no se proporciona una personalizada
            const defaultProcessAction = async (action: OfflineAction): Promise<boolean> => {
                console.log('Processing offline action:', action);
                // Aquí deberías implementar la lógica específica de tu app
                // Por ejemplo, hacer llamadas a la API según el tipo de acción
                return true;
            };

            const processor = processAction || defaultProcessAction;
            const processedCount = await processQueue(processor);

            if (processedCount > 0) {
                showSuccessToast(`${processedCount} acciones sincronizadas exitosamente`);
            }

            await loadPendingActions();
        } catch (error) {
            console.error('Error syncing pending actions:', error);
            showErrorToast('Error al sincronizar acciones pendientes');
        } finally {
            setIsSyncing(false);
        }
    };

    const value: OfflineContextValue = {
        isConnected,
        isInternetReachable,
        isSyncing,
        pendingActions,
        pendingCount,
        addOfflineAction,
        syncPendingActions,
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
}

/**
 * Hook para acceder al contexto offline
 * 
 * @example
 * ```tsx
 * const { isConnected, pendingCount, addOfflineAction } = useOffline();
 * 
 * if (!isConnected) {
 *   await addOfflineAction({
 *     id: uuid(),
 *     type: 'CREATE_ORDER',
 *     payload: orderData,
 *     timestamp: Date.now(),
 *   });
 * }
 * ```
 */
export function useOffline(): OfflineContextValue {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
}

// Default export for Expo router compatibility
export default OfflineProvider;
