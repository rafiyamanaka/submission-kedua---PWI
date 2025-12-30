/**
 * StoryModel
 * Model untuk mengelola data cerita dengan IndexedDB support
 */
import CONFIG from '../config';
import indexedDBManager from '../utils/indexeddb-manager.js';

class StoryModel {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
  }

  async getAllStories(token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Jika offline, ambil dari IndexedDB
        if (!navigator.onLine) {
          console.log('Offline: Loading stories from IndexedDB');
          const cachedStories = await indexedDBManager.getStories();
          return { listStory: cachedStories };
        }
        
        const data = await response.json();
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Save to IndexedDB untuk offline access
      if (data.listStory && data.listStory.length > 0) {
        await indexedDBManager.saveStories(data.listStory);
      }
      
      return data;
    } catch (error) {
      console.error('Get all stories error:', error);
      
      // Fallback ke IndexedDB jika error
      if (!navigator.onLine) {
        console.log('Offline: Loading stories from IndexedDB');
        const cachedStories = await indexedDBManager.getStories();
        return { listStory: cachedStories };
      }
      
      throw new Error(error.message || 'Gagal mengambil daftar cerita');
    }
  }

  async getStoriesWithLocation(token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories?location=1`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get stories with location error:', error);
      throw new Error(error.message || 'Gagal mengambil cerita dengan lokasi');
    }
  }

  async addStory(token, formData) {
    try {
      // Jika offline, simpan ke IndexedDB pending
      if (!navigator.onLine) {
        console.log('Offline: Saving story to IndexedDB');
        
        // Convert FormData ke object untuk IndexedDB
        const storyData = {
          description: formData.get('description'),
          lat: formData.get('lat') ? parseFloat(formData.get('lat')) : null,
          lon: formData.get('lon') ? parseFloat(formData.get('lon')) : null,
        };
        
        // Convert photo to base64 untuk IndexedDB
        const photoFile = formData.get('photo');
        if (photoFile) {
          const reader = new FileReader();
          const photoBlob = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photoFile);
          });
          
          storyData.photoBlob = photoBlob;
          storyData.photoType = photoFile.type;
          storyData.photoName = photoFile.name;
        }
        
        await indexedDBManager.savePendingStory(storyData);
        
        return { 
          error: false, 
          message: 'Cerita disimpan offline. Akan disinkronkan saat online.',
          offline: true
        };
      }
      
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add story error:', error);
      
      // Jika error network, save to IndexedDB
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('Network error: Saving story to IndexedDB');
        
        const storyData = {
          description: formData.get('description'),
          lat: formData.get('lat') ? parseFloat(formData.get('lat')) : null,
          lon: formData.get('lon') ? parseFloat(formData.get('lon')) : null,
        };
        
        const photoFile = formData.get('photo');
        if (photoFile) {
          const reader = new FileReader();
          const photoBlob = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photoFile);
          });
          
          storyData.photoBlob = photoBlob;
          storyData.photoType = photoFile.type;
          storyData.photoName = photoFile.name;
        }
        
        await indexedDBManager.savePendingStory(storyData);
        
        return { 
          error: false, 
          message: 'Cerita disimpan offline. Akan disinkronkan saat online.',
          offline: true
        };
      }
      
      throw new Error(error.message || 'Gagal menambah cerita');
    }
  }

  async getStoryDetail(token, storyId) {
    try {
      const response = await fetch(`${this.baseUrl}/stories/${storyId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get story detail error:', error);
      throw new Error(error.message || 'Gagal mengambil detail cerita');
    }
  }
}

export default StoryModel;
