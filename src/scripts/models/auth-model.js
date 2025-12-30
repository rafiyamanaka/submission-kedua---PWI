/**
 * AuthModel
 * Model untuk mengelola autentikasi pengguna
 */
import CONFIG from '../config';

class AuthModel {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.currentUser = this._loadUserFromStorage();
  }

  async register(name, email, password) {
    try {
      const url = `${this.baseUrl}/register`;
      console.log('Register URL:', url);
      console.log('Request payload:', { name, email, password });

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log('Register response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register error details:', error);
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Gagal menghubungi server. Pastikan jaringan Anda aktif dan API server dapat diakses.');
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // Simpan token dan user info
      this.currentUser = {
        userId: data.loginResult.userId,
        name: data.loginResult.name,
        token: data.loginResult.token,
      };

      localStorage.setItem('user', JSON.stringify(this.currentUser));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Gagal menghubungi server. Pastikan jaringan Anda aktif.');
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return this.currentUser !== null && this.currentUser.token !== undefined;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken() {
    return this.currentUser?.token || null;
  }

  _loadUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default AuthModel;
