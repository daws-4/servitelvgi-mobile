import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

export interface ProfileAvatarProps {
    /**
     * Avatar image URI
     */
    imageUri?: string;

    /**
     * Avatar size in pixels
     */
    size?: number;

    /**
     * Callback when camera button is pressed
     */
    onCameraPress?: () => void;
}

/**
 * Circular avatar with camera button overlay for profile picture
 * 
 * @example
 * ```tsx
 * <ProfileAvatar 
 *   imageUri="https://example.com/avatar.jpg"
 *   onCameraPress={() => console.log('Camera pressed')}
 * />
 * ```
 */
export default function ProfileAvatar({
    imageUri,
    size = 112,
    onCameraPress,
}: ProfileAvatarProps) {
    const defaultAvatar = 'https://i.pravatar.cc/150?u=servitel_installer';

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Avatar with white border */}
            <View style={[styles.avatarWrapper, { width: size, height: size }]}>
                <Image
                    source={{ uri: imageUri || defaultAvatar }}
                    style={[styles.avatar, { width: size - 8, height: size - 8 }]}
                />
            </View>

            {/* Camera Button */}
            {onCameraPress && (
                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={onCameraPress}
                    activeOpacity={0.7}
                >
                    <FontAwesome name="camera" size={12} color={BrandColors.secondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    avatarWrapper: {
        backgroundColor: 'white',
        padding: 4,
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    avatar: {
        borderRadius: 37,
        resizeMode: 'cover',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        backgroundColor: BrandColors.background,
        borderRadius: 18,
        borderWidth: 4,
        borderColor: BrandColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
});
