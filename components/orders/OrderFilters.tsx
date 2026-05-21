import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
} from 'react-native';

import { BrandColors } from '@/constants/colors';
import { useOrderConfig } from '@/context/OrderConfigContext';
import type { OrderStatus, OrderType } from '@/types/Order';

interface OrderFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | 'all';
  onStatusChange: (status: OrderStatus | 'all') => void;
  typeFilter: OrderType | 'all';
  onTypeChange: (type: OrderType | 'all') => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
}

// Type filter options
const TYPE_OPTIONS: { value: OrderType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'instalacion', label: 'Instalación' },
  { value: 'averia', label: 'Avería' },
  { value: 'recuperacion', label: 'Recuperación' },
  { value: 'otro', label: 'Otro' },
];

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Filter toolbar for orders list
 * Includes search, status filter, type filter, and date range (Desde/Hasta)
 */
export default function OrderFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  sortDirection,
  onSortDirectionChange,
}: OrderFiltersProps) {
  const { config } = useOrderConfig();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Build status options
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    ...Object.values(config?.statuses || {})
      .map((s) => ({ value: s.key, label: s.label }))
      .sort(
        (a, b) => (config?.statuses[a.value]?.order || 0) - (config?.statuses[b.value]?.order || 0)
      ),
  ];

  const selectedStatus = statusOptions.find((s) => s.value === statusFilter) || statusOptions[0];
  const selectedType = TYPE_OPTIONS.find((t) => t.value === typeFilter) || TYPE_OPTIONS[0];

  const hasDateFilter = startDate !== null || endDate !== null;
  const today = new Date();

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onStartDateChange(selectedDate);
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onEndDateChange(selectedDate);
    }
  };

  const handleClearDates = () => {
    onStartDateChange(null);
    onEndDateChange(null);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={14} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, N° abonado o Ticket ID..."
          placeholderTextColor="#94a3b8"
          value={searchValue}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
            <FontAwesome name="times-circle" size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {/* Sort Button */}
        <TouchableOpacity
          style={styles.chip}
          onPress={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}>
          <FontAwesome
            name={sortDirection === 'desc' ? 'sort-amount-desc' : 'sort-amount-asc'}
            size={12}
            color="#64748b"
          />
          <Text style={styles.chipText}>
            {sortDirection === 'desc' ? 'Más recientes' : 'Más antiguas'}
          </Text>
        </TouchableOpacity>

        {/* Status Filter */}
        <TouchableOpacity
          style={[styles.chip, statusFilter !== 'all' && styles.activeChip]}
          onPress={() => setStatusModalVisible(true)}>
          <FontAwesome
            name="filter"
            size={12}
            color={statusFilter !== 'all' ? '#fff' : '#64748b'}
          />
          <Text style={[styles.chipText, statusFilter !== 'all' && styles.activeChipText]}>
            {selectedStatus.label}
          </Text>
          <FontAwesome
            name="chevron-down"
            size={10}
            color={statusFilter !== 'all' ? '#fff' : '#94a3b8'}
          />
        </TouchableOpacity>

        {/* Type Filter */}
        <TouchableOpacity
          style={[styles.chip, typeFilter !== 'all' && styles.activeChip]}
          onPress={() => setTypeModalVisible(true)}>
          <FontAwesome name="tag" size={12} color={typeFilter !== 'all' ? '#fff' : '#64748b'} />
          <Text style={[styles.chipText, typeFilter !== 'all' && styles.activeChipText]}>
            {selectedType.label}
          </Text>
          <FontAwesome
            name="chevron-down"
            size={10}
            color={typeFilter !== 'all' ? '#fff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Date Range Row */}
      <View style={styles.dateRow}>
        {/* Desde */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Desde:</Text>
          <TouchableOpacity
            style={[styles.dateButton, startDate !== null && styles.dateButtonActive]}
            onPress={() => setShowStartPicker(true)}>
            <FontAwesome
              name="calendar"
              size={12}
              color={startDate !== null ? BrandColors.primary : '#94a3b8'}
            />
            <Text
              style={[styles.dateButtonText, startDate !== null && styles.dateButtonTextActive]}>
              {startDate ? formatDate(startDate) : 'Seleccionar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hasta */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Hasta:</Text>
          <TouchableOpacity
            style={[styles.dateButton, endDate !== null && styles.dateButtonActive]}
            onPress={() => setShowEndPicker(true)}>
            <FontAwesome
              name="calendar"
              size={12}
              color={endDate !== null ? BrandColors.primary : '#94a3b8'}
            />
            <Text style={[styles.dateButtonText, endDate !== null && styles.dateButtonTextActive]}>
              {endDate ? formatDate(endDate) : 'Seleccionar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear dates button */}
        {hasDateFilter && (
          <TouchableOpacity style={styles.clearDatesButton} onPress={handleClearDates}>
            <FontAwesome name="times-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Date Pickers (native, shown on demand) */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={endDate || today}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={today}
        />
      )}

      {/* Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por Estado</Text>
            <FlatList
              data={statusOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    item.value === statusFilter && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onStatusChange(item.value);
                    setStatusModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      item.value === statusFilter && styles.modalOptionTextSelected,
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === statusFilter && (
                    <FontAwesome name="check" size={14} color={BrandColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Type Modal */}
      <Modal
        visible={typeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTypeModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypeModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por Tipo</Text>
            <FlatList
              data={TYPE_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    item.value === typeFilter && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onTypeChange(item.value);
                    setTypeModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      item.value === typeFilter && styles.modalOptionTextSelected,
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === typeFilter && (
                    <FontAwesome name="check" size={14} color={BrandColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  activeChip: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeChipText: {
    color: '#fff',
  },
  // Date range row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  datePickerContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 7,
  },
  dateButtonActive: {
    borderColor: BrandColors.primary,
    backgroundColor: '#f0f4ff',
  },
  dateButtonText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    flexShrink: 1,
  },
  dateButtonTextActive: {
    color: BrandColors.primary,
    fontWeight: '600',
  },
  clearDatesButton: {
    paddingBottom: 9,
    paddingHorizontal: 2,
  },
  sortButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionSelected: {
    backgroundColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: BrandColors.primary,
  },
});
