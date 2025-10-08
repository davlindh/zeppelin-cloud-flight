// Utility for enforcing storage cleanup when replacing or deleting images

import { deleteMultipleImages } from './imageManager';

/**
 * Cleanup handler for component unmounting or data updates
 */
export class StorageCleanupManager {
  private cleanupQueue: Set<string> = new Set();
  private isProcessing = false;

  /**
   * Add image URL to cleanup queue
   */
  queueForCleanup(imageUrl: string) {
    if (imageUrl && imageUrl !== '/placeholder.svg') {
      this.cleanupQueue.add(imageUrl);
    }
  }

  /**
   * Add multiple image URLs to cleanup queue
   */
  queueMultipleForCleanup(imageUrls: (string | null)[]) {
    imageUrls.forEach(url => {
      if (url) this.queueForCleanup(url);
    });
  }

  /**
   * Process cleanup queue
   */
  async processCleanup(): Promise<{ success: number; failed: number }> {
    if (this.isProcessing || this.cleanupQueue.size === 0) {
      return { success: 0, failed: 0 };
    }

    this.isProcessing = true;
    const urlsToCleanup = Array.from(this.cleanupQueue);
    this.cleanupQueue.clear();

    try {
      const result = await deleteMultipleImages(urlsToCleanup);
      return result;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear the cleanup queue without processing
   */
  clearQueue() {
    this.cleanupQueue.clear();
  }

  /**
   * Get current queue size
   */
  get queueSize() {
    return this.cleanupQueue.size;
  }
}

// Global instance for app-wide cleanup management
export const globalCleanupManager = new StorageCleanupManager();

/**
 * Hook for component-level cleanup management
 */
const logCleanup = async (oldUrl: string | null) => {
  console.log('Cleanup queued for:', oldUrl);
};

export const useStorageCleanup = () => {
  const cleanupManager = new StorageCleanupManager();

  const cleanupOnUnmount = (imageUrls: (string | null)[]) => {
    cleanupManager.queueMultipleForCleanup(imageUrls);
    
    // Return cleanup function for useEffect
    return () => {
      cleanupManager.processCleanup();
    };
  };

  return {
    cleanupManager,
    cleanupOnUnmount,
    replaceWithCleanup: logCleanup,
  };
};
