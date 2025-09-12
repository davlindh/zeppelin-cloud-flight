import { supabase } from '@/integrations/supabase/client';

export interface CacheEntry {
  id: string;
  url: string;
  blob: Blob;
  mimeType: string;
  size: number;
  cachedAt: number;
  lastAccessed: number;
  expiresAt?: number;
  metadata?: {
    title?: string;
    type?: string;
    projectId?: string;
    participantId?: string;
  };
}

export interface CacheSettings {
  enabled: boolean;
  maxSize: number; // in MB
  maxAge: number; // in milliseconds
  autoCleanup: boolean;
  allowedMimeTypes: string[];
}

const DEFAULT_CACHE_SETTINGS: CacheSettings = {
  enabled: true,
  maxSize: 500, // 500MB
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  autoCleanup: true,
  allowedMimeTypes: [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'text/*'
  ]
};

class FileCacheService {
  private dbName = 'lovable-file-cache';
  private dbVersion = 1;
  private storeName = 'files';
  private db: IDBDatabase | null = null;
  private settings: CacheSettings;
  private isInitialized = false;

  constructor() {
    this.settings = this.loadSettings();
    this.initDB();
  }

  private loadSettings(): CacheSettings {
    try {
      const saved = localStorage.getItem('file-cache-settings');
      return saved ? { ...DEFAULT_CACHE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_CACHE_SETTINGS;
    } catch {
      return DEFAULT_CACHE_SETTINGS;
    }
  }

  private saveSettings(): void {
    localStorage.setItem('file-cache-settings', JSON.stringify(this.settings));
  }

  public updateSettings(newSettings: Partial<CacheSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): CacheSettings {
    return { ...this.settings };
  }

  private async initDB(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('url', 'url', { unique: true });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  private generateCacheId(url: string): string {
    // Create a consistent ID from URL
    return btoa(encodeURIComponent(url)).replace(/[+/=]/g, '');
  }

  private isAllowedMimeType(mimeType: string): boolean {
    return this.settings.allowedMimeTypes.some(allowed => 
      allowed === '*' || 
      (allowed.endsWith('*') && mimeType.startsWith(allowed.slice(0, -1))) ||
      allowed === mimeType
    );
  }

  public async getCachedFile(url: string): Promise<CacheEntry | null> {
    if (!this.settings.enabled || !this.isInitialized || !this.db) {
      return null;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const id = this.generateCacheId(url);
      
      const request = store.get(id);
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const entry: CacheEntry | undefined = request.result;
          
          if (!entry) {
            resolve(null);
            return;
          }

          // Check expiration
          if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.removeCachedFile(url);
            resolve(null);
            return;
          }

          // Update last accessed
          entry.lastAccessed = Date.now();
          store.put(entry);

          resolve(entry);
        };
      });
    } catch (error) {
      console.warn('Failed to get cached file:', error);
      return null;
    }
  }

  public async cacheFile(url: string, metadata?: CacheEntry['metadata']): Promise<CacheEntry | null> {
    if (!this.settings.enabled || !this.isInitialized || !this.db) {
      return null;
    }

    try {
      // Check if already cached
      const existing = await this.getCachedFile(url);
      if (existing) {
        return existing;
      }

      // Fetch the file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const blob = await response.blob();
      const mimeType = blob.type || 'application/octet-stream';

      // Check if mime type is allowed
      if (!this.isAllowedMimeType(mimeType)) {
        console.log('File type not allowed for caching:', mimeType);
        return null;
      }

      // Check cache size limits
      await this.ensureCacheSpace(blob.size);

      const entry: CacheEntry = {
        id: this.generateCacheId(url),
        url,
        blob,
        mimeType,
        size: blob.size,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        expiresAt: Date.now() + this.settings.maxAge,
        metadata
      };

      // Store in IndexedDB
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.add(entry);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          console.log('File cached successfully:', url);
          resolve(entry);
        };
      });
    } catch (error) {
      console.warn('Failed to cache file:', error);
      return null;
    }
  }

  public async removeCachedFile(url: string): Promise<void> {
    if (!this.isInitialized || !this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const id = this.generateCacheId(url);
      
      store.delete(id);
    } catch (error) {
      console.warn('Failed to remove cached file:', error);
    }
  }

  public async getCacheStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    sizeFormatted: string;
    maxSizeMB: number;
    usagePercent: number;
  }> {
    if (!this.isInitialized || !this.db) {
      return {
        totalFiles: 0,
        totalSize: 0,
        sizeFormatted: '0 B',
        maxSizeMB: this.settings.maxSize,
        usagePercent: 0
      };
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const entries: CacheEntry[] = request.result;
          const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
          const maxSizeBytes = this.settings.maxSize * 1024 * 1024;
          
          resolve({
            totalFiles: entries.length,
            totalSize,
            sizeFormatted: this.formatBytes(totalSize),
            maxSizeMB: this.settings.maxSize,
            usagePercent: (totalSize / maxSizeBytes) * 100
          });
        };
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        sizeFormatted: '0 B',
        maxSizeMB: this.settings.maxSize,
        usagePercent: 0
      };
    }
  }

  private async ensureCacheSpace(requiredBytes: number): Promise<void> {
    const stats = await this.getCacheStats();
    const maxBytes = this.settings.maxSize * 1024 * 1024;
    const availableBytes = maxBytes - stats.totalSize;

    if (availableBytes >= requiredBytes) {
      return; // Enough space available
    }

    // Need to free up space - remove oldest files first
    await this.cleanupOldFiles(requiredBytes - availableBytes);
  }

  private async cleanupOldFiles(bytesToFree: number): Promise<void> {
    if (!this.isInitialized || !this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('lastAccessed');
      
      return new Promise((resolve, reject) => {
        const request = index.openCursor();
        let freedBytes = 0;
        
        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          
          if (!cursor || freedBytes >= bytesToFree) {
            resolve();
            return;
          }

          const entry: CacheEntry = cursor.value;
          freedBytes += entry.size;
          cursor.delete();
          cursor.continue();
        };
      });
    } catch (error) {
      console.warn('Failed to cleanup old files:', error);
    }
  }

  public async clearCache(): Promise<void> {
    if (!this.isInitialized || !this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  public async getAllCachedFiles(): Promise<CacheEntry[]> {
    if (!this.isInitialized || !this.db) return [];

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      console.warn('Failed to get all cached files:', error);
      return [];
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fileCacheService = new FileCacheService();