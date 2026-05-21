import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { BrandColors } from '@/constants/colors';
import type { EquipmentRecovered } from '@/types/Order';

interface EquipmentRecoveryFormProps {
  orderId: string;
  initialData?: EquipmentRecovered;
  onDataChange?: (data: EquipmentRecovered) => void;
  readOnly?: boolean;
}

/**
 * Formulario para capturar datos de equipos ONT recuperados
 * IMPORTANTE: Solo registra datos, NO añade al inventario
 */
export default function EquipmentRecoveryForm({
  orderId,
  initialData,
  onDataChange,
  readOnly = false,
}: EquipmentRecoveryFormProps) {
  const [equipment, setEquipment] = useState<EquipmentRecovered>(
    initialData || {
      ontId: '',
      serialNumber: '',
      macAddress: '',
      model: '',
      condition: 'good',
      notes: '',
    }
  );

  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from props if data changes
  useEffect(() => {
    if (initialData) {
      setEquipment(initialData);
    }
  }, [initialData]);

  const updateField = <K extends keyof EquipmentRecovered>(
    field: K,
    value: EquipmentRecovered[K]
  ) => {
    if (readOnly) return;

    const newEquipment = {
      ...equipment,
      [field]: value,
    };

    setEquipment(newEquipment);
    setHasChanges(true);

    // Call parent handler immediately with updated data
    if (onDataChange) {
      onDataChange(newEquipment);
    }
  };

  const getConditionLabel = (condition: string): string => {
    switch (condition) {
      case 'good':
        return 'Bueno';
      case 'damaged':
        return 'Dañado';
      case 'defective':
        return 'Defectuoso';
      default:
        return 'Bueno';
    }
  };

  const getConditionColor = (condition: string): string => {
    switch (condition) {
      case 'good':
        return '#16a34a'; // green
      case 'damaged':
        return '#f59e0b'; // amber
      case 'defective':
        return '#dc2626'; // red
      default:
        return '#16a34a';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <FontAwesome name="archive" size={18} color="#3B82F6" />
        <Text style={styles.headerText}>Equipo Recuperado (ONT)</Text>
      </View>

      {/* ID de la ONT - Requerido para completar */}
      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>ID de la ONT</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TextInput
          style={[styles.input, readOnly && styles.inputReadOnly]}
          value={equipment.ontId}
          onChangeText={(text) => updateField('ontId', text)}
          placeholder="Ingrese el ID de la ONT"
          placeholderTextColor="#94a3b8"
          editable={!readOnly}
        />
      </View>

      {/* Número de Serie */}
      <View style={styles.field}>
        <Text style={styles.label}>Número de Serie</Text>
        <TextInput
          style={[styles.input, readOnly && styles.inputReadOnly]}
          value={equipment.serialNumber}
          onChangeText={(text) => updateField('serialNumber', text)}
          placeholder="Ej: SN123456789"
          placeholderTextColor="#94a3b8"
          editable={!readOnly}
        />
      </View>

      {/* Dirección MAC */}
      <View style={styles.field}>
        <Text style={styles.label}>Dirección MAC</Text>
        <TextInput
          style={[styles.input, readOnly && styles.inputReadOnly]}
          value={equipment.macAddress}
          onChangeText={(text) => updateField('macAddress', text)}
          placeholder="Ej: 00:1A:2B:3C:4D:5E"
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
          editable={!readOnly}
        />
      </View>

      {/* Modelo */}
      <View style={styles.field}>
        <Text style={styles.label}>Modelo</Text>
        <TextInput
          style={[styles.input, readOnly && styles.inputReadOnly]}
          value={equipment.model}
          onChangeText={(text) => updateField('model', text)}
          placeholder="Ej: HG8546M"
          placeholderTextColor="#94a3b8"
          editable={!readOnly}
        />
      </View>

      {/* Condición del Equipo */}
      <View style={styles.field}>
        <Text style={styles.label}>Condición del Equipo</Text>
        <View style={styles.conditionContainer}>
          {(['good', 'damaged', 'defective'] as const).map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.conditionButton,
                equipment.condition === condition && styles.conditionButtonActive,
                equipment.condition === condition && {
                  backgroundColor: getConditionColor(condition),
                  borderColor: getConditionColor(condition),
                },
                readOnly && styles.conditionButtonDisabled,
              ]}
              onPress={() => !readOnly && updateField('condition', condition)}
              disabled={readOnly}>
              <Text
                style={[
                  styles.conditionText,
                  equipment.condition === condition && styles.conditionTextActive,
                ]}>
                {getConditionLabel(condition)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notas */}
      <View style={styles.field}>
        <Text style={styles.label}>Notas Adicionales</Text>
        <TextInput
          style={[styles.input, styles.textArea, readOnly && styles.inputReadOnly]}
          value={equipment.notes}
          onChangeText={(text) => updateField('notes', text)}
          placeholder="Observaciones sobre el estado del equipo..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!readOnly}
        />
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <FontAwesome name="info-circle" size={14} color="#3B82F6" />
        <Text style={styles.infoText}>
          Esta información se guarda solo para registro. El equipo NO se añade al inventario
          automáticamente.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 8,
  },
  field: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  inputReadOnly: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  conditionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionButtonActive: {
    borderWidth: 2,
  },
  conditionButtonDisabled: {
    opacity: 0.6,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  conditionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
