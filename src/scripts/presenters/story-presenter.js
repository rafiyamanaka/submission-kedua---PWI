/**
 * StoryPresenter
 * Presenter untuk mengelola logika cerita
 */
import indexedDBManager from '../utils/indexeddb-manager.js';

class StoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async handleGetAllStories(token, favoriteIds = []) {
    this.view.showLoading();

    try {
      // Get stories from API
      const result = await this.model.getAllStories(token);
      
      // Get pending stories from IndexedDB
      const pendingStories = await indexedDBManager.getPendingStories();
      
      // Transform pending stories to match story format
      const transformedPending = pendingStories.map(pending => ({
        id: `pending-${pending.tempId}`,
        name: pending.description ? pending.description.substring(0, 50) + '...' : 'Cerita Pending',
        description: pending.description || '',
        photoUrl: pending.photoBase64 || '',
        createdAt: pending.createdAt || new Date().toISOString(),
        lat: pending.lat || null,
        lon: pending.lon || null,
        isPending: true,
        status: pending.status || 'pending'
      }));
      
      // Combine API stories with pending stories
      const allStories = [...transformedPending, ...result.listStory];
      
      this.view.hideLoading();
      this.view.displayStories(allStories, favoriteIds);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }

  async handleGetStoriesWithLocation(token) {
    this.view.showLoading();

    try {
      // Get stories from API
      const result = await this.model.getStoriesWithLocation(token);
      
      // Get pending stories with location from IndexedDB
      const pendingStories = await indexedDBManager.getPendingStories();
      const pendingWithLocation = pendingStories
        .filter(story => story.lat && story.lon)
        .map(pending => ({
          id: `pending-${pending.tempId}`,
          name: pending.description ? pending.description.substring(0, 50) + '...' : 'Cerita Pending',
          description: pending.description || '',
          photoUrl: pending.photoBase64 || '',
          createdAt: pending.createdAt || new Date().toISOString(),
          lat: pending.lat,
          lon: pending.lon,
          isPending: true,
          status: pending.status || 'pending'
        }));

      // Filter API stories dengan location
      const storiesWithLocation = result.listStory.filter(
        (story) => story.lat && story.lon
      );
      
      // Combine both
      const allStoriesWithLocation = [...pendingWithLocation, ...storiesWithLocation];

      this.view.hideLoading();
      this.view.displayStoriesOnMap(allStoriesWithLocation);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }

  async handleAddStory(token, formData) {
    this.view.showLoading();

    try {
      const result = await this.model.addStory(token, formData);
      this.view.hideLoading();
      this.view.showSuccess('Cerita berhasil ditambahkan');
      setTimeout(() => {
        window.location.hash = '#/home';
      }, 2000);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }

  async handleGetStoryDetail(token, storyId) {
    this.view.showLoading();

    try {
      const result = await this.model.getStoryDetail(token, storyId);
      this.view.hideLoading();
      this.view.displayStoryDetail(result.story);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }
}

export default StoryPresenter;
