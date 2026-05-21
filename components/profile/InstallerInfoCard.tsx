import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BrandColors } from '@/constants/colors';

interface InstallerInfoCardProps {
  /**
   * Número de la cuadrilla
   */
  crewNumber?: number;

  /**
   * ID de la cuadrilla (fallback si no hay número)
   */
  crewId?: string;

  /**
   * Email del instalador
   */
  email?: string;

  /**
   * Teléfono del instalador
   */
  phone?: string;

  /**
   * Username del instalador
   */
  username?: string;
}

/**
 * Tarjeta que muestra información del instalador y su cuadrilla
 */
export default function InstallerInfoCard({
  crewNumber,
  crewId,
  email,
  phone,
  username,
}: InstallerInfoCardProps) {
  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <FontAwesome name={icon as any} size={14} color={BrandColors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <FontAwesome name="id-card" size={16} color={BrandColors.primary} />
        <Text style={styles.headerTitle}>Información del Técnico</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {(crewNumber || crewId) && (
          <View style={styles.crewBadge}>
            <FontAwesome name="users" size={14} color="#fff" />
            <Text style={styles.crewText}>
              {crewNumber ? `Cuadrilla ${crewNumber}` : `ID: ${crewId?.slice(-4)}`}
            </Text>
          </View>
        )}

        <InfoRow icon="user" label="Usuario" value={username} />
        <InfoRow icon="envelope" label="Correo" value={email} />
        <InfoRow icon="phone" label="Teléfono" value={phone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    gap: 12,
  },
  crewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 8,
  },
  crewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
});
