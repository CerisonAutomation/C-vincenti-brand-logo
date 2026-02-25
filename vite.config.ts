import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

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
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(), picture-in-picture=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.clerk.com https://*.supabase.co https://*.clerk.accounts.dev https://*.stripe.com wss://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Cache-Control': 'public, max-age=31536000, immutable',
    } : {},
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    ViteImageOptimizer(),
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
    ...(mode === "development" ? [componentTagger()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 4096, // 4KB - inline small images
    cssCodeSplit: true,
    performance: {
      hints: 'warning',
      maxAssetSize: 100 * 1024, // 100KB - assets (VITE EXPERT RULES)
      maxEntrypointSize: 100 * 1024, // 100KB - initial JS (VITE EXPERT RULES)
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep React minimal for faster hydration
            if (/react/.test(id)) return 'react-core';

            // Aggressive UI framework splitting - split each component library
            if (/@radix-ui/.test(id)) {
              const component = id.match(/@radix-ui\/react-(\w+)/)?.[1];
              return `radix-${component}`;
            }

            // Heavy libraries - isolate completely
            if (/framer-motion/.test(id)) return 'framer-motion-vendor';
            if (/recharts/.test(id)) return 'recharts-vendor';
            if (/leaflet/.test(id)) return 'leaflet-vendor';
            if (/three/.test(id)) return 'three-vendor';

            // Utility libraries - group by function
            if (/lucide-react/.test(id)) return 'icons-vendor';
            if (/@tanstack/.test(id)) return 'query-vendor';
            if (/@supabase/.test(id)) return 'supabase-vendor';
            if (/@clerk/.test(id)) return 'clerk-vendor';
            if (/@sentry/.test(id)) return 'sentry-vendor';

            return 'vendor';
          }

          // Aggressive page-level splitting
          if (/pages\/Admin/.test(id)) return 'admin-pages';
          if (/pages\/PricingPage/.test(id)) return 'pricing-pages';
          if (/pages\/Properties/.test(id)) return 'properties-pages';
          if (/pages\/(QuotesPage|ReservationsPage)/.test(id)) return 'admin-portal';
          if (/pages\/(Checkout|Book)/.test(id)) return 'booking-flow';

          // Template system splitting - split by feature blocks
          if (/components\/templates\/.*Template/.test(id)) return 'page-templates';
          if (/components\/blocks\/HeroBlock/.test(id)) return 'block-hero';
          if (/components\/blocks\/(FeatureBlock|PricingBlock|GalleryBlock)/.test(id)) return 'block-content-heavy';
          if (/components\/blocks\/(ContentBlock|StatsBlock|TestimonialBlock)/.test(id)) return 'block-content-light';
          if (/components\/blocks\/(FAQBlock|ContactBlock|NewsletterBlock)/.test(id)) return 'block-interactive';
          if (/components\/blocks\/(VideoBlock|MapBlock|TimelineBlock)/.test(id)) return 'block-media';
          if (/components\/blocks\/(TeamBlock|QuoteBlock|BlogBlock)/.test(id)) return 'block-specialized';

          // Loading and animation systems
          if (/components\/AmazingLoader/.test(id)) return 'loader-system';
          if (/components\/skeletons\//.test(id)) return 'skeleton-system';

          // Hook utilities
          if (/hooks\/useAIRecommendations/.test(id)) return 'ai-hooks';
          if (/hooks\/useOfflineSync/.test(id)) return 'sync-hooks';
          if (/hooks\/admin-hooks/.test(id)) return 'admin-hooks';
        },
        assetFileNames: (asset) => {
          const ext = asset.name?.split('.').pop();
          if (!ext) return '[name]-[hash][extname]';
          if (['png', 'jpg', 'jpeg'].includes(ext)) {
            return `images/[name]-[hash].webp`;
          }
          return `[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 100, // Warn at 100KB instead of 500KB
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    minify: 'esbuild', // Use esbuild for faster, smaller bundles
    target: 'es2020', // Modern browsers for better optimization
  },
}));
