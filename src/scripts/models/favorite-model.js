/**
 * FavoriteModel
 * Model untuk mengelola cerita favorit menggunakan IndexedDB
 */
import indexedDBManager from '../utils/indexeddb-manager.js';

class FavoriteModel {
  constructor() {
    this.dbManager = indexedDBManager;
  }

  /**
   * Get semua cerita favorit
   */
  async getAllFavorites() {
    try {
      return await this.dbManager.getAllFavorites();
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Tambah cerita ke favorit
   */
  async addFavorite(story) {
    try {
      // Cek apakah sudah ada
      const exists = await this.dbManager.isFavorite(story.id);
      if (exists) {
        return false;
      }

      return await this.dbManager.addFavorite(story);
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  /**
   * Hapus cerita dari favorit
   */
  async removeFavorite(storyId) {
    try {
      return await this.dbManager.removeFavorite(storyId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  /**
   * Cek apakah cerita ada di favorit
   */
  async isFavorite(storyId) {
    try {
      return await this.dbManager.isFavorite(storyId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Hapus semua favorit
   */
  async clearAll() {
    try {
      const favorites = await this.getAllFavorites();
      await Promise.all(favorites.map(fav => this.dbManager.removeFavorite(fav.id)));
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }

  /**
   * Get jumlah favorit
   */
  async getCount() {
    try {
      return await this.dbManager.getFavoriteCount();
    } catch (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }
  }
}

export default FavoriteModel;
