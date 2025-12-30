/**
 * AddStoryView
 * View untuk halaman menambah cerita baru
 */
import L from 'leaflet';

class AddStoryView {
  constructor() {
    this.app = document.getElementById('app');
    this.map = null;
    this.selectedLocation = null;
  }

  render() {
    this.app.innerHTML = `
      <div class="add-story-container fade-in">
        <header class="navbar" role="banner">
          <nav class="navbar-content" aria-label="Navigasi">
            <h1 class="navbar-title">Tambah Cerita Baru</h1>
            <div class="navbar-actions">
              <a href="#/favorite" class="btn btn-secondary" aria-label="Lihat cerita favorit">
                ❤️ Favorit
              </a>
              <a href="#/home" class="btn btn-outline" aria-label="Kembali ke beranda">Kembali</a>
            </div>
          </nav>
        </header>

        <main class="main-content">
          <section class="form-section" aria-label="Form tambah cerita">
            <div class="form-wrapper">
              <h2>Bagikan Cerita Daerahmu</h2>

              <form id="addStoryForm" class="add-story-form" novalidate>
                <fieldset>
                  <legend>Informasi Cerita</legend>

                  <div class="form-group">
                    <label for="storyName" class="form-label">Nama Cerita</label>
                    <input
                      type="text"
                      id="storyName"
                      name="storyName"
                      class="form-control"
                      placeholder="Berikan judul cerita yang menarik"
                      required
                      aria-describedby="storyNameHelp"
                    />
                    <small id="storyNameHelp" class="form-text">Contoh: Batik Pekalongan, Wayang Kulit Yogyakarta</small>
                  </div>

                  <div class="form-group">
                    <label for="storyDescription" class="form-label">Deskripsi Cerita</label>
                    <textarea
                      id="storyDescription"
                      name="storyDescription"
                      class="form-control form-textarea"
                      placeholder="Ceritakan tentang daerah, budaya, atau keunikan yang ingin Anda bagikan"
                      rows="6"
                      required
                      aria-describedby="storyDescriptionHelp"
                    ></textarea>
                    <small id="storyDescriptionHelp" class="form-text">Minimum 20 karakter</small>
                  </div>

                  <div class="form-group">
                    <label for="storyPhoto" class="form-label">Upload Foto</label>
                    <input
                      type="file"
                      id="storyPhoto"
                      name="storyPhoto"
                      class="form-control"
                      accept="image/*"
                      required
                      aria-describedby="storyPhotoHelp"
                    />
                    <small id="storyPhotoHelp" class="form-text">Format: JPG, PNG. Ukuran maksimal: 1MB</small>
                  </div>

                  <div id="photoPreview" class="photo-preview" role="region" aria-label="Preview foto"></div>
                </fieldset>

                <fieldset>
                  <legend>Lokasi Cerita</legend>

                  <p class="location-instruction" role="complementary">
                    <strong>Klik pada peta</strong> untuk memilih lokasi cerita Anda
                  </p>

                  <div id="mapSmall" class="map-container-small" role="region" aria-label="Peta untuk memilih lokasi"></div>

                  <div class="location-info" role="status" aria-live="polite">
                    <div class="form-group">
                      <label for="latitude" class="form-label">Latitude</label>
                      <input
                        type="text"
                        id="latitude"
                        name="latitude"
                        class="form-control"
                        placeholder="Klik peta untuk mendapatkan koordinat"
                        readonly
                        aria-describedby="latitudeHelp"
                      />
                      <small id="latitudeHelp" class="form-text">Akan terisi otomatis saat Anda klik peta</small>
                    </div>

                    <div class="form-group">
                      <label for="longitude" class="form-label">Longitude</label>
                      <input
                        type="text"
                        id="longitude"
                        name="longitude"
                        class="form-control"
                        placeholder="Klik peta untuk mendapatkan koordinat"
                        readonly
                        aria-describedby="longitudeHelp"
                      />
                      <small id="longitudeHelp" class="form-text">Akan terisi otomatis saat Anda klik peta</small>
                    </div>
                  </div>
                </fieldset>

                <button type="submit" class="btn btn-primary btn-block" aria-label="Tombol Posting Cerita">
                  Posting Cerita
                </button>
              </form>

              <div id="messageContainer" class="message-container" role="alert" aria-live="polite"></div>
            </div>
          </section>
        </main>
      </div>
    `;

    // Load Leaflet CSS
    this._loadLeafletCSS();

    // Initialize map
    setTimeout(() => {
      this._initializeMap();
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
    const mapContainer = document.getElementById('mapSmall');
    if (!mapContainer) return;

    // Destroy existing map instance if exists
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }

    // Create new map instance
    this.map = L.map('mapSmall').setView([-7.0, 110.0], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Add click event to map
    this.map.on('click', (e) => {
      this._onMapClick(e);
    });

    // Fix map rendering after transition
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  _onMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Update input fields
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    // Store selected location
    this.selectedLocation = { lat, lng };

    // Update map marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.textContent = `Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  _attachEventListeners() {
    const form = document.getElementById('addStoryForm');
    const photoInput = document.getElementById('storyPhoto');

    photoInput.addEventListener('change', (e) => {
      this._handlePhotoUpload(e);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleFormSubmit();
    });
  }

  _handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      this.showError('File harus berupa gambar');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      this.showError('Ukuran file tidak boleh lebih dari 1MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewContainer = document.getElementById('photoPreview');
      previewContainer.innerHTML = `
        <div class="preview-item">
          <img src="${event.target.result}" alt="Preview foto cerita" class="preview-image" />
          <small>${file.name}</small>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  _handleFormSubmit() {
    const storyName = document.getElementById('storyName').value;
    const storyDescription = document.getElementById('storyDescription').value;
    const storyPhoto = document.getElementById('storyPhoto');
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    if (!this._validateForm(storyName, storyDescription, storyPhoto, latitude, longitude)) {
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('description', storyDescription);
    formData.append('photo', storyPhoto.files[0]);
    formData.append('lat', latitude);
    formData.append('lon', longitude);

    this._onAddStorySubmit(formData);
  }

  _validateForm(name, description, photoInput, latitude, longitude) {
    if (!name || !description) {
      this.showError('Nama dan deskripsi cerita harus diisi');
      return false;
    }

    if (name.length < 5) {
      this.showError('Nama cerita minimal 5 karakter');
      return false;
    }

    if (description.length < 20) {
      this.showError('Deskripsi cerita minimal 20 karakter');
      return false;
    }

    if (!photoInput.files || photoInput.files.length === 0) {
      this.showError('Foto harus diunggah');
      return false;
    }

    if (!latitude || !longitude) {
      this.showError('Lokasi harus dipilih dengan mengklik peta');
      return false;
    }

    return true;
  }

  showLoading() {
    const container = document.getElementById('messageContainer');
    container.innerHTML = '<div class="loading">Mengunggah cerita...</div>';
  }

  hideLoading() {
    const container = document.getElementById('messageContainer');
    container.innerHTML = '';
  }

  showError(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
  }

  showSuccess(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`;
  }

  set onAddStorySubmit(callback) {
    this._onAddStorySubmit = callback;
  }
}

export default AddStoryView;
