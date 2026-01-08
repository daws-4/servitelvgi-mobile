import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BrandColors } from '@/constants/colors';
import { useOrderEvidence } from '@/hooks/useOrderEvidence';

interface PhotoEvidenceManagerProps {
    orderId: string;
    installerId: string;
    crewId: string;
    existingPhotos?: string[]; // Array of recordIds
    onPhotosChange?: (photos: string[]) => void;
    readOnly?: boolean;
}

interface PhotoItem {
    recordId: string;
    url: string;
    isNew?: boolean;
}

/**
 * Component for managing order photo evidence
 * Supports camera/gallery upload and deletion
 */
export default function PhotoEvidenceManager({
    orderId,
    installerId,
    crewId,
    existingPhotos = [],
    onPhotosChange,
    readOnly = false,
}: PhotoEvidenceManagerProps) {
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const { uploadEvidence, deleteEvidence, getImageUrl, uploading, deleting, error } = useOrderEvidence();

    // Load existing photos
    useEffect(() => {
        loadExistingPhotos();
    }, [existingPhotos]);

    const loadExistingPhotos = async () => {
        if (!existingPhotos || existingPhotos.length === 0) {
            setPhotos([]);
            setLoadingPhotos(false);
            return;
        }

        try {
            setLoadingPhotos(true);
            const loadedPhotos: PhotoItem[] = await Promise.all(
                existingPhotos.map(async (photoId) => {
                    // photoId format: "recordId:filename" or just "recordId"
                    const recordId = photoId.includes(':') ? photoId.split(':')[0] : photoId;
                    const url = await getImageUrl(recordId, '200x200');
                    return { recordId, url };
                })
            );
            setPhotos(loadedPhotos.filter(p => p.url));
        } catch (err) {
            console.error('Error loading photos:', err);
        } finally {
            setLoadingPhotos(false);
        }
    };

    const requestPermissions = async (): Promise<boolean> => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
            Alert.alert(
                'Permisos Requeridos',
                'Necesitamos acceso a la cámara y galería para subir evidencias.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const showPickerOptions = () => {
        Alert.alert(
            'Agregar Evidencia',
            'Selecciona una opción',
            [
                { text: 'Cámara', onPress: pickFromCamera },
                { text: 'Galería', onPress: pickFromGallery },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const pickFromCamera = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadPhoto(result.assets[0].uri);
        }
    };

    const pickFromGallery = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadPhoto(result.assets[0].uri);
        }
    };

    const uploadPhoto = async (imageUri: string) => {
        const result = await uploadEvidence(orderId, installerId, crewId, imageUri);

        if (result.success && result.recordId && result.url) {
            const newPhoto: PhotoItem = {
                recordId: result.recordId,
                url: result.url,
                isNew: true,
            };
            const updatedPhotos = [...photos, newPhoto];
            setPhotos(updatedPhotos);
            onPhotosChange?.(updatedPhotos.map(p => p.recordId));
            Alert.alert('Éxito', 'Evidencia subida correctamente');
        } else {
            Alert.alert('Error', result.error || 'No se pudo subir la foto');
        }
    };

    const handleDelete = (photo: PhotoItem) => {
        Alert.alert(
            'Eliminar Evidencia',
            '¿Estás seguro de eliminar esta foto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteEvidence(photo.recordId, orderId);
                        if (result.success) {
                            const updatedPhotos = photos.filter(p => p.recordId !== photo.recordId);
                            setPhotos(updatedPhotos);
                            onPhotosChange?.(updatedPhotos.map(p => p.recordId));
                            Alert.alert('Eliminada', 'Evidencia eliminada correctamente');
                        } else {
                            Alert.alert('Error', result.error || 'No se pudo eliminar');
                        }
                    },
                },
            ]
        );
    };

    const isLoading = uploading || deleting || loadingPhotos;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Evidencias Fotográficas (Opcional)</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosContainer}
            >
                {/* Add Photo Button */}
                {!readOnly && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={showPickerOptions}
                        disabled={isLoading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#94a3b8" size="small" />
                        ) : (
                            <>
                                <FontAwesome name="camera" size={24} color="#94a3b8" />
                                <Text style={styles.addButtonText}>Agregar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Photo Grid */}
                {loadingPhotos ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={BrandColors.primary} />
                    </View>
                ) : (
                    photos.map((photo, index) => (
                        <View key={photo.recordId || index} style={styles.photoWrapper}>
                            <Image source={{ uri: photo.url }} style={styles.photo} />
                            {photo.isNew && (
                                <View style={styles.newBadge}>
                                    <Text style={styles.newBadgeText}>Nueva</Text>
                                </View>
                            )}
                            {!readOnly && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(photo)}
                                    disabled={deleting}
                                >
                                    <FontAwesome name="times" size={12} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}

                {/* Empty State */}
                {!loadingPhotos && photos.length === 0 && readOnly && (
                    <View style={styles.emptyState}>
                        <FontAwesome name="image" size={24} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Sin evidencias</Text>
                    </View>
                )}
            </ScrollView>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    photosContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
    },
    addButton: {
        width: 100,
        height: 100,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    addButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    photoWrapper: {
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
    },
    newBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: '#22c55e',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    deleteButton: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    loadingContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        width: 100,
        height: 100,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    emptyText: {
        fontSize: 11,
        color: '#94a3b8',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 8,
    },
});
