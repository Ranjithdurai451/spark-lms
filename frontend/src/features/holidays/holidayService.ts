import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: "PUBLIC" | "COMPANY";
  recurring: boolean;
  description?: string | null;
  organizationId: string;
  createdAt: string;
}

export interface HolidayStats {
  total: number;
  public: number;
  company: number;
}

export interface HolidayPayload {
  name: string;
  date: string;
  type: "PUBLIC" | "COMPANY";
  recurring: boolean;
  description?: string;
  organizationId: string;
}

export interface HolidayPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "PUBLIC" | "COMPANY" | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  getAll?: boolean;
}

export interface PaginatedHolidayResponse {
  message: string;
  data: {
    holidays: Holiday[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

class HolidayService {
  static async getHolidays(
    orgId: string,
    params: HolidayPaginationParams
  ): Promise<PaginatedHolidayResponse> {
    const { data } = await api.get(`/holidays`, {
      params: { organizationId: orgId, ...params },
    });
    return data;
  }

  static async getHolidayStats(
    orgId: string
  ): Promise<ApiResponse<HolidayStats>> {
    const { data } = await api.get(`/holidays/stats`, {
      params: { organizationId: orgId },
    });
    return data;
  }

  static async addHoliday(
    payload: HolidayPayload
  ): Promise<ApiResponse<Holiday>> {
    const { data } = await api.post(`/holidays`, payload);
    return data;
  }

  static async updateHoliday(payload: {
    id: string;
    data: Partial<HolidayPayload>;
  }) {
    const { id, data } = payload;
    const { data: res } = await api.put(`/holidays/${id}`, data);
    return res;
  }

  static async deleteHoliday(id: string): Promise<ApiResponse> {
    const { data } = await api.delete(`/holidays/${id}`);
    return data;
  }
}

export default HolidayService;
