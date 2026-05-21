import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@enlared/offline_queue';

/**
 * Acción offline que será procesada cuando se recupere la conexión
 */
export interface OfflineAction {
  /**
   * ID único de la acción
   */
  id: string;

  /**
   * Tipo de acción (ej: 'CREATE_ORDER', 'UPDATE_ORDER', etc.)
   */
  type: string;

  /**
   * Datos de la acción
   */
  payload: any;

  /**
   * Timestamp de cuando se creó la acción
   */
  timestamp: number;
}

/**
 * Agrega una acción a la cola offline
 *
 * @example
 * ```tsx
 * await addToQueue({
 *   id: uuid(),
 *   type: 'CREATE_ORDER',
 *   payload: orderData,
 *   timestamp: Date.now(),
 * });
 * ```
 */
export async function addToQueue(action: OfflineAction): Promise<void> {
  try {
    const queue = await getQueue();
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to offline queue:', error);
    throw error;
  }
}

/**
 * Obtiene todas las acciones pendientes en la cola
 *
 * @returns Array de acciones pendientes
 */
export async function getQueue(): Promise<OfflineAction[]> {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (!queueJson) {
      return [];
    }
    return JSON.parse(queueJson);
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
}

/**
 * Limpia la cola después de sincronización exitosa
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
    throw error;
  }
}

/**
 * Elimina una acción específica de la cola por su ID
 */
export async function removeFromQueue(actionId: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filteredQueue = queue.filter((action) => action.id !== actionId);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Error removing from offline queue:', error);
    throw error;
  }
}

/**
 * Obtiene el número de acciones pendientes
 */
export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Procesa la cola cuando se recupera la conexión
 * Esta es una función auxiliar, la lógica real de procesamiento
 * debe implementarse en el OfflineContext según las necesidades de la app
 *
 * @param processAction Función que procesa cada acción
 * @returns Número de acciones procesadas exitosamente
 */
export async function processQueue(
  processAction: (action: OfflineAction) => Promise<boolean>
): Promise<number> {
  const queue = await getQueue();
  let successCount = 0;

  for (const action of queue) {
    try {
      const success = await processAction(action);
      if (success) {
        await removeFromQueue(action.id);
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing action ${action.id}:`, error);
    }
  }

  return successCount;
}
