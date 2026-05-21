import { httpClient } from './client';

import type { Installer, UpdateInstallerProfile } from '@/types/Installer';

/**
 * Servicio de Instaladores
 * Consume los endpoints de /api/web/installers
 */
class InstallerService {
  /**
   * GET /api/web/installers/:id
   * Obtener perfil de un instalador
   */
  /**
   * GET /api/web/installers/:id
   * Obtener perfil de un instalador
   */
  async getInstallerById(userId: string): Promise<Installer> {
    const response = await httpClient.get<Installer>(`/api/web/installers?id=${userId}`);
    return response.data;
  }

  /**
   * PUT /api/web/installers
   * Actualizar perfil del instalador actual
   * Nota: El backend espera el _id en el body, no en la URL
   */
  async updateProfile(userId: string, data: UpdateInstallerProfile): Promise<Installer> {
    const requestBody = {
      _id: userId,
      ...data,
    };

    // Debug logs (commented for future use)
    // const baseURL = httpClient.defaults.baseURL || 'NO_BASE_URL';
    // console.log('📤 [updateProfile] Base URL:', baseURL);
    // console.log('📤 [updateProfile] Full URL:', `${baseURL}/api/web/installers`);
    // console.log('📤 [updateProfile] Body:', requestBody);
    // console.log('📤 [updateProfile] Headers:', httpClient.defaults.headers.common);

    try {
      const response = await httpClient.put<Installer>('/api/web/installers', requestBody);

      // Check if response is HTML (server error)
      const responseData = response.data as any;
      if (typeof responseData === 'string' && responseData.includes('<!DOCTYPE')) {
        // console.error('❌ [updateProfile] Server returned HTML instead of JSON - endpoint may not exist');
        throw new Error('El servidor no respondió correctamente. Verifica que el endpoint exista.');
      }

      // console.log('📥 [updateProfile] Response:', response.data);
      return response.data;
    } catch (error: any) {
      // console.error('❌ [updateProfile] Error:', error.message, error.response?.data);
      throw error;
    }
  }

  /**
   * POST /api/web/installers/push-token
   * Registrar token de notificaciones push
   */
  async registerPushToken(pushToken: string): Promise<void> {
    await httpClient.post('/api/web/installers/push-token', {
      pushToken,
    });
  }

  /**
   * PUT /api/web/installers
   * Actualizar estado en servicio (onDuty)
   */
  async updateOnDutyStatus(
    userId: string,
    onDuty: import('@/types/Installer').OnDutyStatus
  ): Promise<Installer> {
    return this.updateProfile(userId, { onDuty });
  }
}

// Crear instancia singleton
const installerService = new InstallerService();

// Exportar servicio y métodos
export default installerService;

export const { getInstallerById, updateProfile, registerPushToken, updateOnDutyStatus } =
  installerService;

/**
 * Cambiar contraseña del instalador
 * Verifica la contraseña actual antes de actualizar
 */
export async function changePassword(
  userId: string,
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // Import auth service dynamically to avoid circular dependency
  const authService = (await import('./auth')).default;

  // Verify current password
  const isValid = await authService.verifyPassword(username, currentPassword);

  if (!isValid) {
    return { success: false, error: 'La contraseña actual es incorrecta' };
  }

  // Validate new password
  if (newPassword.length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
  }

  // Update password via profile update
  await installerService.updateProfile(userId, { password: newPassword });

  return { success: true };
}
