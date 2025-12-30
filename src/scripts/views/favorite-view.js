/**
 * FavoriteView
 * View untuk halaman cerita favorit
 */
class FavoriteView {
  constructor() {
    this.app = document.getElementById('app');
    this.favorites = [];
  }

  render() {
    this.app.innerHTML = `
      <div class="favorite-container fade-in">
        <header class="navbar" role="banner">
          <nav class="navbar-content" aria-label="Navigasi utama">
            <h1 class="navbar-title">Cerita Nusantara</h1>
            <div class="navbar-actions">
              <a href="#/home" class="btn btn-secondary" aria-label="Kembali ke home">
                🏠 Home
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
          <section class="favorite-section" aria-label="Cerita Favorit">
            <div class="section-header">
              <h2>Cerita Favorit</h2>
              <p class="section-description">Daftar cerita yang telah Anda simpan</p>
            </div>
            
            <div class="favorite-actions">
              <button id="refreshBtn" class="btn btn-secondary">
                🔄 Refresh
              </button>
              <button id="clearAllBtn" class="btn btn-outline" style="display:none;">
                🗑️ Hapus Semua
              </button>
            </div>

            <div class="favorite-stats">
              <p id="favoriteCount">Total: <strong>0</strong> cerita favorit</p>
            </div>

            <div id="favoritesContainer" class="stories-grid" role="region" aria-live="polite">
              <div class="empty-state">
                <div class="empty-icon">📪</div>
                <h3>Belum ada cerita favorit</h3>
                <p>Tambahkan cerita favorit dengan menekan tombol ❤️ pada halaman home</p>
                <a href="#/home" class="btn btn-primary">Kembali ke Home</a>
              </div>
            </div>
          </section>
        </main>

        <div id="messageContainer" class="message-container" role="alert" aria-live="polite"></div>
      </div>
    `;

    this._attachEventListeners();
  }

  displayFavorites(favorites) {
    const container = document.getElementById('favoritesContainer');
    const countElement = document.getElementById('favoriteCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    this.favorites = favorites;

    if (countElement) {
      countElement.innerHTML = `Total: <strong>${favorites.length}</strong> cerita favorit`;
    }

    if (clearAllBtn) {
      clearAllBtn.style.display = favorites.length > 0 ? 'inline-block' : 'none';
    }

    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📪</div>
          <h3>Belum ada cerita favorit</h3>
          <p>Tambahkan cerita favorit dengan menekan tombol ❤️ pada halaman home</p>
          <a href="#/home" class="btn btn-primary">Kembali ke Home</a>
        </div>
      `;
      return;
    }

    container.innerHTML = favorites
      .map(
        (story) => `
        <article class="story-card favorite-card" data-story-id="${story.id}" aria-label="Cerita dari ${this._escapeHtml(story.name)}">
          <button class="favorite-btn active" data-story-id="${story.id}" aria-label="Hapus dari favorit">
            ❤️
          </button>
          ${
            story.photoUrl
              ? `<img src="${story.photoUrl}" alt="Gambar cerita: ${this._escapeHtml(story.name)}" class="story-image" loading="lazy" />`
              : '<div class="story-image-placeholder">Tidak ada gambar</div>'
          }
          <div class="story-content">
            <h3 class="story-title">${this._escapeHtml(story.name)}</h3>
            <p class="story-description">${this._escapeHtml(story.description)}</p>
            <small class="story-meta">
              <span class="story-date">📅 ${this._formatDate(story.createdAt)}</span>
              ${
                story.lat && story.lon
                  ? `<span class="story-location" aria-label="Lokasi tersedia">📍 ${story.lat.toFixed(2)}, ${story.lon.toFixed(2)}</span>`
                  : ''
              }
            </small>
          </div>
        </article>
      `
      )
      .join('');

    this._attachFavoriteListeners();
  }

  _attachEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (this._onLogoutClick) {
          this._onLogoutClick();
        }
      });
    }

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (this._onRefresh) {
          this._onRefresh();
        }
      });
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua cerita favorit?')) {
          if (this._onClearAll) {
            this._onClearAll();
          }
        }
      });
    }
  }

  _attachFavoriteListeners() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = btn.getAttribute('data-story-id');
        if (this._onRemoveFavorite) {
          this._onRemoveFavorite(storyId);
        }
      });
    });
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  showLoading() {
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '<div class="loading">Memuat cerita favorit...</div>';
  }

  showError(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
  }

  showSuccess(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`;
    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  set onLogoutClick(callback) {
    this._onLogoutClick = callback;
  }

  set onRefresh(callback) {
    this._onRefresh = callback;
  }

  set onClearAll(callback) {
    this._onClearAll = callback;
  }

  set onRemoveFavorite(callback) {
    this._onRemoveFavorite = callback;
  }
}

export default FavoriteView;
