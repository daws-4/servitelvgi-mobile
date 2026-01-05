import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import installerService from '@/services/api/installers';
import type { UpdateInstallerProfile } from '@/types/Installer';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    installerId: string;
    currentEmail?: string;
    currentPhone?: string;
    onSuccess?: () => void;
}

/**
 * Modal para editar datos personales (email y teléfono)
 */
export default function EditProfileModal({
    visible,
    onClose,
    installerId,
    currentEmail = '',
    currentPhone = '',
    onSuccess,
}: EditProfileModalProps) {
    const [email, setEmail] = useState(currentEmail);
    const [phone, setPhone] = useState(currentPhone);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form when props change
    useEffect(() => {
        setEmail(currentEmail);
        setPhone(currentPhone);
    }, [currentEmail, currentPhone, visible]);

    const handleClose = () => {
        setError(null);
        setEmail(currentEmail);
        setPhone(currentPhone);
        onClose();
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        // Allow formats like: +58 412 123 4567, 0412-123-4567, etc.
        const cleaned = phone.replace(/[\s\-()]/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    };

    const handleSubmit = async () => {
        setError(null);

        // Validation
        if (email && !validateEmail(email)) {
            setError('El formato del email no es válido');
            return;
        }

        if (phone && !validatePhone(phone)) {
            setError('El formato del teléfono no es válido');
            return;
        }

        // Check if anything changed
        if (email === currentEmail && phone === currentPhone) {
            handleClose();
            return;
        }

        setLoading(true);

        try {
            const updateData: UpdateInstallerProfile = {};
            if (email !== currentEmail) updateData.email = email;
            if (phone !== currentPhone) updateData.phone = phone;

            await installerService.updateProfile(installerId, updateData);

            Alert.alert(
                'Éxito',
                'Tus datos han sido actualizados',
                [{ text: 'OK', onPress: handleClose }]
            );
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar datos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <FontAwesome name="user" size={24} color={BrandColors.primary} />
                        </View>
                        <Text style={styles.title}>Datos Personales</Text>
                        <Text style={styles.subtitle}>
                            Actualiza tu información de contacto
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <FontAwesome name="exclamation-circle" size={16} color="#ef4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={16} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ejemplo@correo.com"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Teléfono</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="phone" size={16} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="+58 412 123 4567"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitText}>Guardar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        flex: 1,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputIcon: {
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
