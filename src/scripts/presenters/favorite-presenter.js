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
  handleGetFavorites() {
    try {
      const favorites = this.model.getAllFavorites();
      this.view.displayFavorites(favorites);
    } catch (error) {
      this.view.showError('Gagal memuat cerita favorit');
      console.error(error);
    }
  }

  /**
   * Hapus cerita dari favorit
   */
  handleRemoveFavorite(storyId) {
    try {
      const success = this.model.removeFavorite(storyId);
      if (success) {
        this.view.showSuccess('Cerita dihapus dari favorit');
        this.handleGetFavorites(); // Refresh list
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
  handleClearAll() {
    try {
      const success = this.model.clearAll();
      if (success) {
        this.view.showSuccess('Semua cerita favorit telah dihapus');
        this.handleGetFavorites(); // Refresh list
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
  handleToggleFavorite(story) {
    try {
      const isFavorite = this.model.isFavorite(story.id);
      
      if (isFavorite) {
        const success = this.model.removeFavorite(story.id);
        return { success, isFavorite: false };
      } else {
        const success = this.model.addFavorite(story);
        return { success, isFavorite: true };
      }
    } catch (error) {
      console.error(error);
      return { success: false, isFavorite: false };
    }
  }
}

export default FavoritePresenter;
