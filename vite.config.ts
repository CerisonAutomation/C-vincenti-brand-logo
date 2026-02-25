import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    h3: true, // HTTP/3 support
    headers: mode === 'production' ? {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.clerk.com https://*.supabase.co https://*.clerk.accounts.dev; frame-src 'none';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'public, max-age=31536000, immutable'
    } : {},
  },
  plugins: [
    react({}),
    ViteImageOptimizer(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|woff2|woff|ttf|eot|css|js)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance Budget: initialJS < 150KB, totalJS < 500KB, LCP < 2.5s, FID < 100ms, CLS < 0.1
    assetsInlineLimit: 4096, // 4KB - inline small images
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep React in main bundle to prevent hook timing issues
            if (/react/.test(id)) return undefined;

            // UI library (RADIX is HUGE - split each component)
            if (/@radix-ui/.test(id)) {
              const component = id.match(/@radix-ui\/react-(\w+)/)?.[1];
              return `radix-${component}`;
            }
            // Heavy libraries
            if (/recharts|framer-motion/.test(id)) return 'heavy-vendor';
            // Other vendors
            if (/lucide-react/.test(id)) return 'icons-vendor';
            if (/@tanstack/.test(id)) return 'query-vendor';
            return 'vendor';
          }
          // App code: Split by feature
          if (/pages\/Admin/.test(id)) return 'admin';
          if (/pages\/Properties/.test(id)) return 'properties';
        },
        assetFileNames: (asset) => {
          const ext = asset.name?.split('.').pop();
          if (!ext) return '[name]-[hash][extname]';
          // Auto-convert to webp/avif at build time via ViteImageOptimize
          if (['png', 'jpg', 'jpeg'].includes(ext)) {
            return `images/[name]-[hash].webp`;
          }
          return `[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 100, // Warn at 100KB instead of 500KB
  },
}));
