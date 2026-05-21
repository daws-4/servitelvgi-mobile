import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

import { BrandColors } from '@/constants/colors';

interface ReadOnlyFieldProps {
  label: string;
  value?: string | null;
  icon?: string;
  placeholder?: string;
  selectable?: boolean;
  onAction?: () => void;
  actionIcon?: string;
  selectionKey?: number | string;
  valueStyle?: any;
  iconColor?: string;
}

/**
 * Read-only field component for displaying order data
 */
export default function ReadOnlyField({
  label,
  value,
  icon,
  placeholder = 'No disponible',
  selectable = true,
  onAction,
  actionIcon,
  selectionKey,
  valueStyle,
  iconColor,
}: ReadOnlyFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        {icon && (
          <FontAwesome
            name={icon as any}
            size={14}
            color={iconColor || BrandColors.primary}
            style={styles.icon}
          />
        )}
        {/* 
                    Using unique key forces remount when selectionKey changes, 
                    effectively clearing the native text selection.
                */}
        <Text
          key={selectionKey}
          style={[styles.value, !value && styles.placeholder, valueStyle]}
          selectable={selectable}>
          {value || placeholder}
        </Text>

        {/* Action Button (e.g., Call) */}
        {onAction && value && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <FontAwesome
              name={(actionIcon as any) || 'external-link'}
              size={16}
              color={BrandColors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    marginRight: 10,
  },
  value: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  placeholder: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
});
