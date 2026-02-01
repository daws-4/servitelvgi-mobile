import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import { Colors } from '@/constants/colors';

interface InternetSpeedTestProps {
    onResultsChange?: (results: ReturnType<typeof useSpeedTest>['results']) => void;
    disabled?: boolean;
}

export const InternetSpeedTest = ({ onResultsChange, disabled = false }: InternetSpeedTestProps) => {
    const { results, startTest, clearError } = useSpeedTest();

    // Notify parent of results changes
    useEffect(() => {
        if (onResultsChange) {
            // console.log('[InternetSpeedTest] Notifying parent of results change:', JSON.stringify(results, null, 2));
            onResultsChange(results);
        }
    }, [results, onResultsChange]);

    // Animation values for real-time visual feedback
    const downloadPulse = useRef(new Animated.Value(1)).current;
    const uploadPulse = useRef(new Animated.Value(1)).current;
    const pingPulse = useRef(new Animated.Value(1)).current;

    const isTestRunning = results.status !== 'Inactivo' && results.status !== 'Finalizado' && results.status !== 'Error' && results.status !== 'Sin Conexión';
    const isError = results.status === 'Error' || results.status === 'Sin Conexión';
    const isFinished = results.status === 'Finalizado';
    const hasError = results.error !== null;

    // Animate cards when values update
    useEffect(() => {
        if (results.download !== '0' && isTestRunning) {
            Animated.sequence([
                Animated.timing(downloadPulse, {
                    toValue: 1.1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(downloadPulse, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [results.download]);

    useEffect(() => {
        if (results.upload !== '0' && isTestRunning) {
            Animated.sequence([
                Animated.timing(uploadPulse, {
                    toValue: 1.1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(uploadPulse, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [results.upload]);

    useEffect(() => {
        if (results.ping !== '0' && isTestRunning) {
            Animated.sequence([
                Animated.timing(pingPulse, {
                    toValue: 1.1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(pingPulse, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [results.ping]);

    // Get status color
    const getStatusColor = () => {
        if (isError) return Colors.error;
        if (isFinished) return Colors.success;
        if (isTestRunning) return Colors.primary;
        return Colors.textSecondary;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Test de Velocidad de Internet</Text>

            {/* Error Message */}
            {hasError && results.error && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorText}>{results.error}</Text>
                    <TouchableOpacity
                        onPress={clearError}
                        style={styles.errorDismiss}
                    >
                        <Text style={styles.errorDismissText}>✕</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.statsContainer}>
                {/* Download Speed */}
                <Animated.View
                    style={[
                        styles.statCard,
                        results.status === 'Probando Descarga' && styles.statCardActive,
                        { transform: [{ scale: downloadPulse }] }
                    ]}
                >
                    <Text style={styles.statLabel}>Descarga</Text>
                    <Text style={[
                        styles.statValue,
                        results.status === 'Probando Descarga' && styles.statValueActive
                    ]}>
                        {results.download}
                    </Text>
                    <Text style={styles.statUnit}>Mbps</Text>
                    {results.status === 'Probando Descarga' && (
                        <ActivityIndicator
                            size={14}
                            color={Colors.primary}
                            style={styles.cardLoader}
                        />
                    )}
                </Animated.View>

                {/* Upload Speed */}
                <Animated.View
                    style={[
                        styles.statCard,
                        results.status === 'Probando Subida' && styles.statCardActive,
                        { transform: [{ scale: uploadPulse }] }
                    ]}
                >
                    <Text style={styles.statLabel}>Subida</Text>
                    <Text style={[
                        styles.statValue,
                        results.status === 'Probando Subida' && styles.statValueActive
                    ]}>
                        {results.upload}
                    </Text>
                    <Text style={styles.statUnit}>Mbps</Text>
                    {results.status === 'Probando Subida' && (
                        <ActivityIndicator
                            size={14}
                            color={Colors.primary}
                            style={styles.cardLoader}
                        />
                    )}
                </Animated.View>

                {/* Ping */}
                <Animated.View
                    style={[
                        styles.statCard,
                        { transform: [{ scale: pingPulse }] }
                    ]}
                >
                    <Text style={styles.statLabel}>Ping</Text>
                    <Text style={styles.statValue}>{results.ping}</Text>
                    <Text style={styles.statUnit}>ms</Text>
                </Animated.View>
            </View>

            {/* Provider */}
            <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Proveedor</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                    {results.isp}
                </Text>
            </View>

            {/* Network Name */}
            <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Red WiFi</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {results.networkName}
                </Text>
            </View>

            {/* Network Band */}
            <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Frecuencia</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {results.networkBand}
                </Text>
            </View>

            {/* Coordinates */}
            {results.coordinates && (
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Coordenadas</Text>
                    <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
                        Lat: {results.coordinates.latitude.toFixed(6)}, Lng: {results.coordinates.longitude.toFixed(6)}
                    </Text>
                </View>
            )}

            {/* Status */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Estado:</Text>
                <Text style={[styles.statusValue, { color: getStatusColor() }]}>
                    {results.status}
                </Text>
                {isTestRunning && (
                    <ActivityIndicator
                        color={Colors.primary}
                        style={styles.loader}
                    />
                )}
                {isFinished && (
                    <Text style={styles.successIcon}>✓</Text>
                )}
                {isError && (
                    <Text style={styles.errorIcon}>✕</Text>
                )}
            </View>

            {/* Start Test Button */}
            {!disabled && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        isTestRunning && styles.buttonDisabled,
                        isFinished && styles.buttonSuccess,
                    ]}
                    onPress={startTest}
                    disabled={isTestRunning}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>
                        {isTestRunning ? 'Prueba en Curso...' : isFinished ? 'Reiniciar Prueba' : 'Iniciar Prueba'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 110,
        justifyContent: 'center',
    },
    statCardActive: {
        borderColor: Colors.primary,
        borderWidth: 2,
        backgroundColor: Colors.surface,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    statValueActive: {
        color: Colors.primary,
    },
    statUnit: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    cardLoader: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    infoCard: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statusLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    loader: {
        marginLeft: 4,
    },
    successIcon: {
        fontSize: 18,
        color: Colors.success,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    errorIcon: {
        fontSize: 18,
        color: Colors.error,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: Colors.disabled,
        opacity: 0.7,
    },
    buttonSuccess: {
        backgroundColor: Colors.success,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorCard: {
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.error,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    errorText: {
        color: Colors.error,
        fontSize: 13,
        flex: 1,
        marginRight: 8,
    },
    errorDismiss: {
        padding: 4,
    },
    errorDismissText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
