/**
 * PushNotificationPresenter
 * Presenter untuk mengelola logika push notification
 */
import PushNotificationManager from '../utils/push-notification-manager.js';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api.js';

class PushNotificationPresenter {
  constructor(view) {
    this.view = view;
    this.pushManager = new PushNotificationManager();
    this.token = null;
  }

  /**
   * Inisialisasi push notification
   */
  async init(token) {
    this.token = token;

    try {
      // Cek apakah browser support push notification
      if (!PushNotificationManager.isSupported()) {
        console.log('Push notification tidak didukung di browser ini');
        this.view.updateNotificationToggle(false, false);
        return;
      }

      // Init push notification manager
      await this.pushManager.init();

      // Update UI dengan status subscription saat ini
      const isSubscribed = this.pushManager.getSubscriptionStatus();
      this.view.updateNotificationToggle(isSubscribed, true);

      // Setup toggle handler
      this.view.onNotificationToggle = async (checked) => {
        await this.handleToggle(checked);
      };

      console.log('Push notification initialized, subscribed:', isSubscribed);
    } catch (error) {
      console.error('Error initializing push notification:', error);
      this.view.updateNotificationToggle(false, false);
    }
  }

  /**
   * Handle toggle subscribe/unsubscribe
   */
  async handleToggle(shouldSubscribe) {
    this.view.setNotificationToggleLoading(true);

    try {
      if (shouldSubscribe) {
        await this.handleSubscribe();
      } else {
        await this.handleUnsubscribe();
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      
      // Revert toggle state
      const currentStatus = this.pushManager.getSubscriptionStatus();
      this.view.updateNotificationToggle(currentStatus, true);
      
      // Show error message
      this.view.showError(
        shouldSubscribe 
          ? 'Gagal mengaktifkan notifikasi. Pastikan Anda memberikan izin notifikasi.' 
          : 'Gagal menonaktifkan notifikasi.'
      );
    } finally {
      this.view.setNotificationToggleLoading(false);
    }
  }

  /**
   * Subscribe ke push notification
   */
  async handleSubscribe() {
    try {
      // Subscribe dengan callback API
      await this.pushManager.subscribe(async (subscriptionData) => {
        // Kirim subscription ke server
        await subscribePushNotification(subscriptionData, this.token);
      });

      // Update UI
      this.view.updateNotificationToggle(true, true);
      this.view.showSuccess('Notifikasi push berhasil diaktifkan!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
          messageContainer.innerHTML = '';
        }
      }, 3000);

      console.log('Successfully subscribed to push notification');
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe dari push notification
   */
  async handleUnsubscribe() {
    try {
      // Unsubscribe dengan callback API
      await this.pushManager.unsubscribe(async (subscriptionData) => {
        // Kirim unsubscribe request ke server
        await unsubscribePushNotification(subscriptionData, this.token);
      });

      // Update UI
      this.view.updateNotificationToggle(false, true);
      this.view.showSuccess('Notifikasi push berhasil dinonaktifkan.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
          messageContainer.innerHTML = '';
        }
      }, 3000);

      console.log('Successfully unsubscribed from push notification');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus() {
    return this.pushManager.getSubscriptionStatus();
  }
}

export default PushNotificationPresenter;
