import { httpClient } from './client';
import type { Crew, CrewSummary } from '@/types/Crew';
import type { Installer } from '@/types/Installer';

/**
 * Servicio de Cuadrillas
 * Consume los endpoints de /api/web/crews
 */
class CrewService {
  /**
   * GET /api/web/crews/:id
   * Obtener detalle de una cuadrilla
   */
  async getCrewById(crewId: string): Promise<Crew> {
    const response = await httpClient.get<Crew>(`/api/web/crews?id=${crewId}`);
    return response.data;
  }

  /**
   * GET /api/web/crews
   * Obtener todas las cuadrillas
   */
  async getAllCrews(): Promise<Crew[]> {
    const response = await httpClient.get<Crew[]>('/api/web/crews');
    return response.data;
  }

  /**
   * GET /api/web/crews?isActive=true
   * Obtener cuadrillas activas
   */
  async getActiveCrews(): Promise<Crew[]> {
    const response = await httpClient.get<Crew[]>('/api/web/crews', {
      params: { isActive: true }
    });
    return response.data;
  }

  /**
   * Obtener miembros de una cuadrilla (leader + members)
   */
  async getCrewMembers(crewId: string): Promise<Installer[]> {
    // Primero obtener la cuadrilla con detalles poblados
    const crew = await this.getCrewById(crewId);
    
    // Combinar leader y members
    const members: Installer[] = [];
    
    if (crew.leaderDetails) {
      members.push(crew.leaderDetails as unknown as Installer);
    }
    
    if (crew.memberDetails) {
      members.push(...(crew.memberDetails as unknown as Installer[]));
    }
    
    return members;
  }
}

// Crear instancia singleton
const crewService = new CrewService();

// Exportar servicio y métodos
export default crewService;

export const {
  getCrewById,
  getAllCrews,
  getActiveCrews,
  getCrewMembers,
} = crewService;
