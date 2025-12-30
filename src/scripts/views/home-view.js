/**
 * HomeView
 * View untuk halaman beranda dengan peta dan daftar cerita
 */
import L from 'leaflet';

class HomeView {
  constructor() {
    this.app = document.getElementById('app');
    this.map = null;
    this.markers = [];
    this.selectedLocation = null;
    this.stories = []; // Simpan stories data
    this.pendingMapStories = null; // Stories yang menunggu map ready
  }

  render() {
    this.app.innerHTML = `
      <div class="home-container fade-in">
        <header class="navbar" role="banner">
          <nav class="navbar-content" aria-label="Navigasi utama">
            <h1 class="navbar-title">Cerita Nusantara</h1>
            <div class="navbar-actions">
              <div class="notification-toggle" id="notificationToggleContainer" style="display:none;">
                <label class="toggle-switch" title="Toggle Push Notification">
                  <input type="checkbox" id="notificationToggle" aria-label="Toggle push notification">
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label" id="notificationToggleLabel">Notifikasi</span>
              </div>
              <a href="#/favorite" class="btn btn-secondary" aria-label="Lihat cerita favorit">
                ❤️ Favorit
              </a>
              <a href="#/add-story" class="btn btn-secondary" aria-label="Tambah cerita baru">
                <span aria-hidden="true">+</span> Tambah Cerita
              </a>
              <button id="logoutBtn" class="btn btn-outline" aria-label="Logout dari aplikasi">
                Logout
              </button>
            </div>
          </nav>
        </header>

        <main class="main-content">
          <div id="syncStatusBanner" class="sync-status-banner" style="display:none;"></div>
          
          <section class="map-section" aria-label="Peta Indonesia dengan cerita">
            <div id="map" class="map-container" role="region" aria-label="Peta interaktif cerita daerah"></div>
          </section>

          <section class="stories-section" aria-label="Daftar cerita">
            <div class="section-header-with-sync">
              <h2>Cerita dari Berbagai Daerah</h2>
              <button id="syncButton" class="btn btn-sync" style="display:none;" aria-label="Sinkronkan data offline">
                🔄 Sync (<span id="pendingCount">0</span>)
              </button>
            </div>
            <div id="storiesContainer" class="stories-grid" role="region" aria-live="polite">
              <div class="loading">Loading cerita...</div>
            </div>
          </section>
        </main>

        <div id="messageContainer" class="message-container" role="alert" aria-live="polite"></div>
      </div>
    `;

    // Load Leaflet CSS
    this._loadLeafletCSS();

    // Initialize map dengan delay yang cukup untuk view transition
    setTimeout(() => {
      this._initializeMap();
      // Trigger callback setelah map ready
      if (this.onMapReady) {
        this.onMapReady();
      }
    }, 100);

    this._attachEventListeners();
  }

  _loadLeafletCSS() {
    if (!document.querySelector('link[href*="leaflet.min.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
  }

  _initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Destroy existing map instance if exists
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Clear markers array
    this.markers = [];

    // Create new map instance
    this.map = L.map('map').setView([-7.0, 110.0], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Fix map rendering after transition
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        // Reload pending stories jika ada
        if (this.pendingMapStories) {
          this.displayStoriesOnMap(this.pendingMapStories);
          this.pendingMapStories = null;
        }
      }
    }, 400);
  }

  displayStoriesOnMap(stories) {
    if (!this.map) {
      // Simpan stories untuk di-load nanti setelah map ready
      this.pendingMapStories = stories;
      return;
    }

    // Clear existing markers
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker);
    });
    this.markers = [];

    // Add markers for each story
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);

        const popupContent = `
          <div class="map-popup">
            <h3>${this._escapeHtml(story.name)}</h3>
            <p>${this._escapeHtml(story.description.substring(0, 100))}...</p>
            <small class="by-author">oleh ${this._escapeHtml(story.createdAt)}</small>
          </div>
        `;

        marker.bindPopup(popupContent);
        this.markers.push(marker);
      }
    });
  }

  displayStories(stories, favoriteIds = []) {
    const container = document.getElementById('storiesContainer');
    this.stories = stories; // Simpan stories untuk digunakan nanti

    if (stories.length === 0) {
      container.innerHTML = '<p class="empty-state">Belum ada cerita. Jadilah yang pertama!</p>';
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => {
          const isFavorite = favoriteIds.includes(story.id);
          return `
        <article class="story-card" data-story-id="${story.id}" aria-label="Cerita dari ${this._escapeHtml(story.name)}">
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-story-id="${story.id}" aria-label="${isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}" title="${isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}">
            ${isFavorite ? '❤️' : '🤍'}
          </button>
          ${
            story.photoUrl
              ? `<img src="${story.photoUrl}" alt="Gambar cerita: ${this._escapeHtml(story.name)}" class="story-image" />`
              : '<div class="story-image-placeholder">Tidak ada gambar</div>'
          }
          <div class="story-content">
            <h3 class="story-title">${this._escapeHtml(story.name)}</h3>
            <p class="story-description">${this._escapeHtml(story.description)}</p>
            <small class="story-meta">
              <span class="story-author">Penulis: ${this._escapeHtml(story.createdAt)}</span>
              ${
                story.lat && story.lon
                  ? `<span class="story-location" aria-label="Lokasi tersedia">📍 Lokasi: ${story.lat.toFixed(2)}, ${story.lon.toFixed(2)}</span>`
                  : ''
              }
            </small>
          </div>
        </article>
      `;
        }
      )
      .join('');

    // Attach click event listeners to story cards
    this._attachStoryCardListeners();
    this._attachFavoriteButtonListeners();
  }

  _attachStoryCardListeners() {
    const cards = document.querySelectorAll('.story-card');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Jangan trigger jika klik pada favorite button
        if (e.target.closest('.favorite-btn')) return;
        
        const storyId = card.getAttribute('data-story-id');
        const story = this.stories.find((s) => s.id === storyId);
        if (story && story.lat && story.lon) {
          this._zoomToStory(story);
        }
      });

      // Add hover effect
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.02)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
      });
    });
  }

  _attachFavoriteButtonListeners() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        const storyId = btn.getAttribute('data-story-id');
        const story = this.stories.find((s) => s.id === storyId);
        
        if (story && this._onToggleFavorite) {
          this._onToggleFavorite(story, btn);
        }
      });
    });
  }

  _zoomToStory(story) {
    if (!this.map) return;

    // Zoom ke lokasi cerita
    this.map.setView([story.lat, story.lon], 13);

    // Highlight marker
    this.markers.forEach((marker) => {
      marker.setOpacity(0.5);
    });

    // Cari dan highlight marker cerita ini
    const storyMarker = this.markers.find((marker) => {
      const latlng = marker.getLatLng();
      return latlng.lat === story.lat && latlng.lng === story.lon;
    });

    if (storyMarker) {
      storyMarker.setOpacity(1);
      storyMarker.openPopup();
    }
  }

  showLoading() {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = '<div class="loading">Memuat cerita...</div>';
  }

  hideLoading() {
    // Handled by displayStories
  }

  showError(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
  }

  showSuccess(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`;
  }

  _attachEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this._onLogoutClick();
      });
    }

    // Notification toggle event listener
    const notificationToggle = document.getElementById('notificationToggle');
    if (notificationToggle) {
      notificationToggle.addEventListener('change', (e) => {
        if (this._onNotificationToggle) {
          this._onNotificationToggle(e.target.checked);
        }
      });
    }

    // Sync button event listener
    const syncButton = document.getElementById('syncButton');
    if (syncButton) {
      syncButton.addEventListener('click', () => {
        if (this._onSyncClick) {
          this._onSyncClick();
        }
      });
    }
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  set onLogoutClick(callback) {
    this._onLogoutClick = callback;
  }

  set onNotificationToggle(callback) {
    this._onNotificationToggle = callback;
  }

  set onToggleFavorite(callback) {
    this._onToggleFavorite = callback;
  }

  /**
   * Update notification toggle UI
   */
  updateNotificationToggle(isSubscribed, isSupported = true) {
    const toggleContainer = document.getElementById('notificationToggleContainer');
    const toggle = document.getElementById('notificationToggle');
    const label = document.getElementById('notificationToggleLabel');

    if (!isSupported) {
      if (toggleContainer) toggleContainer.style.display = 'none';
      return;
    }

    if (toggleContainer) toggleContainer.style.display = 'flex';
    if (toggle) toggle.checked = isSubscribed;
    if (label) {
      label.textContent = isSubscribed ? 'Notifikasi Aktif' : 'Notifikasi';
    }
  }

  /**
   * Set loading state untuk notification toggle
   */
  setNotificationToggleLoading(loading) {
    const toggle = document.getElementById('notificationToggle');
    if (toggle) {
      toggle.disabled = loading;
    }
  }

  set onSyncClick(callback) {
    this._onSyncClick = callback;
  }

  /**
   * Update sync status banner
   */
  showSyncStatus(status) {
    const banner = document.getElementById('syncStatusBanner');
    if (!banner) return;

    const typeClass = {
      'info': 'sync-info',
      'success': 'sync-success',
      'warning': 'sync-warning',
      'error': 'sync-error',
      'progress': 'sync-progress'
    }[status.type] || 'sync-info';

    banner.className = `sync-status-banner ${typeClass}`;
    banner.textContent = status.message;
    banner.style.display = 'block';

    // Auto hide after 5 seconds except for progress
    if (status.type !== 'progress' && status.type !== 'warning') {
      setTimeout(() => {
        banner.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Update pending count
   */
  updatePendingCount(count) {
    const pendingCountEl = document.getElementById('pendingCount');
    const syncButton = document.getElementById('syncButton');

    if (pendingCountEl) {
      pendingCountEl.textContent = count;
    }

    if (syncButton) {
      syncButton.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  /**
   * Hide sync status banner
   */
  hideSyncStatus() {
    const banner = document.getElementById('syncStatusBanner');
    if (banner) {
      banner.style.display = 'none';
    }
  }
}

export default HomeView;
