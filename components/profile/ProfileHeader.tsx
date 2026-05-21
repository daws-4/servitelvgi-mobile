import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ProfileAvatar from './ProfileAvatar';
import ProfileStatusBadge from './ProfileStatusBadge';

import { BrandColors } from '@/constants/colors';
import type { OnDutyStatus } from '@/types/auth';

export interface ProfileHeaderProps {
  /**
   * Full installer name
   */
  installerName: string;

  /**
   * Role or crew name
   */
  role: string;

  /**
   * Current status (from onDuty field)
   */
  status: OnDutyStatus;

  /**
   * Avatar image URI
   */
  avatarUri?: string;

  /**
   * Camera button callback
   */
  onCameraPress?: () => void;
}

/**
 * Profile header with gradient background, avatar, and status badge
 *
 * @example
 * ```tsx
 * <ProfileHeader
 *   installerName="Daniel Hernández"
 *   role="Técnico Nivel 3 • ENLARED"
 *   status="onduty"
 *   avatarUri="https://example.com/avatar.jpg"
 * />
 * ```
 */
export default function ProfileHeader({
  installerName,
  role,
  status,
  avatarUri,
  onCameraPress,
}: ProfileHeaderProps) {
  const getStatusText = () => {
    switch (status) {
      case 'onDuty':
        return 'En Servicio';
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Activo';
    }
  };

  return (
    <LinearGradient
      colors={[BrandColors.secondary, BrandColors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      {/* Abstract Decoration */}
      <View style={styles.decoration} />

      {/* Content */}
      <View style={styles.content}>
        {/* Avatar */}
        <ProfileAvatar imageUri={avatarUri} size={112} onCameraPress={onCameraPress} />

        {/* Name */}
        <Text style={styles.name}>{installerName}</Text>

        {/* Role */}
        <Text style={styles.role}>{role}</Text>

        {/* Status Badge */}
        <ProfileStatusBadge status={status} statusText={getStatusText()} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 32,
    borderBottomLeftRadius: 56,
    borderBottomRightRadius: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  decoration: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 80,
    // Blur effect would require additional library, using opacity instead
  },
  content: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  role: {
    color: 'rgba(219, 234, 254, 0.7)', // blue-100 with opacity
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
});
