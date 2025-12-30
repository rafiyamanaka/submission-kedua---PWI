# Cerita Nusantara - Story Sharing Application

Aplikasi web untuk berbagi cerita daerah, budaya, dan keunikan Indonesia dengan fitur peta interaktif dan push notification.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Push Notification](#push-notification)

## Features

✨ **Core Features:**
- 🔐 User authentication (Register & Login)
- 📝 Create and share stories with photos
- 🗺️ Interactive map with story locations (Leaflet.js)
- 📍 Geolocation support for stories
- 🔔 **Push Notification** for new stories
- 📱 Responsive design for all devices
- ⚡ Fast page transitions with View Transition API

✨ **Push Notification Features:**
- 🔔 Toggle switch to enable/disable notifications
- 📲 Browser notification permission handling
- 🎯 Action buttons in notifications (View Story, Close)
- 🧭 Click notification to navigate to story
- 🔄 Subscription management
- ✅ Browser compatibility check

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 12 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone atau download repository ini
2. Install dependencies:
   ```shell
   npm install
   ```

## Scripts

- Build for Production:
  ```shell
  npm run build
  ```
  Script ini menjalankan webpack dalam mode production menggunakan konfigurasi `webpack.prod.js` dan menghasilkan sejumlah file build ke direktori `dist`.

- Start Development Server:
  ```shell
  npm run start-dev
  ```
  Script ini menjalankan server pengembangan webpack dengan fitur live reload dan mode development sesuai konfigurasi di`webpack.dev.js`.

- Serve:
  ```shell
  npm run serve
  ```
  Script ini menggunakan [`http-server`](https://www.npmjs.com/package/http-server) untuk menyajikan konten dari direktori `dist`.

## Project Structure

```text
submission-proyek-kedua/
├── dist/                   # Compiled files for production
├── src/                    # Source project files
│   ├── public/             # Public files
│   │   ├── images/         # Image assets
│   │   ├── favicon.png     # Favicon
│   │   └── manifest.json   # PWA manifest
│   ├── scripts/            # Source JavaScript files
│   │   ├── data/           # API layer
│   │   │   └── api.js      # API endpoints
│   │   ├── models/         # Data models
│   │   │   ├── auth-model.js
│   │   │   └── story-model.js
│   │   ├── presenters/     # Business logic
│   │   │   ├── auth-presenter.js
│   │   │   ├── story-presenter.js
│   │   │   └── push-notification-presenter.js
│   │   ├── routes/         # Routing
│   │   │   ├── routes.js
│   │   │   └── url-parser.js
│   │   ├── utils/          # Utilities
│   │   │   ├── index.js
│   │   │   ├── url-parser.js
│   │   │   └── push-notification-manager.js
│   │   ├── views/          # UI components
│   │   │   ├── login-view.js
│   │   │   ├── register-view.js
│   │   │   ├── home-view.js
│   │   │   └── add-story-view.js
│   │   ├── app.js          # Main app router
│   │   ├── config.js       # Configuration
│   │   └── index.js        # Entry point
│   ├── styles/             # Source CSS files
│   │   └── styles.css      # Main CSS file
│   ├── sw.js              # Service Worker for push notifications
│   └── index.html          # Main HTML file
├── package.json            # Project metadata and dependencies
├── webpack.common.js       # Webpack common configuration
├── webpack.dev.js          # Webpack development configuration
├── webpack.prod.js         # Webpack production configuration
├── README.md               # Project documentation
└── PUSH_NOTIFICATION.md    # Push notification documentation
```

## Push Notification

Aplikasi ini mengimplementasikan Push Notification menggunakan Web Push API dan Service Worker.

### Cara Menggunakan Push Notification

1. **Login** ke aplikasi
2. Di halaman **Home**, Anda akan melihat toggle switch "Notifikasi" di navbar
3. **Klik toggle** untuk mengaktifkan push notification
4. Browser akan meminta **permission** - klik "Allow/Izinkan"
5. Notifikasi akan muncul ketika ada story baru dibuat
6. **Klik notifikasi** untuk membuka aplikasi dan melihat story

### Fitur Push Notification

- ✅ Toggle button untuk enable/disable subscription
- ✅ Browser permission handling
- ✅ Service Worker untuk handle push events
- ✅ Notification actions (View Story, Close)
- ✅ Click notification untuk navigasi ke detail
- ✅ Subscribe/Unsubscribe via API
- ✅ VAPID authentication
- ✅ Browser compatibility check

### Technical Details

**VAPID Public Key:**
```
BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk
```

**API Endpoints:**
- Subscribe: `POST /notifications/subscribe`
- Unsubscribe: `DELETE /notifications/subscribe`

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ⚠️ Limited (iOS 16.4+)
- Opera: ✅ Full support

### Troubleshooting

**Notification tidak muncul?**
- Cek permission di browser settings
- Pastikan menggunakan HTTPS atau localhost
- Cek console untuk error messages

**Toggle tidak muncul?**
- Browser mungkin tidak support push notification
- Pastikan sudah login
- Cek console untuk compatibility issues

Untuk dokumentasi lengkap, lihat [PUSH_NOTIFICATION.md](PUSH_NOTIFICATION.md)

## Technologies Used

- **Webpack** - Module bundler
- **Leaflet.js** - Interactive maps
- **Service Worker** - Push notifications & offline support
- **Web Push API** - Push notification functionality
- **View Transition API** - Smooth page transitions
- **Local Storage** - Authentication token storage

## License

ISC

---

Dibuat untuk submission Proyek Akhir Dicoding - Belajar Progressive Web Intermediate
