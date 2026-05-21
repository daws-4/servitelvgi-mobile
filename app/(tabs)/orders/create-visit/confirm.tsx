import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import crewService from '@/services/api/crews';
import orderService from '@/services/api/orders';
import type { Order, OrderStatus } from '@/types/Order';

export default function ConfirmVisitOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const originId = params.originId as string;
  const { installer } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originOrder, setOriginOrder] = useState<Order | null>(null);
  const [crewName, setCrewName] = useState<string>('');
  const [logEntry, setLogEntry] = useState('');

  // Fetch source order and crew details
  useEffect(() => {
    if (!originId) {
      Alert.alert('Error', 'No se especificó la orden de origen');
      router.back();
      return;
    }

    const loadData = async () => {
      try {
        // Parallel fetch
        const [orderData, crewData] = await Promise.all([
          orderService.getOrderById(originId),
          installer?.crew?._id
            ? crewService.getCrewById(installer.crew._id)
            : Promise.resolve(null),
        ]);

        setOriginOrder(orderData);
        if (crewData) {
          setCrewName(`Cuadrilla ${crewData.number}`);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos necesarios');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [originId, installer?.crew?._id]);

  const handleCreateVisit = async () => {
    if (!logEntry.trim()) {
      Alert.alert('Requerido', 'Debes ingresar una nota en la bitácora para crear la visita');
      return;
    }

    if (!originOrder) return;

    try {
      setSubmitting(true);

      // Construct new order payload
      // Clone relevant data, set status to 'visita', append -V to ticket
      // We append a timestamp to ensure uniqueness if multiple visits are created for the same source
      const suffix = Math.floor(Math.random() * 1000);
      // const newTicketId = originOrder.ticket_id ? `${originOrder.ticket_id}-V${suffix}` : `VISIT-${Date.now()}`;
      const newTicketId = originOrder.ticket_id
        ? `${originOrder.ticket_id}-V`
        : `VISIT-${Date.now()}`;
      // Prepare the payload based on Order interface
      // We strip fields that shouldn't be cloned (like id, completed info, materials)
      const visitOrderData: Partial<Order> = {
        // Clone subscriber info
        subscriberName: originOrder.subscriberName,
        subscriberNumber: originOrder.subscriberNumber,
        address: originOrder.address,
        phones: originOrder.phones,
        email: originOrder.email,

        // Clone technical info
        node: originOrder.node,
        coordinates: originOrder.coordinates,

        // Set Visit specific data
        ticket_id: newTicketId,
        type: originOrder.type, // Preserve original type (averia/instalacion)
        status: 'visita' as OrderStatus, // FORCE status to visita
        visitCount: 1, // Start fresh for this new order document

        // Assignment
        assignedTo: installer?.crew?._id, // Assign to current crew
        assignmentDate: new Date().toISOString(),

        // Initial Log
        installerLog: [
          {
            timestamp: new Date().toISOString(),
            log: logEntry,
            status: 'visita' as OrderStatus,
          },
        ],

        // Clear execution data
        materialsUsed: [],
        photoEvidence: [],
        internetTest: undefined,
        customerSignature: undefined,
      };

      // Remove createdAt/updatedAt as they are handled by backend
      // Visit order is new, so we shouldn't send these from old order

      console.log('DEBUG: Creating visit order payload:', JSON.stringify(visitOrderData, null, 2));

      await orderService.createOrder(visitOrderData);

      // Toast.show({
      //     type: 'success',
      //     text1: 'Orden de Visita Creada',
      //     text2: `Ticket: ${newTicketId}`
      // });

      // Toast.show({
      //     type: 'success',
      //     text1: 'Orden de Visita Creada',
      //     text2: `Ticket: ${newTicketId}`
      // });

      // Navigate back to orders list
      router.replace('/(tabs)/orders/'); // Use absolute path to Tab root
    } catch (error: any) {
      console.error('Failed to create visit order:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la orden de visita');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!originOrder) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={[styles.container, { backgroundColor: '#f8fafc' }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Visita</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen de la Orden</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{originOrder.subscriberName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{originOrder.address}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tipo Original:</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{originOrder.type.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Nuevo Ticket ID:</Text>
            <Text style={styles.ticketValue}>
              {originOrder.ticket_id ? `${originOrder.ticket_id}-V` : 'Generado al crear'}
            </Text>
          </View>
        </View>

        {/* Log Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Bitácora Inicial <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helperText}>Describe la razón de esta visita técnica.</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Escribe aquí el motivo de la visita..."
            multiline
            numberOfLines={4}
            value={logEntry}
            onChangeText={setLogEntry}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={[styles.createButton, (!logEntry.trim() || submitting) && styles.disabledButton]}
          onPress={handleCreateVisit}
          disabled={!logEntry.trim() || submitting}>
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Crear Orden de Visita</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  ticketValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  required: {
    color: '#ef4444',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    height: 120,
    fontSize: 14,
    color: '#1e293b',
  },
  footer: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  createButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
