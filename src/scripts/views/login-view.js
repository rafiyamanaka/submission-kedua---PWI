/**
 * LoginView
 * View untuk halaman login
 */
class LoginView {
  constructor() {
    this.app = document.getElementById('app');
  }

  render() {
    this.app.innerHTML = `
      <div class="auth-container fade-in">
        <section class="auth-section" aria-label="Halaman Login">
          <div class="auth-header">
            <h1>Cerita Nusantara</h1>
            <p class="subtitle">Bagikan Cerita Daerahmu</p>
          </div>

          <form id="loginForm" class="auth-form" novalidate>
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
              <small id="emailHelp" class="form-text">Gunakan email yang valid</small>
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

            <button type="submit" class="btn btn-primary btn-block" aria-label="Tombol Login">
              Login
            </button>
          </form>

          <div class="auth-footer">
            <p>Belum punya akun? <a href="#/register" aria-label="Pergi ke halaman registrasi">Daftar di sini</a></p>
          </div>

          <div id="messageContainer" class="message-container" role="alert" aria-live="polite"></div>
        </section>
      </div>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (this._validateForm(email, password)) {
        this._onLoginSubmit(email, password);
      }
    });
  }

  _validateForm(email, password) {
    if (!email || !password) {
      this.showError('Email dan password harus diisi');
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

  set onLoginSubmit(callback) {
    this._onLoginSubmit = callback;
  }
}

export default LoginView;
