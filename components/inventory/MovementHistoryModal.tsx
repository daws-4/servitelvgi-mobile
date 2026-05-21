import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';

import { BrandColors } from '@/constants/colors';
import inventoryService from '@/services/api/inventory';
import type { InventoryHistoryEntry } from '@/types/Inventory';

interface MovementHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  crewId: string;
  inventory?: {
    item: any;
    itemDetails?: any;
  }[];
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getChangeTypeLabel = (type: string): string => {
  switch (type) {
    case 'entry':
      return 'Ingreso a Bodega';
    case 'assignment':
      return 'Asignación';
    case 'usage_order':
      return 'Uso en Orden';
    case 'return':
      return 'Devolución';
    case 'adjustment':
      return 'Ajuste';
    default:
      return type;
  }
};

const getChangeTypeStyle = (type: string) => {
  switch (type) {
    case 'entry':
      return { bg: '#dcfce7', text: '#16a34a', icon: 'plus-circle' };
    case 'assignment':
      return { bg: '#dbeafe', text: '#2563eb', icon: 'truck' };
    case 'usage_order':
      return { bg: '#fef3c7', text: '#d97706', icon: 'wrench' }; // Naranja para uso
    case 'return':
      return { bg: '#fce7f3', text: '#be185d', icon: 'rotate-left' };
    case 'adjustment':
      return { bg: '#f1f5f9', text: '#64748b', icon: 'sliders' };
    default:
      return { bg: '#f1f5f9', text: '#64748b', icon: 'info-circle' };
  }
};

export default function MovementHistoryModal({
  visible,
  onClose,
  crewId,
  inventory = [],
}: MovementHistoryModalProps) {
  // Default to last 7 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            // Don't reset here - will reset when modal opens again
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const fetchHistory = useCallback(
    async (pageNum = 1) => {
      if (!crewId) return;

      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }
        setError(null);

        const limit = 10;
        const data = await inventoryService.getInventoryHistory(crewId, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          page: pageNum,
          limit,
        });

        if (pageNum === 1) {
          setHistory(data);
        } else {
          setHistory((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === limit);
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message || 'Error al cargar historial');
        console.error('Error fetching inventory history:', err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [crewId, startDate, endDate]
  );

  useEffect(() => {
    if (visible && crewId) {
      // Reset pagination when modal opens or crew/dates change
      setPage(1);
      setHasMore(true);
      fetchHistory(1);
      translateY.setValue(0);
    }
  }, [visible, crewId, fetchHistory]);

  const handleLoadMore = () => {
    if (hasMore && !loading && !isFetchingMore) {
      fetchHistory(page + 1);
    }
  };

  const onStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const renderHistoryItem = ({ item }: { item: InventoryHistoryEntry }) => {
    const typeStyle = getChangeTypeStyle(item.type);

    // Determinar el nombre del item
    // Determine item name
    // Backend populates 'item' field directly, handling both string ID (rare if populating) or object
    const itemObj = typeof item.item === 'object' ? item.item : null;
    const itemCode = itemObj?.code || item.itemDetails?.code || '';
    const itemDescription =
      itemObj?.description || item.itemDetails?.description || 'Item desconocido';
    const displayTitle = itemCode ? `[${itemCode}] ${itemDescription}` : itemDescription;

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
            <FontAwesome name={typeStyle.icon as any} size={10} color={typeStyle.text} />
            <Text style={[styles.typeText, { color: typeStyle.text }]}>
              {getChangeTypeLabel(item.type)}
            </Text>
          </View>
          <Text style={styles.historyDate}>{formatDateTime(item.createdAt as string)}</Text>
        </View>

        {/* Mostrar item y cantidad */}
        <View style={styles.materialRow}>
          <FontAwesome name="cube" size={14} color="#64748b" />
          <Text
            style={[styles.materialName, { fontSize: 14, fontWeight: '600', color: '#334155' }]}>
            {displayTitle}
          </Text>
          <Text
            style={[
              styles.materialQty,
              { fontSize: 14, color: item.quantityChange > 0 ? '#16a34a' : '#ef4444' },
            ]}>
            {item.quantityChange > 0 ? '+' : ''}
            {item.quantityChange}
          </Text>
        </View>

        {/* Motivo */}
        {item.reason && <Text style={styles.historyDescription}>{item.reason}</Text>}

        {/* Orden Relacionada */}
        {item.order && typeof item.order === 'object' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
            <FontAwesome name="file-text-o" size={12} color="#64748b" />
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              Orden: {(item.order as any).ticket_id || (item.order as any).subscriberNumber}
            </Text>
          </View>
        )}

        {/* Realizado por */}
        {item.performedBy && typeof item.performedBy === 'object' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 }}>
            <FontAwesome name="user" size={12} color="#64748b" />
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              Por: {item.performedBy.name || item.performedBy.username || 'Usuario'}
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
              <FontAwesome name="history" size={18} color={BrandColors.primary} />
              <Text style={styles.headerTitle}>Historial de Movimientos</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Date Filters */}
          <View style={styles.dateFilters}>
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>Desde:</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                <FontAwesome name="calendar" size={12} color={BrandColors.primary} />
                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>Hasta:</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                <FontAwesome name="calendar" size={12} color={BrandColors.primary} />
                <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={() => fetchHistory(1)}>
              <FontAwesome name="search" size={14} color="white" />
            </TouchableOpacity>
          </View>

          {/* Date Pickers (Android) */}
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onStartDateChange}
              maximumDate={endDate}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onEndDateChange}
              minimumDate={startDate}
              maximumDate={new Date()}
            />
          )}

          {/* Content */}
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
              <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <FontAwesome name="exclamation-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchHistory(1)}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.centerContent}>
              <FontAwesome name="file-text-o" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No hay movimientos en este período</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item._id}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                isFetchingMore ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size="small" color={BrandColors.primary} />
                  </View>
                ) : null
              }
            />
          )}

          {/* Stats */}
          {!loading && !error && history.length > 0 && (
            <View style={styles.stats}>
              <Text style={styles.statsText}>{history.length} movimientos encontrados</Text>
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
    maxHeight: '85%',
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
  dateFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
  },
  datePickerContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: BrandColors.primary,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  retryText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  historyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  historyDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  historyDescription: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  materialsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  materialName: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  materialQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
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
