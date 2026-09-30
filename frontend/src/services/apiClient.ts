import { getAuthToken } from '../utils/token';
import type { ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = {
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const text = await response.text();

      let data: any = {};
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            success: false,
            message: text || `HTTP ${response.status} ${response.statusText}`
          };
        }
      } else {
        data = {
          success: response.ok,
          message: response.ok ? 'Success' : `HTTP ${response.status} ${response.statusText}`
        };
      }

      if (!response.ok) {
        throw new Error(data.message || `API Request failed with status ${response.status}`);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`[API Client Error] ${endpoint}:`, error);
      throw error;
    }
  },

  async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });
      const text = await response.text();

      let data: any = {};
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            success: false,
            message: text || `HTTP ${response.status} ${response.statusText}`
          };
        }
      } else {
        data = {
          success: response.ok,
          message: response.ok ? 'Success' : `HTTP ${response.status} ${response.statusText}`
        };
      }

      if (!response.ok) {
        throw new Error(data.message || `File upload failed with status ${response.status}`);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`[API Client Upload Error] ${endpoint}:`, error);
      throw error;
    }
  },

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  post<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  patch<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
};
