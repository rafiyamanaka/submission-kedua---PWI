/**
 * RegisterView
 * View untuk halaman registrasi
 */
class RegisterView {
  constructor() {
    this.app = document.getElementById('app');
  }

  render() {
    this.app.innerHTML = `
      <div class="auth-container fade-in">
        <section class="auth-section" aria-label="Halaman Registrasi">
          <div class="auth-header">
            <h1>Cerita Nusantara</h1>
            <p class="subtitle">Daftar untuk Berbagi Cerita</p>
          </div>

          <form id="registerForm" class="auth-form" novalidate>
            <div class="form-group">
              <label for="name" class="form-label">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                class="form-control"
                placeholder="Masukkan nama lengkap"
                required
                aria-describedby="nameHelp"
              />
              <small id="nameHelp" class="form-text">Nama akan ditampilkan di profil Anda</small>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-control"
                placeholder="Masukkan email Anda"
                required
                aria-describedby="emailHelp"
              />
              <small id="emailHelp" class="form-text">Gunakan email yang valid dan belum terdaftar</small>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Kata Sandi</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-control"
                placeholder="Masukkan kata sandi"
                required
                aria-describedby="passwordHelp"
              />
              <small id="passwordHelp" class="form-text">Minimal 8 karakter</small>
            </div>

            <div class="form-group">
              <label for="passwordConfirm" class="form-label">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                class="form-control"
                placeholder="Ulangi kata sandi"
                required
                aria-describedby="passwordConfirmHelp"
              />
              <small id="passwordConfirmHelp" class="form-text">Pastikan kata sandi sama dengan di atas</small>
            </div>

            <button type="submit" class="btn btn-primary btn-block" aria-label="Tombol Daftar">
              Daftar
            </button>
          </form>

          <div class="auth-footer">
            <p>Sudah punya akun? <a href="#/login" aria-label="Pergi ke halaman login">Login di sini</a></p>
          </div>

          <div id="messageContainer" class="message-container" role="alert" aria-live="polite"></div>
        </section>
      </div>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;

      if (this._validateForm(name, email, password, passwordConfirm)) {
        this._onRegisterSubmit(name, email, password, passwordConfirm);
      }
    });
  }

  _validateForm(name, email, password, passwordConfirm) {
    if (!name || !email || !password || !passwordConfirm) {
      this.showError('Semua field harus diisi');
      return false;
    }

    if (name.length < 3) {
      this.showError('Nama minimal 3 karakter');
      return false;
    }

    if (!this._isValidEmail(email)) {
      this.showError('Format email tidak valid');
      return false;
    }

    if (password.length < 8) {
      this.showError('Password minimal 8 karakter');
      return false;
    }

    if (password !== passwordConfirm) {
      this.showError('Password tidak cocok');
      return false;
    }

    return true;
  }

  _isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showLoading() {
    const container = document.getElementById('messageContainer');
    container.innerHTML = '<div class="loading">Loading...</div>';
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

  set onRegisterSubmit(callback) {
    this._onRegisterSubmit = callback;
  }
}

export default RegisterView;
