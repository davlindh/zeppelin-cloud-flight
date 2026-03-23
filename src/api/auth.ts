import { apiClient } from './client';

export interface AppUser {
    id: string;
    email: string;
    role?: string;
    user_metadata?: Record<string, unknown>;
}

export interface AuthSession {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    user: AppUser;
}

export interface AuthResponse {
    success: boolean;
    error?: string;
    session?: AuthSession;
    user?: AppUser;
}

// Memory store for subscription callbacks
type AuthStateChangeCallback = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: AuthSession | null) => void;
const listeners: Set<AuthStateChangeCallback> = new Set();

/**
 * Auth Service Adapter
 * Replaces direct Supabase Auth calls allowing switching to custom backend like JakobNavid.Core
 */
export const authService = {

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const data = await apiClient.post<{ session: AuthSession, user: AppUser }>('/auth/login', { email, password });

            // Store token
            if (data.session?.access_token) {
                localStorage.setItem('api_auth_token', data.session.access_token);
                this.notifyListeners('SIGNED_IN', data.session);
            }

            return { success: true, session: data.session, user: data.user };
        } catch (error: unknown) {
            return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
        }
    },

    async signup(email: string, password: string): Promise<AuthResponse> {
        try {
            const data = await apiClient.post<{ user: AppUser }>('/auth/signup', { email, password });
            return { success: true, user: data.user };
        } catch (error: unknown) {
            return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
        }
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (e) {
            // Logout API failed, but clearing local session anyway
        } finally {
            localStorage.removeItem('api_auth_token');
            this.notifyListeners('SIGNED_OUT', null);
        }
    },

    async getSession(): Promise<{ session: AuthSession | null }> {
        const token = localStorage.getItem('api_auth_token');

        if (!token) return { session: null };

        try {
            // Validate session with backend
            const { session } = await apiClient.get<{ session: AuthSession }>('/auth/session');
            return { session };
        } catch (e) {
            // Token invalid or expired
            localStorage.removeItem('api_auth_token');
            return { session: null };
        }
    },

    async hasRole(userId: string, role: string): Promise<boolean> {
        try {
            const { hasRole } = await apiClient.get<{ hasRole: boolean }>(`/auth/users/${userId}/roles/${role}`);
            return hasRole;
        } catch (e) {
            return false;
        }
    },

    onAuthStateChange(callback: AuthStateChangeCallback) {
        listeners.add(callback);
        return {
            unsubscribe: () => {
                listeners.delete(callback);
            }
        };
    },

    notifyListeners(event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: AuthSession | null) {
        listeners.forEach(listener => listener(event, session));
    }
};
