import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { InternetSpeedTest } from '@/components/InternetSpeedTest';
import orderService from '@/services/api/orders';
import { BrandColors } from '@/constants/colors';
import type { InternetTestResult, Coordinates } from '@/types/Order';

// Define the results type that matches useSpeedTest
interface SpeedTestResults {
    download: string;
    upload: string;
    ping: string;
    isp: string;
    status: string;
    coordinates: Coordinates | null;
    networkName: string;
    networkBand: string;
    error: string | null;
}

interface OrderSpeedTestProps {
    orderId: string;
    existingTest?: InternetTestResult;
    onTestSaved?: (test: InternetTestResult) => void;
    readOnly?: boolean;
}

export default function OrderSpeedTest({ orderId, existingTest, onTestSaved, readOnly = false }: OrderSpeedTestProps) {
    // Local state to store results from InternetSpeedTest
    const [results, setResults] = useState<SpeedTestResults>({
        download: '0',
        upload: '0',
        ping: '0',
        isp: 'Cargando...',
        status: 'Inactivo',
        coordinates: null,
        networkName: 'Desconocido',
        networkBand: 'Desconocido',
        error: null
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showNewTest, setShowNewTest] = useState(false);

    // Callback to receive results from InternetSpeedTest
    const handleResultsChange = useCallback((newResults: SpeedTestResults) => {
        setResults(newResults);
    }, []);

    // Determines if the test has finished successfully and has valid data to save
    const canSave = results.status === 'Finalizado' &&
        results.download !== '0' &&
        results.upload !== '0';

    const handleSaveResults = async () => {
        if (!canSave) return;

        try {
            setSaving(true);

            console.log('[OrderSpeedTest] 💾 Saving results. Current values:', JSON.stringify(results, null, 2));

            const testResult: InternetTestResult = {
                downloadSpeed: parseFloat(results.download),
                uploadSpeed: parseFloat(results.upload),
                ping: parseFloat(results.ping),
                provider: results.isp,
                wifiSSID: results.networkName,
                frecuency: results.networkBand,
                coordinates: results.coordinates ? {
                    latitude: results.coordinates.latitude,
                    longitude: results.coordinates.longitude
                } : undefined
            };

            console.log('[OrderSpeedTest] 📤 Sending to API:', JSON.stringify(testResult, null, 2));

            await orderService.updateInternetTest(orderId, {
                internetTest: testResult
                // Note: Coordinates are saved only inside internetTest, NOT at order root level
            });

            setSaved(true);
            Alert.alert('Éxito', 'Resultados de la prueba guardados correctamente');

            if (onTestSaved) {
                onTestSaved(testResult);
            }
        } catch (error: any) {
            console.error('Error saving speed test:', error);
            Alert.alert('Error', error.message || 'No se pudieron guardar los resultados');
        } finally {
            setSaving(false);
        }
    };

    // If we have existing test data and user hasn't requested a new test, show summary
    if (existingTest?.downloadSpeed && !canSave && results.status === 'Inactivo' && !showNewTest) {
        return (
            <View style={styles.savedContainer}>
                <View style={styles.savedHeader}>
                    <FontAwesome name="check-circle" size={24} color="#22c55e" />
                    <Text style={styles.savedTitle}>Prueba Registrada</Text>
                </View>

                <View style={styles.resultsGrid}>
                    <View style={styles.resultItem}>
                        <FontAwesome name="arrow-down" size={16} color="#22c55e" />
                        <Text style={styles.resultLabel}>Descarga</Text>
                        <Text style={styles.resultValue}>{existingTest.downloadSpeed} Mbps</Text>
                    </View>
                    <View style={styles.resultItem}>
                        <FontAwesome name="arrow-up" size={16} color="#3b82f6" />
                        <Text style={styles.resultLabel}>Subida</Text>
                        <Text style={styles.resultValue}>{existingTest.uploadSpeed} Mbps</Text>
                    </View>
                    {existingTest.ping && (
                        <View style={styles.resultItem}>
                            <FontAwesome name="signal" size={16} color="#f59e0b" />
                            <Text style={styles.resultLabel}>Ping</Text>
                            <Text style={styles.resultValue}>{existingTest.ping} ms</Text>
                        </View>
                    )}
                </View>

                {existingTest.wifiSSID && (
                    <View style={styles.networkInfo}>
                        <FontAwesome name="wifi" size={14} color="#64748b" />
                        <Text style={styles.networkText}>
                            {existingTest.wifiSSID} ({existingTest.frecuency || 'N/A'})
                        </Text>
                    </View>
                )}

                {!readOnly && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => setShowNewTest(true)}
                    >
                        <Text style={styles.retryText}>Realizar nueva prueba</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <InternetSpeedTest onResultsChange={handleResultsChange} disabled={readOnly} />

            {canSave && !readOnly && (
                <View style={styles.saveContainer}>
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSaveResults}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <FontAwesome name="save" size={16} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Guardar Resultados</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {saved && (
                        <Text style={styles.savedText}>
                            <FontAwesome name="check" size={12} /> Resultados guardados
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    saveContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BrandColors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    savedText: {
        marginTop: 8,
        color: '#22c55e',
        fontSize: 14,
        fontWeight: '500',
    },
    // Saved State Styles
    savedContainer: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    savedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    savedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    resultsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    resultItem: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    resultLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    networkInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    networkText: {
        fontSize: 14,
        color: '#64748b',
    },
    retryButton: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 8,
    },
    retryText: {
        color: BrandColors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
