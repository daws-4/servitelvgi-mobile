import { FontAwesome } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

import { BrandColors, Colors } from '@/constants/colors';
import { useSignature } from '@/hooks/useSignature';

interface CustomerSignatureProps {
  orderId: string;
  signature?: string; // URL or Base64
  onSignatureChange: (signature: string | undefined) => void;
  readOnly?: boolean;
  // Callback when upload is complete. Now expects URL instead of base64 processing.
  onUploadSignature: (orderId: string, signatureUrl: string) => Promise<any>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CustomerSignature({
  orderId,
  signature,
  onSignatureChange,
  readOnly = false,
  onUploadSignature,
}: CustomerSignatureProps) {
  const signatureRef = useRef<SignatureViewRef>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tempSignature, setTempSignature] = useState<string | undefined>(undefined);
  const [processing, setProcessing] = useState(false);

  // Use the new dedicated hook
  const { uploadSignature, deleteSignature, uploading, deleting } = useSignature();

  const handleOpenSignature = () => {
    if (readOnly) return;
    setTempSignature(undefined);
    setShowModal(true);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setTempSignature(undefined);
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const handleOK = (signatureData: string) => {
    // signatureData is a base64 string like "data:image/png;base64,..."
    console.log('[CustomerSignature] Signature captured, length:', signatureData.length);
    setTempSignature(signatureData);
  };

  const handleRotate = async () => {
    if (!tempSignature) return;

    try {
      setProcessing(true);
      // Rotate 90 degrees clockwise
      const result = await ImageManipulator.manipulateAsync(tempSignature, [{ rotate: 90 }], {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
        base64: true,
      });

      if (result.base64) {
        setTempSignature(`data:image/png;base64,${result.base64}`);
      } else {
        setTempSignature(result.uri);
      }
    } catch (error) {
      console.error('Error rotating signature:', error);
      Alert.alert('Error', 'No se pudo rotar la imagen');
    } finally {
      setProcessing(false);
    }
  };

  const handleEmpty = () => {
    Alert.alert('Firma vacía', 'Por favor dibuje una firma antes de confirmar.');
  };

  const handleSave = async () => {
    if (!tempSignature) {
      Alert.alert('Error', 'No hay firma para guardar. Por favor confirme la firma primero.');
      return;
    }

    try {
      setSaving(true);
      setProcessing(true);

      // 1. Convert/Resize but KEEP as PNG to avoid black background issues
      console.log('[CustomerSignature] Preparing image (PNG)...');
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        tempSignature,
        [], // No transformations needed if no rotation requested here
        { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
      );

      console.log('[CustomerSignature] Uploading via hook...', manipulatedImage.uri);

      // 2. Direct Upload to PocketBase using the file URI via hook
      const result = await uploadSignature(orderId, manipulatedImage.uri);

      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'Error al subir la firma');
      }

      console.log('[CustomerSignature] Upload successful. URL:', result.imageUrl);

      // 3. Notify Parent/Backend with the URL
      await onUploadSignature(orderId, result.imageUrl);

      onSignatureChange(result.imageUrl);
      setShowModal(false);
      Alert.alert('Éxito', 'Firma guardada correctamente');
    } catch (error: any) {
      console.error('Error saving signature:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar la firma');
    } finally {
      setSaving(false);
      setProcessing(false);
    }
  };

  const handleRemoveSignature = () => {
    Alert.alert('Eliminar Firma', '¿Está seguro que desea eliminar la firma del cliente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessing(true);
            const result = await deleteSignature(orderId);
            if (result.success) {
              onSignatureChange(undefined);
              Alert.alert('Eliminado', 'La firma ha sido eliminada.');
            } else {
              throw new Error(result.error);
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo eliminar la firma');
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setTempSignature(undefined);
    setShowModal(false);
  };

  // Signature pad style - white background
  const signatureStyle = `
        .m-signature-pad {
            box-shadow: none;
            border: none;
            margin: 0;
            padding: 0;
        }
        .m-signature-pad--body {
            border: none;
            margin: 0;
            padding: 0;
        }
        .m-signature-pad--footer {
            display: none;
        }
        body, html {
            margin: 0;
            padding: 0;
            background-color: #fff;
        }
    `;

  // If we have a signature, show preview
  if (signature) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <FontAwesome name="pencil-square-o" size={18} color={BrandColors.primary} />
            <Text style={styles.title}>Firma del Cliente</Text>
          </View>
          {!readOnly && (
            <TouchableOpacity onPress={handleRemoveSignature} style={styles.removeButton}>
              <FontAwesome name="trash-o" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.signaturePreview}>
          <Image source={{ uri: signature }} style={styles.signatureImage} resizeMode="contain" />
          <View style={styles.signedBadge}>
            <FontAwesome name="check-circle" size={14} color="#22c55e" />
            <Text style={styles.signedText}>Firmado</Text>
          </View>
        </View>

        {!readOnly && (
          <TouchableOpacity style={styles.editButton} onPress={handleOpenSignature}>
            <FontAwesome name="edit" size={14} color={BrandColors.primary} />
            <Text style={styles.editButtonText}>Cambiar Firma</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // No signature yet - show button to add
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="pencil-square-o" size={18} color={BrandColors.primary} />
        <Text style={styles.title}>Firma del Cliente</Text>
      </View>

      <View style={styles.emptyContainer}>
        <FontAwesome name="pencil-square" size={48} color="#cbd5e1" />
        <Text style={styles.emptyText}>
          {readOnly ? 'Sin firma registrada' : 'No hay firma del cliente'}
        </Text>

        {!readOnly && (
          <TouchableOpacity style={styles.addButton} onPress={handleOpenSignature}>
            <FontAwesome name="plus" size={14} color="#fff" />
            <Text style={styles.addButtonText}>Agregar Firma</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Signature Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancel}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Firma del Cliente</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Solicite al cliente que firme en el área de abajo
          </Text>

          <View style={styles.signatureContainer}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleOK}
              onEmpty={handleEmpty}
              webStyle={signatureStyle}
              backgroundColor="#ffffff"
              penColor="#1e293b"
              minWidth={2}
              maxWidth={4}
              descriptionText=""
              clearText="Limpiar"
              confirmText="Confirmar"
            />
          </View>

          {tempSignature && (
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>Vista previa:</Text>
                <TouchableOpacity
                  style={styles.rotateButton}
                  onPress={handleRotate}
                  disabled={processing}>
                  {processing ? (
                    <ActivityIndicator size="small" color={BrandColors.primary} />
                  ) : (
                    <>
                      <FontAwesome name="rotate-right" size={14} color={BrandColors.primary} />
                      <Text style={styles.rotateButtonText}>Rotar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: tempSignature }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              disabled={processing}>
              <FontAwesome name="eraser" size={16} color="#64748b" />
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <FontAwesome name="check" size={16} color={BrandColors.primary} />
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!tempSignature || saving || processing) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!tempSignature || saving || processing}>
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FontAwesome name="save" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Subir y Guardar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  removeButton: {
    padding: 8,
  },
  signaturePreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  signatureImage: {
    width: '100%',
    height: 120,
    marginBottom: 12,
  },
  signedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  signedText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    color: BrandColors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
    minHeight: 200,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  confirmButtonText: {
    color: BrandColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
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
  // New styles for rotation
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  rotateButtonText: {
    color: BrandColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
