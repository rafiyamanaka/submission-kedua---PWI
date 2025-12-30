/**
 * Sync Manager
 * Mengelola synchronisasi data offline ke online
 */

import indexedDBManager from './indexeddb-manager.js';
import { addStory } from '../data/api.js';

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncCallbacks = [];
  }

  /**
   * Register sync callback
   */
  onSyncStatusChange(callback) {
    this.syncCallbacks.push(callback);
  }

  /**
   * Notify sync status change
   */
  notifySyncStatus(status) {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  /**
   * Check if online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Sync all pending stories
   */
  async syncPendingStories(token) {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!this.isOnline()) {
      console.log('Cannot sync: offline');
      return;
    }

    this.isSyncing = true;
    this.notifySyncStatus({ type: 'start', message: 'Memulai sinkronisasi...' });

    try {
      const pendingStories = await indexedDBManager.getPendingStories();
      
      if (pendingStories.length === 0) {
        console.log('No pending stories to sync');
        this.isSyncing = false;
        return { success: true, synced: 0 };
      }

      console.log(`Found ${pendingStories.length} pending stories to sync`);
      
      let syncedCount = 0;
      let failedCount = 0;

      for (const pendingStory of pendingStories) {
        try {
          this.notifySyncStatus({ 
            type: 'progress', 
            message: `Mengsinkronkan ${syncedCount + 1}/${pendingStories.length}...` 
          });

          // Convert data to FormData for API
          const formData = new FormData();
          formData.append('description', pendingStory.description);
          
          // Handle photo dari IndexedDB (base64 atau blob)
          if (pendingStory.photoBlob) {
            const blob = this.base64ToBlob(pendingStory.photoBlob, pendingStory.photoType);
            formData.append('photo', blob, pendingStory.photoName || 'photo.jpg');
          }
          
          if (pendingStory.lat) formData.append('lat', pendingStory.lat);
          if (pendingStory.lon) formData.append('lon', pendingStory.lon);

          // Upload to API
          await addStory(token, formData);
          
          // Delete from pending after successful sync
          await indexedDBManager.deletePendingStory(pendingStory.tempId);
          
          syncedCount++;
          console.log(`Successfully synced story ${pendingStory.tempId}`);

        } catch (error) {
          console.error(`Failed to sync story ${pendingStory.tempId}:`, error);
          
          // Update attempts
          const attempts = (pendingStory.attempts || 0) + 1;
          await indexedDBManager.updatePendingStoryStatus(
            pendingStory.tempId, 
            'failed', 
            attempts
          );
          
          failedCount++;
        }
      }

      // Update last sync time
      localStorage.setItem('lastSyncTime', new Date().toISOString());

      this.isSyncing = false;

      if (syncedCount > 0) {
        this.notifySyncStatus({ 
          type: 'success', 
          message: `✅ Berhasil sinkronisasi ${syncedCount} cerita` 
        });
      }

      if (failedCount > 0) {
        this.notifySyncStatus({ 
          type: 'warning', 
          message: `⚠️ ${failedCount} cerita gagal disinkronkan` 
        });
      }

      return { 
        success: true, 
        synced: syncedCount, 
        failed: failedCount 
      };

    } catch (error) {
      console.error('Sync error:', error);
      this.isSyncing = false;
      this.notifySyncStatus({ 
        type: 'error', 
        message: '❌ Gagal melakukan sinkronisasi' 
      });
      throw error;
    }
  }

  /**
   * Convert base64 to Blob
   */
  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Setup online/offline listeners
   */
  setupListeners(token) {
    window.addEventListener('online', async () => {
      console.log('Back online, starting sync...');
      this.notifySyncStatus({ 
        type: 'info', 
        message: '🌐 Kembali online, memulai sinkronisasi...' 
      });
      
      try {
        await this.syncPendingStories(token);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      this.notifySyncStatus({ 
        type: 'warning', 
        message: '📡 Anda sedang offline. Data akan disimpan lokal.' 
      });
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline(),
      lastSync: localStorage.getItem('lastSyncTime')
    };
  }
}

// Export singleton
const syncManager = new SyncManager();
export default syncManager;
