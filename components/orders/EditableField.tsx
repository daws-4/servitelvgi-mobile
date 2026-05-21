import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface EditableFieldProps {
  label: string;
  value?: string;
  onChangeText: (text: string) => void;
  icon?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}

/**
 * Editable field component for recovery orders
 * Allows installers to modify order data
 */
export default function EditableField({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: EditableFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon && <FontAwesome name={icon as any} size={12} color="#64748b" style={styles.icon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value || ''}
        onChangeText={onChangeText}
        placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
  },
});
