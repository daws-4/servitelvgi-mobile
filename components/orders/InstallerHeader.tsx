import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InstallerHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            {/* User Info */}
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.roleText}>Técnico Instalador</Text>
                    <Text style={styles.nameText}>Daniel Hernández</Text>
                </View>
                <View style={styles.avatarContainer}>
                    <FontAwesome name="user-md" size={20} color="white" />
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={14} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar abonado o dirección..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: BrandColors.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingHorizontal: 24,
        paddingBottom: 32,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    roleText: {
        color: '#dbeafe', // blue-100
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    nameText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    searchContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 10,
        paddingLeft: 44,
        paddingRight: 16,
        fontSize: 14,
        color: 'white',
    },
});
