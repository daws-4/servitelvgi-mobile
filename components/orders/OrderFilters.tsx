import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/colors';

interface FilterOption {
    id: string;
    label: string;
}

interface OrderFiltersProps {
    activeFilter: string;
    onSelectFilter: (id: string) => void;
}

const filters: FilterOption[] = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'fault', label: 'Averías' },
];

export default function OrderFilters({ activeFilter, onSelectFilter }: OrderFiltersProps) {
    return (
        <View style={styles.container}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeChip: {
        backgroundColor: BrandColors.primary,
    },
    inactiveChip: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
    },
    chipText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    activeChipText: {
        color: 'white',
    },
    inactiveChipText: {
        color: '#64748b', // slate-500
    },
});
