import { BaseService } from './baseService';

export interface Profile {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
}

class ProfileService extends BaseService<Profile> {
    constructor() {
        super('profiles', '/profiles');
    }

    // Add specific queries methods here, e.g.
    // async getByRole(role: string): Promise<Profile[]>
}

export const profileService = new ProfileService();
