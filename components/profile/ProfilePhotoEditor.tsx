import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BrandColors } from '@/constants/colors';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';

interface ProfilePhotoEditorProps {
    visible: boolean;
    onClose: () => void;
    installerId: string;
    currentPhotoUrl?: string;
    onSuccess?: (newPhotoUrl: string) => void;
    onDelete?: () => void;
}

/**
 * Modal para editar foto de perfil con cámara o galería
 */
export default function ProfilePhotoEditor({
    visible,
    onClose,
    installerId,
    currentPhotoUrl,
    onSuccess,
    onDelete,
}: ProfilePhotoEditorProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    // Use the new dedicated hook for PocketBase uploads
    const { uploadPhoto, deletePhoto, uploading, deleting } = useProfilePhoto();

    const handleClose = () => {
        setSelectedImage(null);
        onClose();
    };

    /**
     * Solicitar permiso de cámara SOLAMENTE
     */
    const requestCameraPermission = async (): Promise<boolean> => {
        try {
            const cameraPerms = await ImagePicker.getCameraPermissionsAsync();

            if (cameraPerms.status === 'granted') {
                return true;
            }

            if (cameraPerms.canAskAgain) {
                const result = await ImagePicker.requestCameraPermissionsAsync();
                if (result.status === 'granted') {
                    return true;
                }
            }

            // Bloqueado o denegado
            Alert.alert(
                'Permiso de Cámara Requerido',
                cameraPerms.canAskAgain
                    ? 'Por favor, permite el acceso a la cámara para tomar fotos.'
                    : 'El permiso de cámara está bloqueado. Por favor, actívalo en:\nConfiguración → Aplicaciones → ENLARED → Permisos → Cámara',
                [{ text: 'Entendido' }]
            );
            return false;
        } catch (error) {
            console.error('❌ Error solicitando permiso de cámara:', error);
            return false;
        }
    };

    /**
     * Solicitar permiso de galería SOLAMENTE
     */
    const requestGalleryPermission = async (): Promise<boolean> => {
        try {
            const libraryPerms = await ImagePicker.getMediaLibraryPermissionsAsync();

            if (libraryPerms.status === 'granted') {
                return true;
            }

            if (libraryPerms.canAskAgain) {
                const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (result.status === 'granted') {
                    return true;
                }
            }

            // Bloqueado o denegado
            Alert.alert(
                'Permiso de Galería Requerido',
                libraryPerms.canAskAgain
                    ? 'Por favor, permite el acceso a la galería para seleccionar fotos.'
                    : 'El permiso de galería está bloqueado. Por favor, actívalo en:\nConfiguración → Aplicaciones → ENLARED → Permisos → Fotos y Videos',
                [{ text: 'Entendido' }]
            );
            return false;
        } catch (error) {
            console.error('❌ Error solicitando permiso de galería:', error);
            return false;
        }
    };

    const pickFromCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const pickFromGallery = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;

        setLoading(true);
        try {
            // Upload directly using URI (no need to create Blob manually, hook handles it)
            const result = await uploadPhoto(installerId, selectedImage);

            if (result.success && result.imageUrl) {
                Alert.alert(
                    'Éxito',
                    'Tu foto de perfil ha sido actualizada',
                    [{ text: 'OK', onPress: handleClose }]
                );
                onSuccess?.(result.imageUrl);
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'No se pudo subir la foto');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Foto',
            '¿Estás seguro de que deseas eliminar tu foto de perfil?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const result = await deletePhoto(installerId);
                            if (result.success) {
                                Alert.alert(
                                    'Eliminada',
                                    'Tu foto de perfil ha sido eliminada',
                                    [{ text: 'OK', onPress: handleClose }]
                                );
                                onDelete?.();
                            } else {
                                throw new Error(result.error);
                            }
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'No se pudo eliminar la foto');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const displayImage = selectedImage || currentPhotoUrl;
    const isLoading = loading || uploading;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Foto de Perfil</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <FontAwesome name="times" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Image Preview */}
                    <View style={styles.imageContainer}>
                        {displayImage ? (
                            <Image source={{ uri: displayImage }} style={styles.image} />
                        ) : (
                            <View style={styles.placeholder}>
                                <FontAwesome name="user" size={48} color="#9ca3af" />
                            </View>
                        )}
                        {selectedImage && (
                            <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>Nueva</Text>
                            </View>
                        )}
                    </View>

                    {/* Options */}
                    <View style={styles.options}>
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={pickFromCamera}
                            disabled={isLoading}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#dbeafe' }]}>
                                <FontAwesome name="camera" size={20} color="#3b82f6" />
                            </View>
                            <Text style={styles.optionText}>Tomar Foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={pickFromGallery}
                            disabled={isLoading}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#dcfce7' }]}>
                                <FontAwesome name="image" size={20} color="#22c55e" />
                            </View>
                            <Text style={styles.optionText}>Galería</Text>
                        </TouchableOpacity>

                        {currentPhotoUrl && !selectedImage && (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={handleDelete}
                                disabled={isLoading}
                            >
                                <View style={[styles.optionIcon, { backgroundColor: '#fee2e2' }]}>
                                    <FontAwesome name="trash" size={20} color="#ef4444" />
                                </View>
                                <Text style={[styles.optionText, { color: '#ef4444' }]}>Eliminar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Actions */}
                    {selectedImage && (
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setSelectedImage(null)}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelText}>Cambiar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                                onPress={handleUpload}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <FontAwesome name="check" size={16} color="#fff" />
                                        <Text style={styles.saveText}>Guardar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        padding: 4,
    },
    imageContainer: {
        alignSelf: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: BrandColors.primary,
    },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#e5e7eb',
    },
    newBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#22c55e',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 24,
    },
    optionButton: {
        alignItems: 'center',
        gap: 8,
    },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
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
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
