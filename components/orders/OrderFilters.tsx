import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Modal, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import type { OrderStatus, OrderType } from '@/types/Order';

interface OrderFiltersProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    statusFilter: OrderStatus | 'all';
    onStatusChange: (status: OrderStatus | 'all') => void;
    typeFilter: OrderType | 'all';
    onTypeChange: (type: OrderType | 'all') => void;
}

// Status filter options
const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'assigned', label: 'Asignadas' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'hard', label: 'HARD' },
];

// Type filter options
const TYPE_OPTIONS: { value: OrderType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'instalacion', label: 'Instalación' },
    { value: 'averia', label: 'Avería' },
    { value: 'otro', label: 'Otro' },
];

/**
 * Filter toolbar for orders list
 * Includes search, status filter, and type filter
 */
export default function OrderFilters({
    searchValue,
    onSearchChange,
    statusFilter,
    onStatusChange,
    typeFilter,
    onTypeChange,
}: OrderFiltersProps) {
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);

    const selectedStatus = STATUS_OPTIONS.find(s => s.value === statusFilter) || STATUS_OPTIONS[0];
    const selectedType = TYPE_OPTIONS.find(t => t.value === typeFilter) || TYPE_OPTIONS[0];

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
                contentContainerStyle={styles.chipsContainer}
            >
                {/* Status Filter */}
                <TouchableOpacity
                    style={[styles.chip, statusFilter !== 'all' && styles.activeChip]}
                    onPress={() => setStatusModalVisible(true)}
                >
                    <FontAwesome name="filter" size={12} color={statusFilter !== 'all' ? '#fff' : '#64748b'} />
                    <Text style={[styles.chipText, statusFilter !== 'all' && styles.activeChipText]}>
                        {selectedStatus.label}
                    </Text>
                    <FontAwesome name="chevron-down" size={10} color={statusFilter !== 'all' ? '#fff' : '#94a3b8'} />
                </TouchableOpacity>

                {/* Type Filter */}
                <TouchableOpacity
                    style={[styles.chip, typeFilter !== 'all' && styles.activeChip]}
                    onPress={() => setTypeModalVisible(true)}
                >
                    <FontAwesome name="tag" size={12} color={typeFilter !== 'all' ? '#fff' : '#64748b'} />
                    <Text style={[styles.chipText, typeFilter !== 'all' && styles.activeChipText]}>
                        {selectedType.label}
                    </Text>
                    <FontAwesome name="chevron-down" size={10} color={typeFilter !== 'all' ? '#fff' : '#94a3b8'} />
                </TouchableOpacity>
            </ScrollView>

            {/* Status Modal */}
            <Modal
                visible={statusModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setStatusModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtrar por Estado</Text>
                        <FlatList
                            data={STATUS_OPTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalOption, item.value === statusFilter && styles.modalOptionSelected]}
                                    onPress={() => {
                                        onStatusChange(item.value);
                                        setStatusModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, item.value === statusFilter && styles.modalOptionTextSelected]}>
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
                onRequestClose={() => setTypeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setTypeModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtrar por Tipo</Text>
                        <FlatList
                            data={TYPE_OPTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalOption, item.value === typeFilter && styles.modalOptionSelected]}
                                    onPress={() => {
                                        onTypeChange(item.value);
                                        setTypeModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, item.value === typeFilter && styles.modalOptionTextSelected]}>
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
