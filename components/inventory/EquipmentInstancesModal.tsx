import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';

import { BrandColors } from '@/constants/colors';
import { useEquipmentInstances } from '@/hooks/useEquipmentInstances';
import type { EquipmentInstance, InventoryItem } from '@/types/Inventory';

interface EquipmentInstancesModalProps {
  visible: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  crewId?: string; // Optional: if provided, only show instances assigned to this crew
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in-stock':
      return 'En Stock';
    case 'assigned':
      return 'Asignado';
    case 'installed':
      return 'Instalado';
    default:
      return status;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'in-stock':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'assigned':
      return { bg: '#fef3c7', text: '#d97706' };
    case 'installed':
      return { bg: '#dbeafe', text: '#2563eb' };
    default:
      return { bg: '#f1f5f9', text: '#64748b' };
  }
};

export default function EquipmentInstancesModal({
  visible,
  onClose,
  item,
  crewId,
}: EquipmentInstancesModalProps) {
  const { instances, loading, error, fetchInstances } = useEquipmentInstances();
  const [search, setSearch] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe to close
  const panResponder = useRef(
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
          // Close modal if dragged down more than 100px
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            // Don't reset here - will reset when modal opens again
          });
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible && item?._id) {
      // If crewId is provided, fetch only instances assigned to this crew
      if (crewId) {
        fetchInstances(item._id, 'assigned', crewId);
      } else {
        fetchInstances(item._id);
      }
      translateY.setValue(0);
    }
  }, [visible, item?._id, crewId, fetchInstances]);

  const filteredInstances = instances.filter((instance) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      instance.uniqueId?.toLowerCase().includes(searchLower) ||
      instance.serialNumber?.toLowerCase().includes(searchLower) ||
      instance.macAddress?.toLowerCase().includes(searchLower)
    );
  });

  const renderInstance = ({ item: instance }: { item: EquipmentInstance }) => {
    const statusStyle = getStatusStyle(instance.status);
    return (
      <View style={styles.instanceCard}>
        <View style={styles.instanceHeader}>
          <Text style={styles.instanceId}>{instance.uniqueId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusLabel(instance.status)}
            </Text>
          </View>
        </View>

        {instance.serialNumber && (
          <View style={styles.instanceRow}>
            <FontAwesome name="barcode" size={12} color="#94a3b8" />
            <Text style={styles.instanceLabel}>Serial:</Text>
            <Text style={styles.instanceValue}>{instance.serialNumber}</Text>
          </View>
        )}

        {instance.macAddress && (
          <View style={styles.instanceRow}>
            <FontAwesome name="wifi" size={12} color="#94a3b8" />
            <Text style={styles.instanceLabel}>MAC:</Text>
            <Text style={styles.instanceValue}>{instance.macAddress}</Text>
          </View>
        )}

        {instance.installedAt && (
          <View style={styles.instanceRow}>
            <FontAwesome name="map-marker" size={12} color="#94a3b8" />
            <Text style={styles.instanceLabel}>Ubicación:</Text>
            <Text style={styles.instanceValue} numberOfLines={1}>
              {instance.installedAt.location}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <FontAwesome name="cubes" size={18} color={BrandColors.primary} />
              <Text style={styles.headerTitle}>Instancias del Equipo</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Item Info */}
          {item && (
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.description}</Text>
              <Text style={styles.itemCode}>Código: {item.code}</Text>
            </View>
          )}

          {/* Search */}
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={14} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por serial o MAC..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
              <Text style={styles.loadingText}>Cargando instancias...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <FontAwesome name="exclamation-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : filteredInstances.length === 0 ? (
            <View style={styles.centerContent}>
              <FontAwesome name="inbox" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {search ? 'No se encontraron instancias' : 'No hay instancias registradas'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredInstances}
              keyExtractor={(i) => i.uniqueId}
              renderItem={renderInstance}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Stats */}
          {!loading && !error && instances.length > 0 && (
            <View style={styles.stats}>
              <Text style={styles.statsText}>Total: {instances.length} instancias</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  itemInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
    color: '#64748b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    paddingLeft: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  instanceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  instanceId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  instanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  instanceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  instanceValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
    flex: 1,
  },
  stats: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statsText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
