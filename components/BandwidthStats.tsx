import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBandwidthStats } from '@/hooks/useBandwidthStats';
import { Wifi, Smartphone, RefreshCw, Trash2 } from 'lucide-react-native';

export const BandwidthStats = () => {
    const { stats, loadStats, resetStats, updateStats, wifiUsage, mobileUsage, totalUsage } = useBandwidthStats();

    useEffect(() => {
        loadStats();
    }, []);

    const handleRefresh = async () => {
        await updateStats();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Consumo de Datos</Text>

            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.iconContainer}>
                        <Wifi size={24} color="#0EA5E9" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.label}>WiFi</Text>
                        <Text style={styles.value}>{wifiUsage.formattedTotal}</Text>
                        <Text style={styles.subtext}>
                            ↓ {stats.wifi.bytesReceived > 0 ? (stats.wifi.bytesReceived / 1024).toFixed(1) + 'KB' : '0KB'} ·
                            ↑ {stats.wifi.bytesSent > 0 ? (stats.wifi.bytesSent / 1024).toFixed(1) + 'KB' : '0KB'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.iconContainer}>
                        <Smartphone size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.label}>Datos Móviles</Text>
                        <Text style={styles.value}>{mobileUsage.formattedTotal}</Text>
                        <Text style={styles.subtext}>
                            ↓ {stats.mobile.bytesReceived > 0 ? (stats.mobile.bytesReceived / 1024).toFixed(1) + 'KB' : '0KB'} ·
                            ↑ {stats.mobile.bytesSent > 0 ? (stats.mobile.bytesSent / 1024).toFixed(1) + 'KB' : '0KB'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.totalText}>Total: {totalUsage.formatted}</Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={handleRefresh} style={styles.actionButton}>
                        <RefreshCw size={16} color="#0EA5E9" />
                        <Text style={[styles.actionText, { color: '#0EA5E9' }]}>Refrescar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={resetStats} style={styles.actionButton}>
                        <Trash2 size={16} color="#EF4444" />
                        <Text style={[styles.actionText, { color: '#EF4444' }]}>Resetear</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1F2937',
    },
    card: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 50,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtext: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 6,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
