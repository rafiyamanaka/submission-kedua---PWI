/**
 * StoryPresenter
 * Presenter untuk mengelola logika cerita
 */
class StoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async handleGetAllStories(token, favoriteIds = []) {
    this.view.showLoading();

    try {
      const result = await this.model.getAllStories(token);
      this.view.hideLoading();
      this.view.displayStories(result.listStory, favoriteIds);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }

  async handleGetStoriesWithLocation(token) {
    this.view.showLoading();

    try {
      const result = await this.model.getStoriesWithLocation(token);
      this.view.hideLoading();

      // Filter stories dengan location
      const storiesWithLocation = result.listStory.filter(
        (story) => story.lat && story.lon
      );

      this.view.displayStoriesOnMap(storiesWithLocation);
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
