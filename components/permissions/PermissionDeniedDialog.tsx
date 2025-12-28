import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import { BrandColors, StatusColors } from '@/constants/colors';
import { Button } from '@/components/ui';

export type PermissionType = 'location' | 'camera' | 'notifications';

export interface PermissionDeniedDialogProps {
    /**
     * Si el diálogo está visible
     */
    visible: boolean;

    /**
     * Tipo de permiso
     */
    permissionType: PermissionType;

    /**
     * Callback para abrir configuraciones
     */
    onOpenSettings: () => void;

    /**
     * Callback para cerrar el diálogo
     */
    onDismiss: () => void;
}

/**
 * Mensajes explicativos por tipo de permiso
 */
const PERMISSION_MESSAGES: Record<PermissionType, { title: string; message: string; icon: keyof typeof Ionicons.glyphMap }> = {
    location: {
        title: 'Permiso de Ubicación',
        message: 'Servitel necesita acceso a tu ubicación para mostrar tu posición en el mapa y optimizar las rutas de instalación. Esto nos ayuda a asignar las órdenes más cercanas a ti.',
        icon: 'location',
    },
    camera: {
        title: 'Permiso de Cámara',
        message: 'Se necesita acceso a la cámara para tomar fotos de las instalaciones y documentar el trabajo realizado. Esto es importante para el registro de evidencia.',
        icon: 'camera',
    },
    notifications: {
        title: 'Permiso de Notificaciones',
        message: 'Las notificaciones te permiten recibir actualizaciones sobre nuevas órdenes de trabajo asignadas y cambios importantes en tiempo real.',
        icon: 'notifications',
    },
};

/**
 * Diálogo que explica por qué se necesita un permiso y cómo habilitarlo
 * 
 * @example
 * ```tsx
 * import { PermissionDeniedDialog } from '@/components/permissions/PermissionDeniedDialog';
 * import { useLocationPermission } from '@/hooks/useLocationPermission';
 * 
 * function MapScreen() {
 *   const { permissionDenied, openSettings } = useLocationPermission();
 *   const [showDialog, setShowDialog] = useState(false);
 * 
 *   useEffect(() => {
 *     setShowDialog(permissionDenied);
 *   }, [permissionDenied]);
 * 
 *   return (
 *     <PermissionDeniedDialog
 *       visible={showDialog}
 *       permissionType="location"
 *       onOpenSettings={openSettings}
 *       onDismiss={() => setShowDialog(false)}
 *     />
 *   );
 * }
 * ```
 */
export function PermissionDeniedDialog({
    visible,
    permissionType,
    onOpenSettings,
    onDismiss,
}: PermissionDeniedDialogProps) {
    const { secondary, text, border } = useThemeColors();
    const config = PERMISSION_MESSAGES[permissionType];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <Pressable style={styles.overlay} onPress={onDismiss}>
                <Pressable style={[styles.dialog, { backgroundColor: secondary, borderColor: border }]} onPress={(e) => e.stopPropagation()}>
                    {/* Icono */}
                    <View style={[styles.iconContainer, { backgroundColor: `${StatusColors.warning}20` }]}>
                        <Ionicons name={config.icon} size={48} color={StatusColors.warning} />
                    </View>

                    {/* Título */}
                    <Text style={[styles.title, { color: text }]}>{config.title}</Text>

                    {/* Mensaje */}
                    <Text style={styles.message}>{config.message}</Text>

                    {/* Instrucciones */}
                    <View style={[styles.instructionBox, { backgroundColor: `${BrandColors.primary}10`, borderColor: BrandColors.primary }]}>
                        <Ionicons name="information-circle" size={20} color={BrandColors.primary} />
                        <Text style={[styles.instructionText, { color: BrandColors.primary }]}>
                            Para habilitar este permiso, ve a Configuraciones de la app
                        </Text>
                    </View>

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                        <View style={styles.button}>
                            <Button variant="secondary" onPress={onDismiss}>
                                Ahora no
                            </Button>
                        </View>
                        <View style={styles.button}>
                            <Button variant="primary" icon="settings" onPress={onOpenSettings}>
                                Abrir Configuraciones
                            </Button>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    instructionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 24,
        gap: 8,
    },
    instructionText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
