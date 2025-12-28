import { Redirect } from 'expo-router';
import React from 'react';

/**
 * Root index - Redirects to tabs (main app)
 * Auth protection is handled in _layout.tsx
 */
export default function Index() {
    return <Redirect href="/(tabs)/orders" />;
}
