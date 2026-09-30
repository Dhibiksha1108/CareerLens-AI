import { getAuthToken } from '../utils/token';
import type { ApiResponse } from '../types';

// Resolve API base URL to ensure requests are routed to the Express API.
// If VITE_API_BASE_URL points to localhost:5000 from original local dev config, default to '/api'
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (!envUrl || envUrl.includes('localhost:5000') || envUrl.trim() === '') {
    return '/api';
  }
  return envUrl.replace(/\/+$/, '');
};

const BASE_URL = getApiBaseUrl();

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
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')
        ? `${BASE_URL}${cleanEndpoint.slice(4)}`
        : `${BASE_URL}${cleanEndpoint}`;

      const response = await fetch(url, config);
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
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')
        ? `${BASE_URL}${cleanEndpoint.slice(4)}`
        : `${BASE_URL}${cleanEndpoint}`;

      const response = await fetch(url, {
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
    return apiClient.request<T>(endpoint, { method: 'GET' });
  },

  post<T = any>(endpoint: string, body: any) {
    return apiClient.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put<T = any>(endpoint: string, body: any) {
    return apiClient.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  patch<T = any>(endpoint: string, body: any) {
    return apiClient.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete<T = any>(endpoint: string) {
    return apiClient.request<T>(endpoint, { method: 'DELETE' });
  }
};
