import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Image, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Order } from './OrderCard';

interface OrderDetailProps {
    order: Order;
    onBack: () => void;
    onMap: () => void;
}

export default function OrderDetail({ order, onBack, onMap }: OrderDetailProps) {
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState('Completada Satisfactoriamente');
    const [cableUsed, setCableUsed] = useState('');
    const [observations, setObservations] = useState('');

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.topBarTitle}>Detalle de Orden</Text>
                    <Text style={styles.topBarSubtitle}>Abonado: {order.id}</Text>
                </View>
                <TouchableOpacity onPress={onMap} style={styles.mapBtn}>
                    <FontAwesome name="map" size={16} color={BrandColors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Client Info Card */}
                <LinearGradient
                    colors={[BrandColors.secondary, BrandColors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.clientCard}
                >
                    <View style={styles.clientHeader}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.avatarText}>DC</Text>
                        </View>
                        <View>
                            <Text style={styles.clientName}>{order.clientName}</Text>
                            <Text style={styles.clientPlan}>Plan FibraNet 500Mb</Text>
                        </View>
                    </View>

                    <View style={styles.clientDetails}>
                        <View>
                            <Text style={styles.detailLabel}>NODO</Text>
                            <Text style={styles.detailValue}>SCRVEG20112A</Text>
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>TELÉFONO</Text>
                            <Text style={styles.detailValue}>424-7617337</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Form */}
                <View style={styles.formContainer}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="list-alt" size={16} color={BrandColors.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Reporte de Instalación</Text>
                    </View>

                    {/* Status Select (Simulated) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estado de Ejecución</Text>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerText}>{status}</Text>
                            <FontAwesome name="chevron-down" size={12} color="#cbd5e1" />
                        </View>
                    </View>

                    {/* Material Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Cable UTP Utilizado (mts)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 45"
                            keyboardType="numeric"
                            value={cableUsed}
                            onChangeText={setCableUsed}
                        />
                    </View>

                    {/* Observations */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Observaciones Técnicas</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detalles de la falla o instalación..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={observations}
                            onChangeText={setObservations}
                        />
                    </View>

                    {/* Photos */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Evidencias Fotográficas</Text>
                        <View style={styles.photoGrid}>
                            <TouchableOpacity style={styles.addPhotoBtn}>
                                <FontAwesome name="camera" size={20} color="#94a3b8" />
                                <Text style={styles.addPhotoText}>AGREGAR</Text>
                            </TouchableOpacity>
                            {/* Placeholder for photos */}
                            <View style={styles.photoPlaceholder}>
                                <View style={styles.photoOverlay}>
                                    <FontAwesome name="times" size={10} color="white" />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity style={styles.submitBtn}>
                    <FontAwesome name="paper-plane" size={16} color="white" />
                    <Text style={styles.submitBtnText}>Finalizar Orden</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    mapBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e6f0fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto'
    },
    topBarTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f0f0f',
    },
    topBarSubtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    clientCard: {
        margin: 16,
        borderRadius: 32,
        padding: 24,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    clientAvatar: {
        width: 56,
        height: 56,
        backgroundColor: 'white',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: BrandColors.primary,
        fontSize: 20,
        fontWeight: '900',
    },
    clientName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clientPlan: {
        color: '#dbeafe',
        fontSize: 12,
        opacity: 0.8,
    },
    clientDetails: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 16,
        gap: 24,
    },
    detailLabel: {
        color: '#dbeafe',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        opacity: 0.6,
        marginBottom: 2,
    },
    detailValue: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    formContainer: {
        padding: 24,
        paddingTop: 0,
        gap: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f0f0f',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginLeft: 4,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc', // slate-50
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
        borderRadius: 16,
        padding: 16,
    },
    pickerText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0f0f0f',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
    },
    textArea: {
        height: 100,
    },
    photoGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    addPhotoBtn: {
        width: 100,
        height: 100,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginTop: 4,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#e2e8f0',
        borderRadius: 16,
        position: 'relative'
    },
    photoOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#ef4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    submitBtn: {
        backgroundColor: BrandColors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    submitBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
