/**
 * AuthPresenter
 * Presenter untuk mengelola logika autentikasi
 */
class AuthPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async handleRegister(name, email, password, passwordConfirm) {
    if (password !== passwordConfirm) {
      this.view.showError('Password tidak cocok');
      return;
    }

    this.view.showLoading();

    try {
      const result = await this.model.register(name, email, password);
      this.view.hideLoading();
      this.view.showSuccess('Registrasi berhasil, silahkan login');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2000);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }

  async handleLogin(email, password) {
    this.view.showLoading();

    try {
      const result = await this.model.login(email, password);
      this.view.hideLoading();
      this.view.showSuccess('Login berhasil');
      setTimeout(() => {
        window.location.hash = '#/home';
      }, 1500);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }

  handleLogout() {
    this.model.logout();
    this.view.showSuccess('Anda telah logout');
    setTimeout(() => {
      window.location.hash = '#/login';
    }, 1000);
  }

  isAuthenticated() {
    return this.model.isAuthenticated();
  }

  getCurrentUser() {
    return this.model.getCurrentUser();
  }
}

export default AuthPresenter;
