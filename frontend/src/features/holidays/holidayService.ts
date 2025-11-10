// src/features/holidays/holidayService.ts
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

export interface HolidayPayload {
  name: string;
  date: string;
  type: "PUBLIC" | "COMPANY";
  recurring: boolean;
  description?: string;
  organizationId: string;
}

class HolidayService {
  static async getHolidays(): Promise<ApiResponse<Holiday[]>> {
    const { data } = await api.get(`/holidays`);
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
