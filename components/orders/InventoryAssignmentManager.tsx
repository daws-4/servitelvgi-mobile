import { FontAwesome } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import { BrandColors } from '@/constants/colors';
import { useEquipmentInstances } from '@/hooks/useEquipmentInstances';
import inventoryService from '@/services/api/inventory';
import type {
  AssignedInventoryItem,
  EquipmentInstance,
  InventoryItem,
  InventoryBatch,
} from '@/types/Inventory';
import type { MaterialUsed } from '@/types/Order';

interface InventoryAssignmentManagerProps {
  crewId: string;
  materialsUsed: MaterialUsed[];
  onMaterialsChange: (materials: MaterialUsed[]) => void;
  onImmediateSave?: (materials: MaterialUsed[]) => Promise<void>; // For immediate save (bobbin/equipment removal)
  readOnly?: boolean;
}

// Helper to get item details from either item or itemDetails (API returns item as populated object sometimes)
const getItemDetails = (assignedItem: AssignedInventoryItem): InventoryItem | null => {
  // El API puede devolver item como objeto populado o itemDetails
  if (assignedItem.itemDetails) return assignedItem.itemDetails;
  if (typeof assignedItem.item === 'object' && assignedItem.item !== null) {
    return assignedItem.item as unknown as InventoryItem;
  }
  return null;
};

// Helper to safely get item ID handling nulls/objects
const getSafeItemId = (
  item: string | InventoryItem | { _id: string } | null | undefined
): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return (item as any)._id || '';
};

// Helper to get material description - resolves from inventory if needed
const getMaterialDescription = (
  material: MaterialUsed,
  inventory: AssignedInventoryItem[],
  batches: InventoryBatch[]
): string => {
  // First check if description is already populated
  if (material.description) {
    return material.description;
  }

  // Check if material.item is a populated object (not just a string ID)
  // This happens when backend returns populated data
  if (material.item && typeof material.item === 'object') {
    const itemObj = material.item as any;
    if (itemObj.description) {
      return itemObj.description;
    }
  }

  // Try to get from inventory (if item is a string ID)
  const materialItemId =
    typeof material.item === 'string' ? material.item : (material.item as any)?._id;

  for (const inv of inventory) {
    // Get the item ID from the inv object
    let invItemId: string | undefined;

    // Case 1: item is a string ID
    if (typeof inv.item === 'string') {
      invItemId = inv.item;
    } else if (inv.item && typeof inv.item === 'object') {
      // Case 2: item is a populated object
      invItemId = (inv.item as any)._id;
    }

    if (invItemId === materialItemId) {
      // Found the inventory item, now get description
      // Case 1: itemDetails is populated
      if (inv.itemDetails?.description) {
        return inv.itemDetails.description;
      }
      // Case 2: item is a populated object with description
      if (inv.item && typeof inv.item === 'object' && (inv.item as any).description) {
        return (inv.item as any).description;
      }
    }
  }

  // Try to get from batches if it has a batchCode
  if (material.batchCode) {
    const batch = batches.find((b) => b.batchCode === material.batchCode);
    if (batch && batch.item && typeof batch.item === 'object') {
      return (batch.item as any).description || 'Material sin nombre';
    }
  }

  return 'Material sin nombre';
};

export default function InventoryAssignmentManager({
  crewId,
  materialsUsed,
  onMaterialsChange,
  onImmediateSave,
  readOnly = false,
}: InventoryAssignmentManagerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<AssignedInventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<AssignedInventoryItem[]>([]);
  const [viewState, setViewState] = useState<'inventory' | 'instances' | 'batches'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [instanceSearchQuery, setInstanceSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<AssignedInventoryItem | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<EquipmentInstance | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [showScanner, setShowScanner] = useState(false);

  // Camera permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Equipment instances hook
  const {
    instances: equipmentInstances,
    loading: loadingInstances,
    fetchInstances,
  } = useEquipmentInstances();

  // Animation values
  const translateY = React.useRef(new Animated.Value(0)).current;
  const keyboardHeight = React.useRef(new Animated.Value(0)).current;

  // Keyboard listeners for footer animation
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openModal = () => {
    setModalVisible(true);
    translateY.setValue(0);
  };

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedItem(null);
      setQuantity('1');
      setSearchQuery('');
      setInstanceSearchQuery('');
      setViewState('inventory');
    });
  };

  // Fetch crew inventory when modal opens
  useEffect(() => {
    if (modalVisible && crewId) {
      fetchInventory();
      fetchBatches();
      translateY.setValue(0);
    }
  }, [modalVisible, crewId]);

  // Also fetch inventory on mount if crewId exists (for displaying existing materials)
  useEffect(() => {
    if (crewId) {
      fetchInventory();
      fetchBatches();
    }
  }, [crewId]);

  // Filter inventory based on search query
  useEffect(() => {
    if (!inventory.length) return;

    if (!searchQuery.trim()) {
      setFilteredInventory(inventory);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = inventory.filter((item) => {
        const details = getItemDetails(item);
        return (
          details?.description.toLowerCase().includes(query) ||
          details?.code.toLowerCase().includes(query)
        );
      });
      setFilteredInventory(filtered);
    }
  }, [searchQuery, inventory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getCrewInventory(crewId);
      // Filter out items that are out of stock or already fully assigned
      // Note: For now we just filter 0 stock, duplicate validation happens on selection
      const availableItems = data.filter((item) => item.quantity > 0);
      setInventory(availableItems);
      setFilteredInventory(availableItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'No se pudo cargar el inventario de la cuadrilla');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await inventoryService.getCrewBatches(crewId);
      // Keep all active batches (including those with 0 quantity) for proper restoration
      // The UI will filter when displaying available batches for selection
      setBatches(data.filter((b) => b.status === 'active'));
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem) return;

    // If it's equipment, require an instance to be selected
    const itemDetails = getItemDetails(selectedItem);
    const isEquipment = itemDetails?.type === 'equipment';

    // Check if item needs batch selection (coils)
    // We identify if we are in batch mode if we have valid batches for this item
    // But simpler: check viewState or if selectedBatch is set/required
    const itemId = getSafeItemId(selectedItem.item);
    const itemBatches = batches.filter((b) => b && getSafeItemId(b.item) === itemId);
    const isBatchItem = itemBatches.length > 0;

    if (isEquipment) {
      if (!selectedInstance) {
        Alert.alert(
          'Error',
          'Debe seleccionar una instancia específica (Serial/MAC) para este equipo'
        );
        return;
      }
    }

    if (isBatchItem && !selectedBatch) {
      Alert.alert('Error', 'Debe seleccionar una bobina/lote para este material');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }

    // Validate stock
    if (isBatchItem && selectedBatch) {
      if (qty > selectedBatch.currentQuantity) {
        Alert.alert(
          'Error',
          `Solo hay ${selectedBatch.currentQuantity} ${selectedBatch.unit} disponibles en esta bobina`
        );
        return;
      }
    } else if (qty > selectedItem.quantity) {
      Alert.alert('Error', `Solo hay ${selectedItem.quantity} unidades disponibles`);
      return;
    }

    // Use a consistent ID string for the item
    // const itemId = typeof selectedItem.item === 'string' ? selectedItem.item : (selectedItem.item as any)._id; // Already defined above

    // For equipment, we enforce quantity 1 per line item per instance
    if (isEquipment) {
      if (!selectedInstance) {
        Alert.alert(
          'Error',
          'Debe seleccionar una instancia específica (Serial/MAC) para este equipo'
        );
        return;
      }

      // Check if this specific instance is already added
      const isInstanceAdded = materialsUsed.some((m) =>
        m.instanceIds?.includes(selectedInstance.uniqueId)
      );

      if (isInstanceAdded) {
        Alert.alert('Error', 'Esta instancia específica ya ha sido agregada a la orden');
        return;
      }

      // Add as new line item with instance details
      const newMaterials = [...materialsUsed];
      newMaterials.push({
        item: itemId,
        quantity: 1,
        description: itemDetails?.description,
        instanceIds: [selectedInstance.uniqueId],
        instanceDetails: [
          {
            uniqueId: selectedInstance.uniqueId,
            serialNumber: selectedInstance.serialNumber || 'N/A',
          },
        ],
      });
      onMaterialsChange(newMaterials);

      // Decrement local inventory
      setInventory((prev) =>
        prev.map((inv) => {
          const invItemId = typeof inv.item === 'string' ? inv.item : (inv.item as any)._id;
          if (invItemId === itemId) {
            return {
              ...inv,
              quantity: Math.max(0, inv.quantity - 1),
            };
          }
          return inv;
        })
      );

      closeModal();
      return;
    }

    // Handle Batch Item
    if (isBatchItem && selectedBatch) {
      // Check if same batch is already added
      const existingBatchIndex = materialsUsed.findIndex(
        (m) => m.batchCode === selectedBatch.batchCode
      );

      if (existingBatchIndex >= 0) {
        const currentQty = materialsUsed[existingBatchIndex].quantity;

        Alert.alert(
          'Material ya agregado',
          `Esta bobina ya tiene ${currentQty} agregados. ¿Deseas sumar los nuevos ${qty} o reemplazar la cantidad?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sumar',
              onPress: () => {
                if (qty > selectedBatch.currentQuantity) {
                  Alert.alert(
                    'Error',
                    `La cantidad a sumar (${qty}) excede el disponible (${selectedBatch.currentQuantity})`
                  );
                  return;
                }
                const newMaterials = [...materialsUsed];
                newMaterials[existingBatchIndex] = {
                  ...newMaterials[existingBatchIndex],
                  quantity: currentQty + qty,
                };
                onMaterialsChange(newMaterials);

                setBatches((prev) =>
                  prev.map((b) => {
                    if (b.batchCode === selectedBatch.batchCode) {
                      return { ...b, currentQuantity: b.currentQuantity - qty };
                    }
                    return b;
                  })
                );
                closeModal();
              },
            },
            {
              text: 'Reemplazar',
              onPress: () => {
                // If replacing, we calculate the difference
                const diff = qty - currentQty;
                if (diff > selectedBatch.currentQuantity) {
                  Alert.alert(
                    'Error',
                    `La cantidad a aumentar (${diff}) excede el disponible (${selectedBatch.currentQuantity})`
                  );
                  return;
                }
                const newMaterials = [...materialsUsed];
                newMaterials[existingBatchIndex] = {
                  ...newMaterials[existingBatchIndex],
                  quantity: qty,
                };
                onMaterialsChange(newMaterials);

                setBatches((prev) =>
                  prev.map((b) => {
                    if (b.batchCode === selectedBatch.batchCode) {
                      return { ...b, currentQuantity: b.currentQuantity - diff };
                    }
                    return b;
                  })
                );
                closeModal();
              },
            },
          ]
        );
        return;
      } else {
        const newMaterials = [...materialsUsed];
        newMaterials.push({
          item: itemId,
          quantity: qty,
          description: itemDetails?.description,
          batchCode: selectedBatch.batchCode,
        });
        onMaterialsChange(newMaterials);

        // Decrement local batch inventory
        setBatches((prev) =>
          prev.map((b) => {
            if (b.batchCode === selectedBatch.batchCode) {
              return {
                ...b,
                currentQuantity: b.currentQuantity - qty,
              };
            }
            return b;
          })
        );

        closeModal();
      }
      return;
    }

    // Standard material handling (existing logic)
    // Check if item already exists in materialsUsed
    const existingIndex = materialsUsed.findIndex(
      (m) => m.item === itemId && !m.instanceIds && !m.batchCode
    );

    if (existingIndex >= 0) {
      const currentQty = materialsUsed[existingIndex].quantity;

      Alert.alert(
        'Material ya agregado',
        `Este material ya tiene ${currentQty} agregados. ¿Deseas sumar los nuevos ${qty} o reemplazar la cantidad?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sumar',
            onPress: () => {
              if (qty > selectedItem.quantity) {
                Alert.alert(
                  'Error',
                  `La cantidad a sumar (${qty}) excede el disponible (${selectedItem.quantity})`
                );
                return;
              }
              const newMaterials = [...materialsUsed];
              newMaterials[existingIndex] = {
                ...newMaterials[existingIndex],
                quantity: currentQty + qty,
              };
              onMaterialsChange(newMaterials);

              setInventory((prev) =>
                prev.map((inv) => {
                  const invItemId = typeof inv.item === 'string' ? inv.item : (inv.item as any)._id;
                  if (invItemId === itemId) {
                    return { ...inv, quantity: Math.max(0, inv.quantity - qty) };
                  }
                  return inv;
                })
              );
              closeModal();
            },
          },
          {
            text: 'Reemplazar',
            onPress: () => {
              const diff = qty - currentQty;
              if (diff > selectedItem.quantity) {
                Alert.alert(
                  'Error',
                  `La cantidad a aumentar (${diff}) excede el disponible (${selectedItem.quantity})`
                );
                return;
              }
              const newMaterials = [...materialsUsed];
              newMaterials[existingIndex] = {
                ...newMaterials[existingIndex],
                quantity: qty,
              };
              onMaterialsChange(newMaterials);

              setInventory((prev) =>
                prev.map((inv) => {
                  const invItemId = typeof inv.item === 'string' ? inv.item : (inv.item as any)._id;
                  if (invItemId === itemId) {
                    return { ...inv, quantity: Math.max(0, inv.quantity - diff) };
                  }
                  return inv;
                })
              );
              closeModal();
            },
          },
        ]
      );
    } else {
      // Add new material
      const newMaterials = [...materialsUsed];
      newMaterials.push({
        item: itemId,
        quantity: qty,
        description: itemDetails?.description || 'Ítem sin descripción',
      });
      onMaterialsChange(newMaterials);

      // Decrement local inventory
      setInventory((prev) =>
        prev.map((inv) => {
          const invItemId = typeof inv.item === 'string' ? inv.item : (inv.item as any)._id;
          if (invItemId === itemId) {
            return {
              ...inv,
              quantity: Math.max(0, inv.quantity - qty),
            };
          }
          return inv;
        })
      );

      closeModal();
    }
  };

  // Handle item selection to check for equipment type
  // Handle item selection to check for equipment type
  const handleSelectItem = (item: AssignedInventoryItem) => {
    setSelectedItem(item);
    const details = getItemDetails(item);
    const itemId = getSafeItemId(item.item);

    // Reset selections
    setSelectedInstance(null);
    setSelectedBatch(null);
    setQuantity('1');
    setInstanceSearchQuery('');

    if (details?.type === 'equipment') {
      // Fetch instances
      // console.log('[InventoryAssignmentManager] Equipment selected, fetching instances:', {
      //     itemId,
      //     status: 'assigned',
      //     crewId,
      //     itemDescription: details?.description
      // });
      fetchInstances(itemId, 'assigned', crewId);
      // Switch view to instances
      setViewState('instances');
    } else {
      // Check for batches
      const itemBatches = batches.filter((b) => b && getSafeItemId(b.item) === itemId);
      if (itemBatches.length > 0) {
        setViewState('batches');
      } else {
        // Regular material
        setViewState('inventory');
      }
    }
  };

  const handleBackToInventory = () => {
    setViewState('inventory');
    setSelectedItem(null);
    setSelectedInstance(null);
    setSelectedBatch(null);
    setInstanceSearchQuery('');
  };

  const handleSelectInstance = (instance: EquipmentInstance) => {
    setSelectedInstance(instance);
    // Could auto-add here? Or use footer button.
    // Let's keep manual confirmation via footer for consistency/safety
  };

  // Handle barcode scan result
  const handleBarcodeScan = (scannedData: string) => {
    setShowScanner(false);

    // Try to find matching instance by uniqueId, serialNumber, or macAddress
    const normalizedData = scannedData.trim();
    const matchedInstance = equipmentInstances.find(
      (i) =>
        i.uniqueId === normalizedData ||
        i.serialNumber === normalizedData ||
        i.macAddress === normalizedData ||
        i.uniqueId?.toLowerCase() === normalizedData.toLowerCase() ||
        i.serialNumber?.toLowerCase() === normalizedData.toLowerCase()
    );

    if (matchedInstance) {
      setSelectedInstance(matchedInstance);
      // Set the search query to show what was found
      setInstanceSearchQuery(normalizedData);
    } else {
      Alert.alert('Equipo no encontrado', `No se encontró equipo con ID: ${normalizedData}`, [
        { text: 'OK' },
      ]);
    }
  };

  // Open barcode scanner
  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para escanear códigos', [
          { text: 'OK' },
        ]);
        return;
      }
    }
    setShowScanner(true);
  };

  // Filter instances based on search query
  const filteredInstances = equipmentInstances.filter((i) => {
    if (!instanceSearchQuery.trim()) return true;
    const query = instanceSearchQuery.toLowerCase();
    return (
      i.serialNumber?.toLowerCase().includes(query) ||
      i.macAddress?.toLowerCase().includes(query) ||
      i.uniqueId.toLowerCase().includes(query)
    );
  });

  const handleRemoveItem = (index: number) => {
    const materialToRemove = materialsUsed[index];
    const newMaterials = [...materialsUsed];
    newMaterials.splice(index, 1);
    onMaterialsChange(newMaterials);

    // Restore quantities to local inventory
    const itemId = getSafeItemId(materialToRemove.item);

    // Case 1: Bobbin (identified by batchCode)
    if (materialToRemove.batchCode) {
      // IMPORTANT: Save changes to server to persist bobbin restoration
      // The backend handles inventory restoration, so we DON'T update local state here
      if (onImmediateSave) {
        (async () => {
          try {
            console.log('[handleRemoveItem] Saving bobbin removal to backend...');
            await onImmediateSave(newMaterials);
            console.log('[handleRemoveItem] Bobbin removal saved successfully.');
          } catch (error) {
            console.error('[handleRemoveItem] Error saving bobbin removal:', error);
            Alert.alert('Error', 'No se pudo sincronizar la devolución de bobina con el servidor');
          }
        })();
      } else {
        // Only update local batch state if NOT saving to backend (offline mode)
        setBatches((prev) => {
          const batchExists = prev.some((b) => b.batchCode === materialToRemove.batchCode);

          if (batchExists) {
            return prev.map((b) => {
              if (b.batchCode === materialToRemove.batchCode) {
                return {
                  ...b,
                  currentQuantity: b.currentQuantity + materialToRemove.quantity,
                };
              }
              return b;
            });
          } else {
            console.log('[handleRemoveItem] Batch not found in local state');
            return prev;
          }
        });
      }
      return;
    }

    // Case 2: Equipment (identified by instanceIds)
    if (materialToRemove.instanceIds && materialToRemove.instanceIds.length > 0) {
      // IMPORTANT: Save changes to server to persist equipment restoration
      // The backend handles inventory restoration, so we DON'T update local inventory here
      if (onImmediateSave) {
        (async () => {
          try {
            console.log('[handleRemoveItem] Saving equipment removal to backend...');
            await onImmediateSave(newMaterials);
            console.log('[handleRemoveItem] Equipment removal saved successfully.');
          } catch (error) {
            console.error('[handleRemoveItem] Error saving equipment removal:', error);
            Alert.alert('Error', 'No se pudo sincronizar la devolución de equipo con el servidor');
          }
        })();
      } else {
        // Only update local inventory if NOT saving to backend (offline mode)
        setInventory((prev) =>
          prev.map((inv) => {
            const invItemId = typeof inv.item === 'string' ? inv.item : (inv.item as any)._id;
            if (invItemId.toString() === itemId.toString()) {
              return {
                ...inv,
                quantity: inv.quantity + materialToRemove.instanceIds!.length,
              };
            }
            return inv;
          })
        );
      }
      return;
    }

    // Case 3: Regular Material
    setInventory((prev) =>
      prev.map((inv) => {
        const invItemId = typeof inv.item === 'string' ? inv.item : (inv.item as any)._id;
        if (invItemId.toString() === itemId.toString()) {
          return {
            ...inv,
            quantity: inv.quantity + materialToRemove.quantity,
          };
        }
        return inv;
      })
    );
  };

  const renderInventoryItem = ({ item }: { item: AssignedInventoryItem }) => {
    const details = getItemDetails(item);
    // Only mark selected IF viewState is inventory (though in instances view this list is hidden anyway)
    const isSelected = selectedItem === item;

    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.selectedItemCard]}
        onPress={() => handleSelectItem(item)}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemCode}>{details?.code || 'S/C'}</Text>
          <Text style={styles.itemName}>{details?.description || 'Sin descripción'}</Text>
        </View>
        <View style={styles.itemStock}>
          <Text style={styles.stockValue}>{item.quantity}</Text>
          <Text style={styles.stockLabel}>{details?.unit || 'und'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Assigned Materials List */}
      {materialsUsed.length > 0 ? (
        <View style={styles.listContainer}>
          {materialsUsed.map((material, index) => (
            <View key={`${material.item}-${index}`} style={styles.materialRow}>
              <View style={styles.materialInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {material.batchCode && <FontAwesome name="circle" size={8} color="#3b82f6" />}
                  {material.instanceIds && material.instanceIds.length > 0 && (
                    <FontAwesome name="microchip" size={10} color="#9333ea" />
                  )}
                  <Text style={styles.materialName}>
                    {getMaterialDescription(material, inventory, batches)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <Text style={styles.materialQty}>Cant: {material.quantity}</Text>
                  {material.batchCode && (
                    <View
                      style={{
                        backgroundColor: '#dbeafe',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                      <Text style={{ fontSize: 10, color: '#1e40af', fontWeight: '600' }}>
                        {material.batchCode}
                      </Text>
                    </View>
                  )}
                  {material.instanceIds && material.instanceIds.length > 0 && (
                    <View
                      style={{
                        backgroundColor: '#f3e8ff',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                      <Text style={{ fontSize: 10, color: '#6b21a8', fontWeight: '600' }}>
                        {material.instanceIds.length} inst.
                      </Text>
                    </View>
                  )}
                </View>
                {/* Show instance details if available */}
                {material.instanceDetails && material.instanceDetails.length > 0 && (
                  <View style={{ marginTop: 6, paddingLeft: 12 }}>
                    {material.instanceDetails.map(
                      (detail: { uniqueId: string; serialNumber: string }, idx: number) => (
                        <View key={idx} style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                          <Text style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>
                            ID: {detail.uniqueId}
                          </Text>
                          {detail.serialNumber && detail.serialNumber !== 'N/A' && (
                            <Text style={{ fontSize: 10, color: '#64748b' }}>
                              S/N: {detail.serialNumber}
                            </Text>
                          )}
                        </View>
                      )
                    )}
                  </View>
                )}
              </View>
              {!readOnly && (
                <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeBtn}>
                  <FontAwesome name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome name="cube" size={24} color="#cbd5e1" />
          <Text style={styles.emptyText}>No hay materiales asignados</Text>
        </View>
      )}

      {/* Add Button */}
      {!readOnly && (
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <FontAwesome name="plus" size={14} color="#fff" />
          <Text style={styles.addButtonText}>Agregar Material</Text>
        </TouchableOpacity>
      )}

      {/* Selection Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
            {/* Drag Handle */}
            <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Material</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalContent, { flex: 1 }]}>
              {viewState === 'inventory' ? (
                <>
                  {/* Search Bar */}
                  <View style={styles.searchContainer}>
                    <FontAwesome
                      name="search"
                      size={16}
                      color="#94a3b8"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar por código o descripción..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <FontAwesome name="times-circle" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Inventory List */}
                  {loading ? (
                    <View style={styles.centerContainer}>
                      <ActivityIndicator size="large" color={BrandColors.primary} />
                      <Text style={styles.loadingText}>Cargando inventario...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredInventory}
                      renderItem={renderInventoryItem}
                      keyExtractor={(item, index) => `${getSafeItemId(item.item)}-${index}`}
                      contentContainerStyle={styles.inventoryList}
                      ListEmptyComponent={
                        <View style={styles.centerContainer}>
                          <Text style={styles.emptyListText}>
                            {searchQuery
                              ? 'No se encontraron resultados'
                              : 'No hay inventario disponible'}
                          </Text>
                        </View>
                      }
                    />
                  )}
                </>
              ) : viewState === 'instances' ? (
                <>
                  {/* Instance View Header/Search */}
                  <View style={styles.instanceHeader}>
                    <TouchableOpacity onPress={handleBackToInventory} style={styles.backButton}>
                      <FontAwesome name="arrow-left" size={16} color="#64748b" />
                      <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.instanceTitle}>
                      {getItemDetails(selectedItem!)?.description || 'Equipo'}
                    </Text>
                  </View>

                  <View style={styles.searchContainer}>
                    <FontAwesome
                      name="search"
                      size={16}
                      color="#94a3b8"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar serial, MAC..."
                      value={instanceSearchQuery}
                      onChangeText={setInstanceSearchQuery}
                      autoCapitalize="none"
                    />
                    {instanceSearchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setInstanceSearchQuery('')}>
                        <FontAwesome name="times-circle" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={openScanner} style={styles.scanButton}>
                      <FontAwesome name="camera" size={20} color={BrandColors.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* Instances List */}
                  {loadingInstances ? (
                    <View style={styles.centerContainer}>
                      <ActivityIndicator size="large" color={BrandColors.primary} />
                      <Text style={styles.loadingText}>Cargando instancias...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredInstances}
                      keyExtractor={(i) => i.uniqueId}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.instanceRow,
                            selectedInstance?.uniqueId === item.uniqueId &&
                              styles.selectedInstanceRow,
                          ]}
                          onPress={() => handleSelectInstance(item)}>
                          <View style={styles.instanceInfo}>
                            <Text
                              style={[
                                styles.instanceSerial,
                                selectedInstance?.uniqueId === item.uniqueId &&
                                  styles.selectedInstanceText,
                              ]}>
                              ID: {item.uniqueId}
                            </Text>
                            {item.macAddress && (
                              <Text
                                style={[
                                  styles.instanceMac,
                                  selectedInstance?.uniqueId === item.uniqueId &&
                                    styles.selectedInstanceSubtext,
                                ]}>
                                MAC: {item.macAddress}
                              </Text>
                            )}
                          </View>
                          {selectedInstance?.uniqueId === item.uniqueId && (
                            <FontAwesome name="check-circle" size={20} color="#fff" />
                          )}
                        </TouchableOpacity>
                      )}
                      contentContainerStyle={styles.inventoryList}
                      ListEmptyComponent={
                        <View style={styles.centerContainer}>
                          <Text style={styles.emptyListText}>
                            {instanceSearchQuery
                              ? 'No se encontraron resultados'
                              : 'No hay instancias disponibles'}
                          </Text>
                        </View>
                      }
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Batches View */}
                  <View style={styles.instanceHeader}>
                    <TouchableOpacity onPress={handleBackToInventory} style={styles.backButton}>
                      <FontAwesome name="arrow-left" size={16} color="#64748b" />
                      <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.instanceTitle}>
                      {getItemDetails(selectedItem!)?.description || 'Material'} (Bobinas)
                    </Text>
                  </View>

                  <FlatList
                    data={batches.filter(
                      (b) =>
                        b.currentQuantity > 0 &&
                        getSafeItemId(b.item) === getSafeItemId(selectedItem?.item)
                    )}
                    keyExtractor={(b) => b.batchCode}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.instanceRow, // Reusing instance row styles
                          selectedBatch?.batchCode === item.batchCode && styles.selectedInstanceRow,
                        ]}
                        onPress={() => {
                          setSelectedBatch(item);
                        }}>
                        <View style={styles.instanceInfo}>
                          <Text
                            style={[
                              styles.instanceSerial,
                              selectedBatch?.batchCode === item.batchCode &&
                                styles.selectedInstanceText,
                            ]}>
                            {item.batchCode}
                          </Text>
                          <Text
                            style={[
                              styles.instanceMac,
                              selectedBatch?.batchCode === item.batchCode &&
                                styles.selectedInstanceSubtext,
                            ]}>
                            Disponible: {item.currentQuantity} {item.unit}
                          </Text>
                        </View>
                        {selectedBatch?.batchCode === item.batchCode && (
                          <FontAwesome name="check-circle" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.inventoryList}
                    ListEmptyComponent={
                      <View style={styles.centerContainer}>
                        <Text style={styles.emptyListText}>No hay bobinas disponibles</Text>
                      </View>
                    }
                  />
                </>
              )}

              {/* Footer (Shared but adapted) */}
              {selectedItem &&
                (viewState === 'inventory' ||
                  selectedInstance ||
                  (viewState === 'batches' && selectedBatch)) && (
                  <Animated.View style={[styles.footer, { bottom: keyboardHeight }]}>
                    <View style={styles.selectedSummary}>
                      <Text style={styles.selectedLabel}>Seleccionado:</Text>
                      <Text style={styles.selectedValue} numberOfLines={1}>
                        {getItemDetails(selectedItem)?.description}
                        {selectedInstance
                          ? ` (${selectedInstance.serialNumber || selectedInstance.uniqueId})`
                          : ''}
                        {selectedBatch ? ` (${selectedBatch.batchCode})` : ''}
                      </Text>
                    </View>

                    {/* Show Quantity control for Inventory AND Batches */}
                    {(viewState === 'inventory' || viewState === 'batches') && (
                      <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Cantidad:</Text>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() =>
                              setQuantity(Math.max(1, parseInt(quantity) - 1).toString())
                            }>
                            <FontAwesome name="minus" size={12} color="#1e293b" />
                          </TouchableOpacity>
                          <TextInput
                            style={styles.quantityInput}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            maxLength={4}
                          />
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => {
                              const max = selectedBatch
                                ? selectedBatch.currentQuantity
                                : selectedItem.quantity;
                              setQuantity(Math.min(max, parseInt(quantity) + 1).toString());
                            }}>
                            <FontAwesome name="plus" size={12} color="#1e293b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        // Disable if viewing instances but none selected
                        ((viewState === 'instances' && !selectedInstance) ||
                          (viewState === 'batches' && !selectedBatch)) && { opacity: 0.5 },
                      ]}
                      onPress={handleAddItem}
                      disabled={
                        (viewState === 'instances' && !selectedInstance) ||
                        (viewState === 'batches' && !selectedBatch)
                      }>
                      <Text style={styles.confirmButtonText}>
                        {viewState === 'instances' ? 'Confirmar Selección' : 'Agregar a la Orden'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['code128', 'code39', 'code93', 'ean13', 'ean8', 'qr', 'datamatrix'],
            }}
            onBarcodeScanned={(result) => {
              if (result.data) {
                handleBarcodeScan(result.data);
              }
            }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                style={styles.scannerCloseButton}>
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.scannerTitle}>Escanear Código</Text>
              <View style={{ width: 40 }} />
            </View>
            <View style={styles.scannerTargetArea}>
              <View style={styles.scannerCorner} />
            </View>
            <Text style={styles.scannerHint}>Apunta la cámara al código de barras del equipo</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scanButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: 'rgba(156, 163, 98, 0.1)',
    borderRadius: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  scannerCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scannerTargetArea: {
    width: 280,
    height: 160,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCorner: {
    // Visual guide corners could be added here
  },
  scannerHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContainer: {
    marginBottom: 12,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  materialQty: {
    fontSize: 12,
    color: '#64748b',
  },
  removeBtn: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    height: '85%', // Ensure consistent height for bottom sheet feel
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    height: '100%',
  },
  inventoryList: {
    paddingHorizontal: 16,
    paddingBottom: 200, // Extra padding for footer space
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedItemCard: {
    borderColor: BrandColors.primary,
    backgroundColor: '#eff6ff',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemCode: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  itemName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  itemStock: {
    alignItems: 'flex-end',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  stockLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyListText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  // Footer Styles
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 30, // Extra padding for safe area
  },
  selectedSummary: {
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  qtyBtn: {
    padding: 12,
    backgroundColor: '#e2e8f0',
  },
  quantityInput: {
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  instanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  instanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  instanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedInstanceRow: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  instanceInfo: {
    flex: 1,
    marginRight: 16,
  },
  instanceSerial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  instanceMac: {
    fontSize: 12,
    color: '#64748b',
  },
  instanceId: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  selectedInstanceText: {
    color: '#fff',
  },
  selectedInstanceSubtext: {
    color: '#e2e8f0',
  },
  // Kept for backward compatibility if needed, but largely replaced by rows
  instancesTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  instanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
  },
  selectedInstanceBadge: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  instanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  instanceSubtext: {
    fontSize: 10,
    color: '#64748b',
  },
  noInstancesText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  fixedQty: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fixedQtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
