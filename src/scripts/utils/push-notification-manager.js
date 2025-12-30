/**
 * Push Notification Manager
 * Mengelola subscription dan unsubscription push notification
 */

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

class PushNotificationManager {
  constructor() {
    this.swRegistration = null;
    this.isSubscribed = false;
  }

  /**
   * Inisialisasi push notification manager
   */
  async init() {
    try {
      // Cek apakah browser support service worker dan push notification
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker tidak didukung di browser ini');
        return false;
      }

      if (!('PushManager' in window)) {
        console.warn('Push notification tidak didukung di browser ini');
        return false;
      }

      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.swRegistration);

      // Cek subscription status
      await this.checkSubscriptionStatus();

      return true;
    } catch (error) {
      console.error('Error initializing push notification:', error);
      return false;
    }
  }

  /**
   * Cek status subscription saat ini
   */
  async checkSubscriptionStatus() {
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      this.isSubscribed = subscription !== null;
      return this.isSubscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Subscribe ke push notification
   */
  async subscribe(apiSubscribeCallback) {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission tidak diberikan');
      }

      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('Push subscription:', subscription);

      // Kirim subscription ke server
      const subscriptionJson = subscription.toJSON();
      
      if (apiSubscribeCallback) {
        await apiSubscribeCallback({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth
          }
        });
      }

      this.isSubscribed = true;
      return true;
    } catch (error) {
      console.error('Error subscribing to push notification:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe dari push notification
   */
  async unsubscribe(apiUnsubscribeCallback) {
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('Tidak ada subscription aktif');
        return true;
      }

      const subscriptionJson = subscription.toJSON();

      // Unsubscribe di browser
      await subscription.unsubscribe();

      // Kirim unsubscribe request ke server
      if (apiUnsubscribeCallback) {
        await apiUnsubscribeCallback({
          endpoint: subscriptionJson.endpoint
        });
      }

      this.isSubscribed = false;
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notification:', error);
      throw error;
    }
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus() {
    return this.isSubscribed;
  }

  /**
   * Convert VAPID key dari base64 ke Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Cek apakah browser support push notification
   */
  static isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Cek permission status
   */
  static getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

export default PushNotificationManager;
