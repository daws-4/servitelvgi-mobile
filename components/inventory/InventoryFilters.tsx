import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/colors';

interface FilterOption {
    id: string;
    label: string;
}

interface InventoryFiltersProps {
    activeFilter: string;
    onSelectFilter: (id: string) => void;
}

const filters: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'cables', label: 'Cables' },
    { id: 'equipment', label: 'Equipos' },
    { id: 'connectors', label: 'Conectores' },
];

export default function InventoryFilters({ activeFilter, onSelectFilter }: InventoryFiltersProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        gap: 8,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
});
