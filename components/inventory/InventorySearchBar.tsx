import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

interface InventorySearchBarProps {
    onSearch?: (text: string) => void;
}

export default function InventorySearchBar({ onSearch }: InventorySearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleTextChange = (text: string) => {
        setSearchText(text);
        onSearch?.(text);
    };

    return (
        <View style={styles.container}>
            <FontAwesome
                name="search"
                size={14}
                color={isFocused ? BrandColors.primary : '#cbd5e1'}
                style={styles.icon}
            />
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                ]}
                placeholder="Buscar por nombre, código, serial o MAC..."
                placeholderTextColor="#94a3b8"
                value={searchText}
                onChangeText={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
    },
    icon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
        borderRadius: 16,
        paddingVertical: 14,
        paddingLeft: 44,
        paddingRight: 16,
        fontSize: 14,
        color: '#0f0f0f',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputFocused: {
        borderColor: BrandColors.primary,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
});
