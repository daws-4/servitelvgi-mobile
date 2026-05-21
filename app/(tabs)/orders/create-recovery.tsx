import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/app/contexts/AuthContext';
import EditableField from '@/components/orders/EditableField';
import EquipmentRecoveryForm from '@/components/orders/EquipmentRecoveryForm';
import { BrandColors } from '@/constants/colors';
import orderService from '@/services/api/orders';
import type { EquipmentRecovered } from '@/types/Order';

export default function CreateRecoveryOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { installer } = useAuth();
  const [creating, setCreating] = useState(false);

  // Form state
  const [subscriberNumber, setSubscriberNumber] = useState('');
  const [subscriberName, setSubscriberName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [node, setNode] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [equipmentRecovered, setEquipmentRecovered] = useState<EquipmentRecovered>({
    ontId: '',
    serialNumber: '',
    macAddress: '',
    model: '',
    condition: 'good',
    notes: '',
  });

  const handleBack = () => {
    router.back();
  };

  const validateForm = (): boolean => {
    if (!subscriberNumber.trim()) {
      Alert.alert('Error', 'El número de abonado es obligatorio');
      return false;
    }
    if (!subscriberName.trim()) {
      Alert.alert('Error', 'El nombre del abonado es obligatorio');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return false;
    }
    // Equipment fields are now optional - no validation needed
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setCreating(true);

      const orderData = {
        subscriberNumber: subscriberNumber.trim(),
        subscriberName: subscriberName.trim(),
        address: address.trim(),
        phones: phone.trim() ? [phone.trim()] : [],
        email: email.trim() || undefined,
        node: node.trim() || undefined,
        ticket_id: ticketId.trim() || undefined,
        type: 'recuperacion' as const,
        status: 'assigned' as const,
        assignedTo: installer?.crew?._id,
        equipmentRecovered,
      };

      await orderService.createOrder(orderData);

      // Reset form after successful creation
      resetForm();

      Alert.alert('Éxito', 'Orden de recuperación creada correctamente', [
        {
          text: 'Crear otra',
          style: 'cancel',
        },
        {
          text: 'Ver órdenes',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating recovery order:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la orden');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSubscriberNumber('');
    setSubscriberName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setNode('');
    setTicketId('');
    setEquipmentRecovered({
      ontId: '',
      serialNumber: '',
      macAddress: '',
      model: '',
      condition: 'good',
      notes: '',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Nueva Orden de Recuperación</Text>
          <Text style={styles.headerSubtitle}>Registro de equipo ONT</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <FontAwesome name="info-circle" size={16} color="#3B82F6" />
          <Text style={styles.infoBannerText}>
            Esta orden es para registrar equipos ONT recuperados. No afecta el inventario.
          </Text>
        </View>

        {/* Subscriber Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="user" size={14} color={BrandColors.primary} />
            <Text style={styles.sectionTitle}>Datos del Abonado</Text>
          </View>

          <EditableField
            label="Número de Abonado *"
            value={subscriberNumber}
            onChangeText={setSubscriberNumber}
            icon="id-card"
            placeholder="Ej: 12345"
            keyboardType="numeric"
          />
          <EditableField
            label="Nombre Completo *"
            value={subscriberName}
            onChangeText={setSubscriberName}
            icon="user"
            placeholder="Ej: Juan Pérez"
          />
          <EditableField
            label="Dirección *"
            value={address}
            onChangeText={setAddress}
            icon="map-marker"
            placeholder="Ej: Calle 123, Casa 45"
            multiline
          />
          <EditableField
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            icon="phone"
            placeholder="Ej: 0424-1234567"
            keyboardType="phone-pad"
          />
          <EditableField
            label="Email"
            value={email}
            onChangeText={setEmail}
            icon="envelope"
            placeholder="Ej: correo@ejemplo.com"
            keyboardType="email-address"
          />
        </View>

        {/* Technical Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="cogs" size={14} color={BrandColors.primary} />
            <Text style={styles.sectionTitle}>Datos Técnicos</Text>
          </View>

          <EditableField
            label="Número de Ticket"
            value={ticketId}
            onChangeText={setTicketId}
            icon="ticket"
            placeholder="Ej: TKT-2024-001"
          />
          <EditableField
            label="Nodo"
            value={node}
            onChangeText={setNode}
            icon="sitemap"
            placeholder="Ej: SCRVEG20112A-GPON"
          />
        </View>

        {/* Equipment Recovery Form */}
        <EquipmentRecoveryForm
          orderId="new"
          initialData={equipmentRecovered}
          onDataChange={setEquipmentRecovered}
          readOnly={false}
        />

        {/* Create Button */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={creating}>
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FontAwesome name="plus-circle" size={18} color="#fff" />
                <Text style={styles.createButtonText}>Crear Orden de Recuperación</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
