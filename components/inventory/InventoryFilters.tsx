import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

interface FilterOption {
    id: string;
    label: string;
}

interface InventoryFiltersProps {
    activeFilter: string;
    onSelectFilter: (id: string) => void;
    lowStockOnly?: boolean;
    onToggleLowStock?: () => void;
}

const filters: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'material', label: 'Materiales' },
    { id: 'equipment', label: 'Equipos' },
];

export default function InventoryFilters({
    activeFilter,
    onSelectFilter,
    lowStockOnly = false,
    onToggleLowStock,
}: InventoryFiltersProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                {filters.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    return (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.chip,
                                isActive ? styles.activeChip : styles.inactiveChip
                            ]}
                            onPress={() => onSelectFilter(filter.id)}
                        >
                            <Text style={[
                                styles.chipText,
                                isActive ? styles.activeChipText : styles.inactiveChipText
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* Low Stock Toggle */}
                <TouchableOpacity
                    style={[
                        styles.chip,
                        styles.lowStockChip,
                        lowStockOnly ? styles.lowStockActive : styles.lowStockInactive
                    ]}
                    onPress={onToggleLowStock}
                >
                    <FontAwesome
                        name="exclamation-triangle"
                        size={10}
                        color={lowStockOnly ? 'white' : '#ef4444'}
                        style={styles.lowStockIcon}
                    />
                    <Text style={[
                        styles.chipText,
                        lowStockOnly ? styles.lowStockActiveText : styles.lowStockInactiveText
                    ]}>
                        Stock Bajo
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Removed flexDirection: 'row' which was interfering with horizontal scroll
    },
    scrollContent: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        paddingRight: 16, // Extra padding for scrolling
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    activeChip: {
        backgroundColor: BrandColors.primary,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    inactiveChip: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
    },
    lowStockChip: {
        marginLeft: 8,
    },
    lowStockActive: {
        backgroundColor: '#ef4444',
        borderWidth: 0,
    },
    lowStockInactive: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    chipText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    activeChipText: {
        color: 'white',
    },
    inactiveChipText: {
        color: '#64748b', // slate-500
    },
    lowStockActiveText: {
        color: 'white',
    },
    lowStockInactiveText: {
        color: '#ef4444',
    },
    lowStockIcon: {
        marginRight: 4,
    },
});
