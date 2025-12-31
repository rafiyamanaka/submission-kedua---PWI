/**
 * IndexedDB Manager
 * Mengelola database IndexedDB untuk offline storage dan sync
 */

const DB_NAME = 'CeritaNusantaraDB';
const DB_VERSION = 2;
const STORES = {
  STORIES: 'stories',
  PENDING_STORIES: 'pending_stories',
  SYNC_QUEUE: 'sync_queue',
  FAVORITES: 'favorites'
};

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store untuk stories yang sudah disimpan dari API
        if (!db.objectStoreNames.contains(STORES.STORIES)) {
          const storiesStore = db.createObjectStore(STORES.STORIES, { keyPath: 'id' });
          storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
          storiesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Store untuk stories yang dibuat offline (pending sync)
        if (!db.objectStoreNames.contains(STORES.PENDING_STORIES)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_STORIES, { 
            keyPath: 'tempId',
            autoIncrement: true 
          });
          pendingStore.createIndex('createdAt', 'createdAt', { unique: false });
          pendingStore.createIndex('status', 'status', { unique: false });
        }

        // Store untuk sync queue
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
            keyPath: 'queueId',
            autoIncrement: true 
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        // Store untuk favorites
        if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
          const favoritesStore = db.createObjectStore(STORES.FAVORITES, { keyPath: 'id' });
          favoritesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        console.log('IndexedDB schema created/updated');
      };
    });
  }

  /**
   * Save stories to IndexedDB
   */
  async saveStories(stories) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.STORIES], 'readwrite');
      const store = transaction.objectStore(STORES.STORIES);

      stories.forEach(story => {
        store.put({
          ...story,
          syncStatus: 'synced',
          lastUpdated: new Date().toISOString()
        });
      });

      transaction.oncomplete = () => {
        console.log(`Saved ${stories.length} stories to IndexedDB`);
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error('Failed to save stories to IndexedDB'));
      };
    });
  }

  /**
   * Get all stories from IndexedDB
   */
  async getStories() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.STORIES], 'readonly');
      const store = transaction.objectStore(STORES.STORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get stories from IndexedDB'));
      };
    });
  }

  /**
   * Delete story from IndexedDB
   */
  async deleteStory(storyId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.STORIES], 'readwrite');
      const store = transaction.objectStore(STORES.STORIES);
      const request = store.delete(storyId);

      request.onsuccess = () => {
        console.log(`Deleted story ${storyId} from IndexedDB`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete story from IndexedDB'));
      };
    });
  }

  /**
   * Save pending story (created offline)
   */
  async savePendingStory(storyData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_STORIES], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_STORIES);
      
      const pendingStory = {
        ...storyData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        attempts: 0
      };

      const request = store.add(pendingStory);

      request.onsuccess = () => {
        console.log('Saved pending story to IndexedDB');
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to save pending story'));
      };
    });
  }

  /**
   * Get all pending stories
   */
  async getPendingStories() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_STORIES], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_STORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get pending stories'));
      };
    });
  }

  /**
   * Delete pending story after successful sync
   */
  async deletePendingStory(tempId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_STORIES], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_STORIES);
      const request = store.delete(tempId);

      request.onsuccess = () => {
        console.log(`Deleted pending story ${tempId}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete pending story'));
      };
    });
  }

  /**
   * Update pending story status
   */
  async updatePendingStoryStatus(tempId, status, attempts) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_STORIES], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_STORIES);
      const getRequest = store.get(tempId);

      getRequest.onsuccess = () => {
        const story = getRequest.result;
        if (story) {
          story.status = status;
          story.attempts = attempts;
          story.lastAttempt = new Date().toISOString();
          
          const updateRequest = store.put(story);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('Failed to update pending story'));
        } else {
          reject(new Error('Pending story not found'));
        }
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get pending story'));
      };
    });
  }

  /**
   * Clear all data (untuk testing)
   */
  async clearAll() {
    if (!this.db) await this.init();

    const stores = [STORES.STORIES, STORES.PENDING_STORIES, STORES.SYNC_QUEUE];
    
    return Promise.all(stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          console.log(`Cleared ${storeName}`);
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to clear ${storeName}`));
        };
      });
    }));
  }

  /**
   * Get database stats
   */
  async getStats() {
    if (!this.db) await this.init();

    const stories = await this.getStories();
    const pending = await this.getPendingStories();

    return {
      totalStories: stories.length,
      pendingSync: pending.length,
      lastSync: localStorage.getItem('lastSyncTime') || 'Never'
    };
  }

  /**
   * ===== FAVORITES OPERATIONS =====
   */

  /**
   * Get all favorites
   */
  async getAllFavorites() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAVORITES], 'readonly');
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get favorites from IndexedDB'));
      };
    });
  }

  /**
   * Add story to favorites
   */
  async addFavorite(story) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAVORITES], 'readwrite');
      const store = transaction.objectStore(STORES.FAVORITES);
      
      const favorite = {
        ...story,
        favoriteAddedAt: new Date().toISOString()
      };

      const request = store.put(favorite);

      request.onsuccess = () => {
        console.log(`Added story ${story.id} to favorites`);
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to add favorite'));
      };
    });
  }

  /**
   * Remove story from favorites
   */
  async removeFavorite(storyId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAVORITES], 'readwrite');
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.delete(storyId);

      request.onsuccess = () => {
        console.log(`Removed story ${storyId} from favorites`);
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to remove favorite'));
      };
    });
  }

  /**
   * Check if story is in favorites
   */
  async isFavorite(storyId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAVORITES], 'readonly');
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.get(storyId);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to check favorite status'));
      };
    });
  }

  /**
   * Get favorite count
   */
  async getFavoriteCount() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAVORITES], 'readonly');
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get favorite count'));
      };
    });
  }
}

// Export singleton instance
const indexedDBManager = new IndexedDBManager();
export default indexedDBManager;
