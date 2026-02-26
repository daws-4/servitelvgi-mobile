import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventorySummary from '@/components/inventory/InventorySummary';
import InventorySearchBar from '@/components/inventory/InventorySearchBar';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryItem from '@/components/inventory/InventoryItem';
import EquipmentInstancesModal from '@/components/inventory/EquipmentInstancesModal';
import MovementHistoryModal from '@/components/inventory/MovementHistoryModal';
import { InternetSpeedTest } from '@/components/InternetSpeedTest';
import { BrandColors } from '@/constants/colors';
import { useAuth } from '@/app/contexts/AuthContext';
import { useInventory } from '@/hooks/useInventory';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import type { AssignedInventoryItem, InventoryItem as InventoryItemType, InventoryType } from '@/types/Inventory';

// Helper to get item details from either item or itemDetails (API returns item as populated object)
const getItemDetails = (assignedItem: AssignedInventoryItem): InventoryItemType | null => {
    // El API puede devolver item como objeto populado o itemDetails
    if (assignedItem.itemDetails) return assignedItem.itemDetails;
    if (typeof assignedItem.item === 'object' && assignedItem.item !== null) {
        return assignedItem.item as unknown as InventoryItemType;
    }
    return null;
};

// Helper to get icon based on item type or code
const getItemIcon = (item: InventoryItemType): string => {
    if (item.type === 'equipment') return 'wifi';

    const description = item.description?.toLowerCase() || '';
    if (description.includes('cable') || description.includes('fibra')) return 'plug';
    if (description.includes('conector')) return 'link';
    if (description.includes('roseta')) return 'square';
    if (description.includes('splitter')) return 'sitemap';
    if (description.includes('tornillo') || description.includes('herramienta')) return 'wrench';

    return 'cube';
};

// Helper to check if item is low stock
const isLowStock = (assignedItem: AssignedInventoryItem): boolean => {
    const details = getItemDetails(assignedItem);
    if (!details) return false;
    return assignedItem.quantity <= (details.minimumStock || 5);
};

export default function InventoryScreen() {
    const tabBarHeight = useBottomTabBarHeight();
    const { installer } = useAuth();
    const crewId = installer?.crew?._id || '';

    // Fetch inventory
    const { inventory, loading, error, refetch } = useInventory(crewId);

    // State
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<InventoryItemType | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Refetch inventory when screen is focused
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Enable smart polling for inventory updates
    useSmartPolling({
        callback: refetch,
        interval: 1000 * 60 * 6, // Poll every 6 minutes (aligned with staleTime)
        enabled: !loading && !!crewId
    });

    // Calculate summary stats
    const stats = useMemo(() => {
        let totalItems = 0;
        let lowStockCount = 0;

        inventory.forEach((item) => {
            totalItems++;
            if (isLowStock(item)) lowStockCount++;
        });

        return { totalItems, lowStockCount };
    }, [inventory]);

    // Filter inventory based on active filter, low stock, and search
    const filteredInventory = useMemo(() => {
        return inventory.filter((assignedItem) => {
            const details = getItemDetails(assignedItem);
            if (!details) return false;

            // Type filter
            if (activeFilter !== 'all' && details.type !== activeFilter) {
                return false;
            }

            // Low stock filter
            if (lowStockOnly && !isLowStock(assignedItem)) {
                return false;
            }

            // Search filter
            if (searchText) {
                const searchLower = searchText.toLowerCase();

                // Search in description and code
                if (
                    details.description?.toLowerCase().includes(searchLower) ||
                    details.code?.toLowerCase().includes(searchLower)
                ) {
                    return true;
                }

                // For equipment, also search in instances (serial, MAC)
                if (details.type === 'equipment' && details.instances) {
                    const hasMatchingInstance = details.instances.some((inst) =>
                        inst.serialNumber?.toLowerCase().includes(searchLower) ||
                        inst.macAddress?.toLowerCase().includes(searchLower) ||
                        inst.uniqueId?.toLowerCase().includes(searchLower)
                    );
                    if (hasMatchingInstance) return true;
                }

                return false;
            }

            return true;
        });
    }, [inventory, activeFilter, lowStockOnly, searchText]);

    // Handle item press
    const handleItemPress = (assignedItem: AssignedInventoryItem) => {
        const details = getItemDetails(assignedItem);
        if (details?.type === 'equipment') {
            setSelectedEquipment(details);
        }
    };

    // Render loading state
    if (loading && inventory.length === 0) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text className="mt-4 text-slate-500">Cargando inventario...</Text>
            </View>
        );
    }

    // Render error state
    if (error && inventory.length === 0) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center px-6">
                <FontAwesome name="exclamation-circle" size={48} color="#ef4444" />
                <Text className="mt-4 text-red-500 text-center">{error}</Text>
                <TouchableOpacity
                    className="mt-4 px-6 py-3 rounded-xl"
                    style={{ backgroundColor: BrandColors.primary }}
                    onPress={refetch}
                >
                    <Text className="text-white font-bold">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Render no crew state
    if (!crewId) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center px-6">
                <FontAwesome name="users" size={48} color="#cbd5e1" />
                <Text className="mt-4 text-slate-500 text-center">
                    No estás asignado a una cuadrilla.{'\n'}
                    Contacta a tu supervisor para ver tu inventario.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header with Summary */}
            <InventoryHeader>
                <InventorySummary
                    totalItems={stats.totalItems}
                    lowStockCount={stats.lowStockCount}
                />
            </InventoryHeader>

            {/* Search and Filters */}
            <View className="px-6 pb-4 gap-4 mt-6">
                <InventorySearchBar onSearch={setSearchText} />
                <InventoryFilters
                    activeFilter={activeFilter}
                    onSelectFilter={setActiveFilter}
                    lowStockOnly={lowStockOnly}
                    onToggleLowStock={() => setLowStockOnly(!lowStockOnly)}
                />
            </View>

            {/* Inventory List */}
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    gap: 12,
                    paddingBottom: tabBarHeight + 100
                }}
                showsVerticalScrollIndicator={true}
            >
                {/* Internet Speed Test */}
                {/* <InternetSpeedTest /> */}

                {/* Empty state */}
                {filteredInventory.length === 0 && (
                    <View className="items-center py-12">
                        <FontAwesome name="inbox" size={48} color="#cbd5e1" />
                        <Text className="mt-4 text-slate-400 text-center">
                            {searchText || lowStockOnly
                                ? 'No se encontraron materiales con estos filtros'
                                : 'No hay materiales asignados a tu cuadrilla'}
                        </Text>
                    </View>
                )}

                {/* Inventory Items */}
                {filteredInventory.map((assignedItem, index) => {
                    const details = getItemDetails(assignedItem);
                    if (!details) return null;

                    return (
                        <InventoryItem
                            key={details._id || index}
                            item={{
                                id: details._id,
                                name: details.description,
                                code: details.code,
                                quantity: assignedItem.quantity,
                                unit: details.unit?.toUpperCase() || 'UNIDADES',
                                icon: getItemIcon(details),
                                isLowStock: isLowStock(assignedItem),
                                isEquipment: details.type === 'equipment',
                            }}
                            onPress={() => handleItemPress(assignedItem)}
                        />
                    );
                })}
            </ScrollView>

            {/* Floating Action Button - History */}
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
                onPress={() => setShowHistoryModal(true)}
            >
                <FontAwesome name="history" size={20} color="white" />
            </TouchableOpacity>

            {/* Equipment Instances Modal */}
            <EquipmentInstancesModal
                visible={!!selectedEquipment}
                onClose={() => setSelectedEquipment(null)}
                item={selectedEquipment}
                crewId={crewId}
            />

            {/* Movement History Modal */}
            <MovementHistoryModal
                visible={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                crewId={crewId}
                inventory={inventory}
            />
        </View>
    );
}
