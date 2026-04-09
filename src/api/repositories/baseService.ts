import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '../client';

/**
 * BaseService
 * 
 * Abstracting database interactions.
 * Phase 1: In the transition phase, this service defaults to using the Supabase Javascript Client
 * to maintain functionality, but hides the implementation details from React components.
 * Phase 2: Once the C# backend API is ready, we swap the internal implementation of these 
 * methods to use the `apiClient` HTTP wrapper.
 */
export class BaseService<T> {
    protected tableName: string;
    protected endpointPath: string;
    protected useApi: boolean = false; // Toggle to false for Phase 1 (Supabase), true for Phase 2 (C# API)

    constructor(tableName: string, endpointPath: string) {
        this.tableName = tableName;
        this.endpointPath = endpointPath;
    }

    /**
     * Fetch all records
     */
    async getAll(): Promise<T[]> {
        if (this.useApi) {
            return apiClient.get<T[]>(this.endpointPath);
        } else {
            const { data, error } = await supabase.from(this.tableName as any).select('*');
            if (error) throw new Error(error.message);
            return data as unknown as T[];
        }
    }

    /**
     * Fetch a single record by ID
     */
    async getById(id: string): Promise<T | null> {
        if (this.useApi) {
            return apiClient.get<T>(`${this.endpointPath}/${id}`);
        } else {
            const { data, error } = await supabase.from(this.tableName as any).select('*').eq('id', id).maybeSingle();
            if (error) throw new Error(error.message);
            return data as unknown as T | null;
        }
    }

    /**
     * Create a new record
     */
    async create(payload: Partial<T>): Promise<T> {
        if (this.useApi) {
            return apiClient.post<T>(this.endpointPath, payload);
        } else {
            const { data, error } = await supabase.from(this.tableName as any).insert(payload as any).select().single();
            if (error) throw new Error(error.message);
            return data as unknown as T;
        }
    }

    /**
     * Update an existing record
     */
    async update(id: string, payload: Partial<T>): Promise<T> {
        if (this.useApi) {
            return apiClient.put<T>(`${this.endpointPath}/${id}`, payload);
        } else {
            const { data, error } = await supabase.from(this.tableName as any).update(payload as any).eq('id', id).select().single();
            if (error) throw new Error(error.message);
            return data as unknown as T;
        }
    }

    /**
     * Delete a record
     */
    async delete(id: string): Promise<void> {
        if (this.useApi) {
            await apiClient.delete(`${this.endpointPath}/${id}`);
        } else {
            const { error } = await supabase.from(this.tableName as any).delete().eq('id', id);
            if (error) throw new Error(error.message);
        }
    }
}
