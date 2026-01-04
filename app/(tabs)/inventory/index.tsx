import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventorySummary from '@/components/inventory/InventorySummary';
import InventorySearchBar from '@/components/inventory/InventorySearchBar';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryItem, { InventoryItemData } from '@/components/inventory/InventoryItem';
import { InternetSpeedTest } from '@/components/InternetSpeedTest';
import { BrandColors } from '@/constants/colors';

// Mock inventory data
const MOCK_INVENTORY: InventoryItemData[] = [
    {
        id: '1',
        name: 'ONT HUAWEI EG8145V5',
        code: '00-042',
        quantity: 2,
        unit: 'UNIDADES',
        icon: 'wifi',
        isLowStock: true,
    },
    {
        id: '2',
        name: 'CABLE UTP CAT5E',
        code: '00-001',
        quantity: 145,
        unit: 'METROS',
        icon: 'plug',
    },
    {
        id: '3',
        name: 'CONECTORES MECÁNICOS',
        code: '00-012',
        quantity: 50,
        unit: 'UNIDADES',
        icon: 'link',
    },
    {
        id: '4',
        name: 'ROSETAS ÓPTICAS',
        code: '00-008',
        quantity: 12,
        unit: 'UNIDADES',
        icon: 'square',
    },
    {
        id: '5',
        name: 'FIBRA ÓPTICA MONOMODO',
        code: '00-003',
        quantity: 3,
        unit: 'METROS',
        icon: 'arrows-h',
        isLowStock: true,
    },
    {
        id: '6',
        name: 'SPLITTER 1X8',
        code: '00-015',
        quantity: 8,
        unit: 'UNIDADES',
        icon: 'sitemap',
    },
    {
        id: '7',
        name: 'CABLE DROP FTTH',
        code: '00-002',
        quantity: 200,
        unit: 'METROS',
        icon: 'plug',
    },
    {
        id: '8',
        name: 'TORNILLOS AUTOPERFORANTES',
        code: '00-025',
        quantity: 1,
        unit: 'UNIDADES',
        icon: 'wrench',
        isLowStock: true,
    },
];

export default function InventoryScreen() {
    const tabBarHeight = useBottomTabBarHeight();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchText, setSearchText] = useState('');

    // Calculate summary stats
    const totalItems = MOCK_INVENTORY.length;
    const lowStockCount = MOCK_INVENTORY.filter(item => item.isLowStock).length;

    // Filter inventory based on active filter and search
    const filteredInventory = MOCK_INVENTORY.filter(item => {
        // Filter by search text
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            return (
                item.name.toLowerCase().includes(searchLower) ||
                item.code.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    return (
        <View className="flex-1 bg-slate-50 ">
            {/* Header with Summary */}
            <InventoryHeader>
                <InventorySummary
                    totalItems={totalItems}
                    lowStockCount={lowStockCount}
                />
            </InventoryHeader>

            {/* Search and Filters */}
            <View className="px-6 pb-6 gap-4 mt-6">
                <InventorySearchBar onSearch={setSearchText} />
                <InventoryFilters
                    activeFilter={activeFilter}
                    onSelectFilter={setActiveFilter}
                />
            </View>

            {/* Inventory List */}
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingBottom: tabBarHeight + 100 }}
                showsVerticalScrollIndicator={true}
            >
                {/* Internet Speed Test */}
                <InternetSpeedTest />

                {/* Inventory Items */}
                {filteredInventory.map((item) => (
                    <InventoryItem
                        key={item.id}
                        item={item}
                    />
                ))}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                className="absolute right-6 w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
                style={{
                    bottom: tabBarHeight + 24,
                    backgroundColor: BrandColors.primary,
                    shadowColor: BrandColors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 8,
                }}
            >
                <FontAwesome name="plus" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
}
