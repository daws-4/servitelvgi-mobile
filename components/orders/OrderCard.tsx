import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { BrandColors } from '@/constants/colors';
import { useOrderConfig } from '@/context/OrderConfigContext';
import type { Order, OrderType } from '@/types/Order';

// Type label mapping
const TYPE_LABELS: Record<OrderType, string> = {
  instalacion: 'Instalación',
  averia: 'Avería',
  recuperacion: 'Recuperación',
  otro: 'Otro',
};

// Accent colors by type
const TYPE_COLORS: Record<OrderType, string> = {
  instalacion: '#4ade80', // green
  averia: '#f87171', // red
  recuperacion: '#3B82F6', // blue
  otro: '#fbbf24', // yellow
};

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

/**
 * Order card component for listing orders
 * Now accepts real Order type from API
 */
export default function OrderCard({ order, onPress }: OrderCardProps) {
  const { getStatusConfig } = useOrderConfig();
  const statusConfig = getStatusConfig(order.status);
  const accentColor = TYPE_COLORS[order.type] || TYPE_COLORS.otro;
  const typeLabel = TYPE_LABELS[order.type] || 'Orden';

  // Calculate time ago from assignmentDate
  const getAssignmentTimeAgo = (): string => {
    if (!order.assignmentDate) return 'Sin asignar';

    const date = new Date(order.assignmentDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Recién asignada';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      const mins = diffMins % 60;
      return `${diffHours}h ${mins}m`;
    } else {
      return `${diffMins} min`;
    }
  };

  // Calculate if assignment is older than 24h
  const isAssignmentDelayed = (): boolean => {
    if (!order.assignmentDate) return false;
    const date = new Date(order.assignmentDate);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  // Calculate time ago from receptionDate or createdAt
  const getTimeAgo = (): string => {
    const dateStr = order.receptionDate || order.createdAt;
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Reciente';
    }
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Status Strip */}
      <View style={[styles.strip, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: statusConfig.hexBgColor }]}>
            <Text style={[styles.badgeText, { color: statusConfig.hexColor }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.orderId}>#{order.ticket_id}</Text>
        </View>

        {/* Type Tag */}
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { borderColor: accentColor }]}>
            <Text style={[styles.typeText, { color: accentColor }]}>{typeLabel}</Text>
          </View>
        </View>

        {/* Body */}
        <Text style={styles.clientName} numberOfLines={1}>
          {order.subscriberName}
        </Text>

        <View style={styles.addressContainer}>
          <FontAwesome
            name="map-marker"
            size={12}
            color={BrandColors.primary}
            style={styles.icon}
          />
          <Text style={styles.addressText} numberOfLines={1}>
            {order.address}
          </Text>
        </View>

        {!statusConfig.isTerminal && order.assignmentDate && (
          <View style={styles.addressContainer}>
            <FontAwesome
              name="clock-o"
              size={12}
              color={isAssignmentDelayed() ? '#ef4444' : BrandColors.primary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.addressText,
                isAssignmentDelayed() && { color: '#ef4444', fontWeight: '600' },
              ]}
              numberOfLines={1}>
              Asignada hace: {getAssignmentTimeAgo()}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.timeText}>{getTimeAgo()}</Text>
          <View style={styles.actionBtn}>
            <FontAwesome name="chevron-right" size={10} color="#64748b" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  strip: {
    width: 5,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  typeRow: {
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f0f0f',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  actionBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
});
