/**
 * App Router
 * Router untuk navigasi halaman
 */
import URLParser from './utils/url-parser';
import AuthModel from './models/auth-model';
import StoryModel from './models/story-model';
import FavoriteModel from './models/favorite-model';
import AuthPresenter from './presenters/auth-presenter';
import StoryPresenter from './presenters/story-presenter';
import FavoritePresenter from './presenters/favorite-presenter';
import PushNotificationPresenter from './presenters/push-notification-presenter';
import LoginView from './views/login-view';
import RegisterView from './views/register-view';
import HomeView from './views/home-view';
import AddStoryView from './views/add-story-view';
import FavoriteView from './views/favorite-view';
import syncManager from './utils/sync-manager.js';
import indexedDBManager from './utils/indexeddb-manager.js';

class AppRouter {
  constructor() {
    this.authModel = new AuthModel();
    this.storyModel = new StoryModel();
    this.favoriteModel = new FavoriteModel();
    this._initialRoute();
    this._initializeApp();
  }

  async _initializeApp() {
    // Initialize IndexedDB
    try {
      await indexedDBManager.init();
      console.log('IndexedDB initialized');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }

    // Setup sync listeners if authenticated
    if (this.authModel.isAuthenticated()) {
      const token = this.authModel.getToken();
      syncManager.setupListeners(token);
    }
  }

  _initialRoute() {
    window.addEventListener('hashchange', () => {
      this._route();
    });

    this._route();
  }

  _route() {
    const url = URLParser.parseActiveUrlWithCombiner();

    // Check authentication
    if (!this.authModel.isAuthenticated() && url !== '/' && url !== '/login' && url !== '/register') {
      window.location.hash = '#/login';
      return;
    }

    // Gunakan View Transition API untuk transisi halaman yang smooth
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this._renderPage(url);
      });
    } else {
      // Fallback untuk browser yang tidak support View Transition API
      this._renderPage(url);
    }
  }

  _renderPage(url) {
    switch (url) {
      case '/':
        this._handleLanding();
        break;
      case '/register':
        this._handleRegister();
        break;
      case '/login':
        this._handleLogin();
        break;
      case '/home':
        this._handleHome();
        break;
      case '/add-story':
        this._handleAddStory();
        break;
      case '/favorite':
        this._handleFavorite();
        break;
      default:
        this._handleNotFound();
    }
  }

  _handleLanding() {
    // Redirect ke home jika sudah login, ke login jika belum
    if (this.authModel.isAuthenticated()) {
      window.location.hash = '#/home';
    } else {
      window.location.hash = '#/login';
    }
  }

  _handleRegister() {
    const registerView = new RegisterView();
    const authPresenter = new AuthPresenter(this.authModel, registerView);

    registerView.onRegisterSubmit = (name, email, password, passwordConfirm) => {
      authPresenter.handleRegister(name, email, password, passwordConfirm);
    };

    registerView.render();
  }

  _handleLogin() {
    const loginView = new LoginView();
    const authPresenter = new AuthPresenter(this.authModel, loginView);

    loginView.onLoginSubmit = (email, password) => {
      authPresenter.handleLogin(email, password);
    };

    loginView.render();
  }

  _handleHome() {
    const homeView = new HomeView();
    const storyPresenter = new StoryPresenter(this.storyModel, homeView);
    const authPresenter = new AuthPresenter(this.authModel, homeView);
    const pushNotificationPresenter = new PushNotificationPresenter(homeView);
    const favoritePresenter = new FavoritePresenter(this.favoriteModel, homeView);

    homeView.onLogoutClick = () => {
      authPresenter.handleLogout();
    };

    homeView.onToggleFavorite = async (story, buttonElement) => {
      const result = await favoritePresenter.handleToggleFavorite(story);
      
      if (result.success) {
        // Trigger animation
        buttonElement.style.animation = 'heartBeat 0.5s ease';
        setTimeout(() => {
          buttonElement.style.animation = '';
        }, 500);
        
        // Update button UI
        if (result.isFavorite) {
          buttonElement.classList.add('active');
          buttonElement.textContent = '❤️';
          buttonElement.setAttribute('aria-label', 'Hapus dari favorit');
          buttonElement.setAttribute('title', 'Hapus dari favorit');
          homeView.showSuccess('✅ Ditambahkan ke favorit');
        } else {
          buttonElement.classList.remove('active');
          buttonElement.textContent = '🤍';
          buttonElement.setAttribute('aria-label', 'Tambah ke favorit');
          buttonElement.setAttribute('title', 'Tambah ke favorit');
          homeView.showSuccess('✅ Dihapus dari favorit');
        }
      } else {
        homeView.showError('❌ Gagal mengubah status favorit');
      }
    };

    // Sync button handler
    homeView.onSyncClick = async () => {
      const token = this.authModel.getToken();
      if (token) {
        try {
          await syncManager.syncPendingStories(token);
          // Refresh stories after sync
          const favorites = await this.favoriteModel.getAllFavorites();
          const favoriteIds = favorites.map(fav => fav.id);
          await storyPresenter.handleGetAllStories(token, favoriteIds);
          // Update pending count
          const stats = await indexedDBManager.getStats();
          homeView.updatePendingCount(stats.pendingSync);
        } catch (error) {
          console.error('Sync error:', error);
        }
      }
    };

    // Register sync status listener
    syncManager.onSyncStatusChange((status) => {
      homeView.showSyncStatus(status);
    });

    homeView.render();

    const token = this.authModel.getToken();
    if (token) {
      // Get favorite IDs untuk highlight (async)
      this.favoriteModel.getAllFavorites().then(favorites => {
        const favoriteIds = favorites.map(fav => fav.id);
        storyPresenter.handleGetStoriesWithLocation(token);
        storyPresenter.handleGetAllStories(token, favoriteIds);
      });
      
      // Initialize push notification
      pushNotificationPresenter.init(token);

      // Update pending count
      indexedDBManager.getStats().then(stats => {
        homeView.updatePendingCount(stats.pendingSync);
      });

      // Check online status and show message if offline
      if (!navigator.onLine) {
        homeView.showSyncStatus({
          type: 'warning',
          message: '📡 Anda sedang offline. Data akan disimpan lokal.'
        });
      }
    }
  }

  _handleAddStory() {
    const addStoryView = new AddStoryView();
    const storyPresenter = new StoryPresenter(this.storyModel, addStoryView);

    addStoryView.onAddStorySubmit = (formData) => {
      const token = this.authModel.getToken();
      if (token) {
        storyPresenter.handleAddStory(token, formData);
      }
    };

    addStoryView.render();
  }

  _handleFavorite() {
    const favoriteView = new FavoriteView();
    const favoritePresenter = new FavoritePresenter(this.favoriteModel, favoriteView);
    const authPresenter = new AuthPresenter(this.authModel, favoriteView);

    favoriteView.onLogoutClick = () => {
      authPresenter.handleLogout();
    };

    favoriteView.onRefresh = () => {
      favoritePresenter.handleGetFavorites();
    };

    favoriteView.onClearAll = () => {
      favoritePresenter.handleClearAll();
    };

    favoriteView.onRemoveFavorite = (storyId) => {
      favoritePresenter.handleRemoveFavorite(storyId);
    };

    favoriteView.render();
    favoritePresenter.handleGetFavorites();
  }

  _handleNotFound() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="not-found-container">
        <h1>404 - Halaman Tidak Ditemukan</h1>
        <p>Halaman yang Anda cari tidak ada.</p>
        <a href="#/home" class="btn btn-primary">Kembali ke Beranda</a>
      </div>
    `;
  }
}

export default AppRouter;
