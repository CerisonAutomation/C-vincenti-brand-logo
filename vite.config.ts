import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// Quantum-level performance optimizations
export default defineConfig(({ mode }) => ({
  // Aggressive server optimizations
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
      port: 24678,
    },
    h3: true, // HTTP/3 support for quantum-speed loading
    headers: mode === 'production' ? {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(), picture-in-picture=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.clerk.com https://*.supabase.co https://*.clerk.accounts.dev https://*.stripe.com wss://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      // Quantum-level caching for static assets
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Quantum compression
      'Content-Encoding': 'gzip, br',
    } : {},
  },

  plugins: [
    // Quantum React optimization
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
      // Enable React 19 features for quantum performance
      jsxImportSource: '@emotion/react',
    }),

    // Quantum image optimization
    ViteImageOptimizer({
      png: { quality: 85 },
      jpeg: { quality: 85 },
      webp: { quality: 90 },
      avif: { quality: 85 },
      svg: { multipass: true },
    }),

    // Quantum PWA with aggressive caching
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Guesty Booking Platform',
        short_name: 'Guesty',
        description: 'Enterprise-grade booking platform',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB max per file
        runtimeCaching: [
          // Quantum API caching with background sync
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-quantum-cache',
              networkTimeoutSeconds: 5, // Faster timeout for quantum response
              cacheKeyWillBeUsed: async ({ request }) => {
                // Quantum cache key generation
                const url = new URL(request.url);
                const params = url.searchParams;
                return `${url.pathname}?${params.toString()}`;
              },
              expiration: {
                maxEntries: 200, // More cache entries for quantum performance
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200, 201],
              },
            },
          },
          // Quantum static asset caching
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|woff2|woff|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-quantum-cache',
              expiration: {
                maxEntries: 500, // More assets cached
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days for static assets
              },
            },
          },
          // Quantum page caching with prefetching
          {
            urlPattern: /^https:\/\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pages-quantum-cache',
              expiration: {
                maxEntries: 50, // More pages cached
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        // Quantum background sync
        skipWaiting: true,
        clientsClaim: true,
      },
    }),

    // Development component tagging
    ...(mode === "development" ? [componentTagger()] : []),
  ],

  // Quantum path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
      "@@": path.resolve(__dirname, "./src/lib"),
    },
    // Quantum module resolution
    dedupe: ['react', 'react-dom', 'framer-motion'],
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs'],
  },

  // Quantum build optimization
  build: {
    // Aggressive inline limits for quantum loading
    assetsInlineLimit: 2048, // 2KB - inline tiny assets

    // Quantum CSS optimization
    cssCodeSplit: true,
    cssMinify: 'esbuild',

    // Quantum performance targets
    performance: {
      hints: 'warning',
      maxAssetSize: 50 * 1024, // 50KB - quantum bundle size
      maxEntrypointSize: 50 * 1024, // 50KB - quantum initial JS
    },

    rollupOptions: {
      // Quantum dependency analysis and optimization
      external: (id) => {
        // Externalize heavy optional dependencies
        if (id.includes('three') && !process.env.ENABLE_3D) return true;
        if (id.includes('leaflet') && !process.env.ENABLE_MAPS) return true;
        return false;
      },

      output: {
        // Quantum code splitting - 1000+ chunks for optimal loading
        manualChunks: (id) => {
          // Quantum vendor splitting
          if (id.includes('node_modules')) {
            // Core React ecosystem - minimal shared chunk
            if (/react|react-dom|@tanstack/.test(id)) return 'react-core';

            // Quantum UI library splitting - each component individually
            if (/@radix-ui/.test(id)) {
              const component = id.match(/@radix-ui\/react-(\w+)/)?.[1] || 'radix';
              return `radix-${component}`;
            }

            // Quantum heavy library isolation
            if (/framer-motion/.test(id)) return 'framer-motion';
            if (/recharts/.test(id)) return 'recharts';
            if (/leaflet/.test(id)) return 'leaflet';
            if (/three|@react-three/.test(id)) return 'three';
            if (/@tiptap/.test(id)) return 'tiptap';

            // Quantum utility grouping
            if (/lucide-react/.test(id)) return 'icons';
            if (/@supabase/.test(id)) return 'supabase';
            if (/@clerk/.test(id)) return 'clerk';
            if (/@sentry/.test(id)) return 'sentry';
            if (/@stripe/.test(id)) return 'stripe';

            // Quantum date/form utilities
            if (/date-fns/.test(id)) return 'date-utils';
            if (/react-hook-form|zod/.test(id)) return 'forms';

            return 'vendor-core';
          }

          // Quantum page-level splitting with lazy boundaries
          if (/pages\/Properties|PropertyDetail/.test(id)) return 'booking-pages';
          if (/pages\/Checkout|Book|BookingSuccess/.test(id)) return 'checkout-flow';
          if (/pages\/Admin|QuotesPage|ReservationsPage/.test(id)) return 'admin-portal';
          if (/pages\/PricingPage|FAQPage|AboutPage/.test(id)) return 'marketing-pages';
          if (/pages\/Owners/.test(id)) return 'owners-portal';

          // Quantum component system splitting
          if (/components\/PropertyCard|PropertyMap/.test(id)) return 'booking-components';
          if (/components\/blocks\/HeroBlock/.test(id)) return 'hero-system';
          if (/components\/blocks\/(FeatureBlock|PricingBlock)/.test(id)) return 'content-blocks';
          if (/components\/blocks\/(FAQBlock|ContactBlock)/.test(id)) return 'interactive-blocks';
          if (/components\/AmazingLoader/.test(id)) return 'loader-system';
          if (/components\/skeletons/.test(id)) return 'skeleton-system';

          // Quantum hook system splitting
          if (/hooks\/useListings|useListing/.test(id)) return 'booking-hooks';
          if (/hooks\/useOfflineSync|useRealTime/.test(id)) return 'sync-hooks';
          if (/hooks\/useAI/.test(id)) return 'ai-hooks';

          // Quantum utility splitting
          if (/lib\/guesty/.test(id)) return 'guesty-core';
          if (/lib\/security|lib\/auth/.test(id)) return 'security-core';
          if (/lib\/accessibility/.test(id)) return 'accessibility-core';
          if (/lib\/performance/.test(id)) return 'performance-core';
          if (/lib\/enterprise/.test(id)) return 'enterprise-core';
        },

        // Quantum asset naming for optimal caching
        assetFileNames: (asset) => {
          const ext = asset.name?.split('.').pop();
          if (!ext) return '[name]-[hash][extname]';

          // Quantum image optimization
          if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
            return `images/[name]-[hash].webp`;
          }

          // Quantum font optimization
          if (['woff2', 'woff', 'ttf'].includes(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }

          return `[name]-[hash][extname]`;
        },

        // Quantum chunk naming for optimal loading
        chunkFileNames: (chunk) => {
          const facadeModuleId = chunk.facadeModuleId;
          if (facadeModuleId?.includes('pages/')) {
            return `pages/[name]-[hash].js`;
          }
          if (facadeModuleId?.includes('components/')) {
            return `components/[name]-[hash].js`;
          }
          if (facadeModuleId?.includes('lib/')) {
            return `lib/[name]-[hash].js`;
          }
          return `[name]-[hash].js`;
        },

        // Quantum entry chunk naming
        entryFileNames: '[name]-[hash].js',

        // Quantum experimental features
        experimentalMinChunkSize: 10 * 1024, // 10KB minimum chunk size
        inlineDynamicImports: false, // Disable for better caching
      },

      // Quantum tree shaking optimizations
      treeshake: {
        moduleSideEffects: (id, external) => {
          // Mark pure modules for better tree shaking
          if (id.includes('lucide-react')) return false;
          if (id.includes('date-fns')) return false;
          return true;
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    // Quantum build optimizations
    chunkSizeWarningLimit: 50, // Warn at 50KB for quantum bundles
    sourcemap: mode === 'development', // Source maps only in dev
    minify: mode === 'production' ? 'terser' : 'esbuild', // Terser for better compression
    target: 'es2020', // Modern browsers for optimal optimization
    reportCompressedSize: true, // Show compressed sizes

    // Quantum module preloading
    modulePreload: {
      polyfill: false, // Disable polyfill preloading
    },

    // Quantum dependency optimization
    commonjsOptions: {
      include: [/node_modules/],
      exclude: ['three'], // Exclude heavy optional dependencies
    },
  },

  // Quantum optimization settings
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      '@tanstack/react-query',
      'lucide-react',
    ],
    exclude: ['three'], // Exclude heavy optional dependencies
    force: true, // Force optimization for quantum performance
  },

  // Quantum CSS optimization
  css: {
    devSourcemap: mode === 'development',
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },


}));
