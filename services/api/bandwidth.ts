import { httpClient } from './client';

export interface DataUsageRecord {
  _id?: string;
  Installer_id: string;
  MobileData: string; // Stored as string in DB for precision/large numbers
  WifiData: string;
  createdAt: string;
  updatedAt: string;
}

export const bandwidthApi = {
  /**
   * Get data usage history for an installer
   */
  getDataUsage: async (
    installerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DataUsageRecord[]> => {
    const params: any = { installerId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await httpClient.get('/api/web/data-usage', { params });
    return response.data;
  },

  /**
   * Create a new data usage entry
   */
  createDataUsage: async (
    installerId: string,
    wifiBytes: number,
    mobileBytes: number
  ): Promise<DataUsageRecord> => {
    const response = await httpClient.post('/api/web/data-usage', {
      Installer_id: installerId,
      WifiData: wifiBytes.toString(),
      MobileData: mobileBytes.toString(),
    });
    return response.data;
  },

  /**
   * Update an existing data usage entry
   * WARNING: Relies on PUT endpoint existing.
   */
  updateDataUsage: async (
    id: string,
    installerId: string,
    wifiBytes: number,
    mobileBytes: number
  ): Promise<DataUsageRecord> => {
    // Updated to use query params as requested by backend structure
    const response = await httpClient.put(`/api/web/data-usage?id=${id}`, {
      Installer_id: installerId,
      WifiData: wifiBytes.toString(),
      MobileData: mobileBytes.toString(),
    });
    return response.data;
  },
};
