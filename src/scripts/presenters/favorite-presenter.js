/**
 * FavoritePresenter
 * Presenter untuk mengelola logika cerita favorit
 */
class FavoritePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  /**
   * Load semua cerita favorit
   */
  async handleGetFavorites() {
    try {
      const favorites = await this.model.getAllFavorites();
      this.view.displayFavorites(favorites);
    } catch (error) {
      this.view.showError('Gagal memuat cerita favorit');
      console.error(error);
    }
  }

  /**
   * Hapus cerita dari favorit
   */
  async handleRemoveFavorite(storyId) {
    try {
      const success = await this.model.removeFavorite(storyId);
      if (success) {
        this.view.showSuccess('Cerita dihapus dari favorit');
        await this.handleGetFavorites(); // Refresh list
      } else {
        this.view.showError('Gagal menghapus cerita dari favorit');
      }
    } catch (error) {
      this.view.showError('Terjadi kesalahan');
      console.error(error);
    }
  }

  /**
   * Hapus semua favorit
   */
  async handleClearAll() {
    try {
      const success = await this.model.clearAll();
      if (success) {
        this.view.showSuccess('Semua cerita favorit telah dihapus');
        await this.handleGetFavorites(); // Refresh list
      } else {
        this.view.showError('Gagal menghapus semua favorit');
      }
    } catch (error) {
      this.view.showError('Terjadi kesalahan');
      console.error(error);
    }
  }

  /**
   * Toggle favorite status
   */
  async handleToggleFavorite(story) {
    try {
      const isFavorite = await this.model.isFavorite(story.id);
      
      if (isFavorite) {
        const success = await this.model.removeFavorite(story.id);
        return { success, isFavorite: false };
      } else {
        const success = await this.model.addFavorite(story);
        return { success, isFavorite: true };
      }
    } catch (error) {
      console.error(error);
      return { success: false, isFavorite: false };
    }
  }
}

export default FavoritePresenter;
