/**
 * Core API Client
 * 
 * This module provides a generic HTTP client to replace direct Supabase calls.
 * It is configured to point to our target backend (JakobNavid.Core API) and
 * automatically handles authentication tokens.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001/api';

class ApiError extends Error {
    constructor(public status: number, public message: string, public data?: unknown) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = await response.text();
        }
        throw new ApiError(
            response.status,
            errorData?.message || response.statusText || 'An error occurred during the request',
            errorData
        );
    }

    // Handle No Content (204)
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

/**
 * Gets the current auth token from storage.
 * Currently fallback to Supabase's local storage key if we are in transition,
 * otherwise use a standard token key.
 */
function getAuthToken(): string | null {
    // Try to get token from our standard key first
    const standardToken = localStorage.getItem('api_auth_token');
    if (standardToken) return standardToken;

    // Fallback for transition period if we still have a Supabase session
    const supabaseSessionStr = localStorage.getItem('sb-paywaomkmjssbtkzwnwd-auth-token');
    if (supabaseSessionStr) {
        try {
            const session = JSON.parse(supabaseSessionStr);
            return session?.access_token || null;
        } catch {
            return null;
        }
    }

    return null;
}

export const apiClient = {
    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value);
                }
            });
        }

        const token = getAuthToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
        });

        return handleResponse<T>(response);
    },

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        const token = getAuthToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        return handleResponse<T>(response);
    },

    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        const token = getAuthToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        return handleResponse<T>(response);
    },

    async delete<T>(endpoint: string): Promise<T> {
        const token = getAuthToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        return handleResponse<T>(response);
    },

    async upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
        const token = getAuthToken();
        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const formData = new FormData();
        formData.append(fieldName, file);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        return handleResponse<T>(response);
    }
};
