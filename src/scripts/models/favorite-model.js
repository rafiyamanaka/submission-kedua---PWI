/**
 * FavoriteModel
 * Model untuk mengelola cerita favorit menggunakan localStorage
 */
class FavoriteModel {
  constructor() {
    this.STORAGE_KEY = 'favorite_stories';
  }

  /**
   * Get semua cerita favorit
   */
  getAllFavorites() {
    try {
      const favorites = localStorage.getItem(this.STORAGE_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Tambah cerita ke favorit
   */
  addFavorite(story) {
    try {
      const favorites = this.getAllFavorites();
      
      // Cek apakah sudah ada
      const exists = favorites.some(fav => fav.id === story.id);
      if (exists) {
        return false;
      }

      favorites.push(story);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  /**
   * Hapus cerita dari favorit
   */
  removeFavorite(storyId) {
    try {
      const favorites = this.getAllFavorites();
      const filtered = favorites.filter(fav => fav.id !== storyId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  /**
   * Cek apakah cerita ada di favorit
   */
  isFavorite(storyId) {
    const favorites = this.getAllFavorites();
    return favorites.some(fav => fav.id === storyId);
  }

  /**
   * Hapus semua favorit
   */
  clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }

  /**
   * Get jumlah favorit
   */
  getCount() {
    return this.getAllFavorites().length;
  }
}

export default FavoriteModel;
