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
  async getInstallerById(installerId: string): Promise<Installer> {
    const response = await httpClient.get<Installer>(
      `/api/web/installers/${installerId}`
    );
    return response.data;
  }

  /**
   * PUT /api/web/installers/:id
   * Actualizar perfil del instalador actual
   */
  async updateProfile(
    installerId: string,
    data: UpdateInstallerProfile
  ): Promise<Installer> {
    const response = await httpClient.put<Installer>(
      `/api/web/installers/${installerId}`,
      data
    );
    return response.data;
  }

  /**
   * POST /api/web/installers/register-token
   * Registrar token de notificaciones push
   */
  async registerPushToken(pushToken: string): Promise<void> {
    await httpClient.post('/api/web/installers/register-token', {
      pushToken,
    });
  }

  /**
   * PUT /api/web/installers/:id
   * Actualizar estado en servicio (onDuty)
   */
  async updateOnDutyStatus(
    installerId: string,
    onDuty: boolean
  ): Promise<Installer> {
    return this.updateProfile(installerId, { onDuty });
  }
}

// Crear instancia singleton
const installerService = new InstallerService();

// Exportar servicio y métodos
export default installerService;

export const {
  getInstallerById,
  updateProfile,
  registerPushToken,
  updateOnDutyStatus,
} = installerService;
