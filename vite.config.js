import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

const r = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      scope: '/social',
      base: '/',
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png'
      ],
      manifest: {
        id: '/social',
        name: 'GEA Social',
        short_name: 'GEA Social',
        description: 'Red social de sostenibilidad y reciclaje — GEA-WRC',
        theme_color: '#111110',
        background_color: '#0b0e14',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay', 'minimal-ui'],
        orientation: 'portrait',
        scope: '/social',
        start_url: '/social/feed',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,woff,woff2,png,svg,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^\/social/],
        navigateFallbackDenylist: [/^\/company/, /^\/central/, /^\/api/, /^\/sanctum/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'social-media-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html'
      }
    })
  ],

  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: ['.sslip.io', '.local'],
    hmr: {
      clientPort: 5173
    }
  },

  css: {
    minify: false
  },

  build: {
    target: 'esnext',
    modulePreload: false,
    cssMinify: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'INVALID_ANNOTATION') return;
        if (warning.code === 'INEFFECTIVE_DYNAMIC_IMPORT') return;
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/pinia') ||
            id.includes('node_modules/vue-router')
          ) {
            return 'vendor';
          }
        }
      }
    }
  },

  define: { global: 'globalThis' },

  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],

  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': r('./src'),

      '@api': r('./src/config/api'),
      '@http': r('./src/config/api'),
      '@config': r('./src/config'),

      '@layouts': r('./src/layouts'),
      '@shared': r('./src/shared'),
      '@router': r('./src/router'),

      '@social': r('./src/contexts/social'),
      '@member': r('./src/contexts/member'),
      '@central': r('./src/contexts/central'),
      '@company': r('./src/contexts/company'),
      '@landing': r('./src/contexts/landing'),
      '@error': r('./src/contexts/error'),
      '@client': r('./src/contexts/client'),

      '@authSocial': r('./src/contexts/social/auth'),
      '@authMember': r('./src/contexts/member/auth'),
      '@authCentral': r('./src/contexts/central/auth'),
      '@authCompany': r('./src/contexts/company/auth'),
      '@authLanding': r('./src/contexts/landing/auth'),
      '@authClient': r('./src/contexts/client/auth'),

      '@img': r('./src/assets/img'),
      '@css': r('./src/assets/css'),
      '@assets': r('./src/assets'),

      '@globalStores': r('./src/stores'),
      '@globalServices': r('./src/services'),
      '@globalHelpers': r('./src/shared/helpers'),
      '@globalComponents': r('./src/shared/components'),
      '@globalComposables': r('./src/shared/composables')
    }
  }
}));
