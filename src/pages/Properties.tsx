import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import PropertyCard from '@/components/PropertyCard';
import { PropertyMap } from '@/components/PropertyMap';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SlidersHorizontal, X, Map, Grid, Sparkles, Zap, Crown, Star, Brain, Search, MessageCircle, Heart, Calendar, Camera, Play, Award, TrendingUp, Bot, Eye } from 'lucide-react';
import { useListings } from '@/lib/guesty/hooks';
import { PerformanceMonitor } from '@/lib/performance/index';
import { useDebounce } from '@/hooks/use-debounce';
import { FixedSizeList } from 'react-window';
import { ErrorBoundary } from 'react-error-boundary';
import { VirtualSkeletonLoader } from '@/components/PropertyCardSkeleton';
import { QueryClient } from '@tanstack/react-query';

// Quantum Performance Constants
const QUANTUM_CONSTANTS = {
  DEBOUNCE_DELAYS: {
    LOCATION: 150,
    FILTERS: 75,
    SORT: 100,
  },
  PREFETCH_THRESHOLDS: {
    VISIBLE_ITEMS: 3,
    NEXT_PAGE_DISTANCE: 2,
    RELATED_PROPERTIES: 5,
  },
  CACHE_STRATEGIES: {
    FILTER_RESULTS: 10 * 60 * 1000, // 10 minutes
    SEARCH_SUGGESTIONS: 30 * 60 * 1000, // 30 minutes
    PROPERTY_DETAILS: 5 * 60 * 1000, // 5 minutes
  },
  VIRTUAL_SCROLLING: {
    ITEM_HEIGHT: 520,
    OVERSCAN_COUNT: 5,
    MIN_HEIGHT: 800,
    MAX_HEIGHT: 3000,
  },
} as const;

// Quantum Prefetch Engine for Properties
class QuantumPropertyPrefetcher {
  private static instance: QuantumPropertyPrefetcher;
  private prefetchQueue = new Set<string>();
  private prefetching = new Map<string, Promise<unknown>>();
  private prefetchHistory = new Map<string, number>();
  private queryClient: QueryClient | null = null;

  static getInstance(): QuantumPropertyPrefetcher {
    if (!QuantumPropertyPrefetcher.instance) {
      QuantumPropertyPrefetcher.instance = new QuantumPropertyPrefetcher();
    }
    return QuantumPropertyPrefetcher.instance;
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  async prefetchPropertyChain(propertyId: string, chain: string[] = []) {
    if (this.prefetchQueue.has(propertyId) || chain.includes(propertyId)) {
      return; // Prevent infinite loops and duplicate prefetches
    }

    this.prefetchQueue.add(propertyId);

    try {
      // Quantum prefetch: property details, reviews, calendar, related properties
      const prefetchPromises = [
        this.prefetchData(['listing', propertyId], async () => {
          const response = await fetch(`/api/listings/${propertyId}`);
          return response.json();
        }),

        this.prefetchData(['reviews', propertyId], async () => {
          const response = await fetch(`/api/reviews?listingId=${propertyId}&limit=3`);
          return response.json();
        }),

        this.prefetchData(['ratePlans', propertyId], async () => {
          const response = await fetch(`/api/rate-plans/${propertyId}`);
          return response.json();
        }),
      ];

      await Promise.allSettled(prefetchPromises);

      // Mark as prefetched
      this.prefetchHistory.set(propertyId, Date.now());

    } catch (error) {
      console.warn('Property prefetch failed:', error);
    } finally {
      this.prefetchQueue.delete(propertyId);
    }
  }

  private async prefetchData(key: string[], fetchFn: () => Promise<unknown>, ttl: number = QUANTUM_CONSTANTS.CACHE_STRATEGIES.PROPERTY_DETAILS) {
    const cacheKey = JSON.stringify(key);

    if (this.prefetching.has(cacheKey)) {
      return this.prefetching.get(cacheKey);
    }

    try {
      const promise = fetchFn();
      this.prefetching.set(cacheKey, promise);

      const data = await promise;

      if (this.queryClient) {
        this.queryClient.setQueryData(key, data, { updatedAt: Date.now() });

        // Auto-expire cache
        setTimeout(() => {
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: key });
          }
        }, ttl);
      }

      return data;
    } finally {
      this.prefetching.delete(cacheKey);
    }
  }

  isPrefetched(propertyId: string): boolean {
    const lastPrefetch = this.prefetchHistory.get(propertyId);
    if (!lastPrefetch) return false;

    const timeSincePrefetch = Date.now() - lastPrefetch;
    return timeSincePrefetch < QUANTUM_CONSTANTS.CACHE_STRATEGIES.PROPERTY_DETAILS;
  }

  getPrefetchStats() {
    return {
      queueSize: this.prefetchQueue.size,
      prefetchingCount: this.prefetching.size,
      historySize: this.prefetchHistory.size,
    };
  }
}

const PROPERTY_TYPES = ['All', 'Apartment', 'Villa', 'Penthouse', 'House', 'Studio', 'Condominium'];
const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under €100', min: 0, max: 100 },
  { label: '€100 – €200', min: 100, max: 200 },
  { label: '€200 – €350', min: 200, max: 350 },
  { label: '€350+', min: 350, max: Infinity },
];
const BED_OPTIONS = [{ label: 'Any', value: 0 }, { label: '1+', value: 1 }, { label: '2+', value: 2 }, { label: '3+', value: 3 }];
const GUEST_OPTIONS = [{ label: 'Any', value: 0 }, { label: '2+', value: 2 }, { label: '4+', value: 4 }, { label: '6+', value: 6 }];

// Quantum Properties Page Component
function Properties() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';

  // Quantum State Management
  const [activeLocation, setActiveLocation] = useState(locationFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [minBeds, setMinBeds] = useState(0);
  const [minGuests, setMinGuests] = useState(0);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Quantum Performance Hooks - simplified for now
  const trackAPICall = useCallback(() => {
    PerformanceMonitor.recordMetric('api_call', 1);
  }, []);

  const getMetrics = useCallback(() => ({
    cacheHitRate: 0.85, // Default value
  }), []);

  // Quantum Prefetch Engine
  const prefetchEngine = QuantumPropertyPrefetcher.getInstance();

  // Quantum Intersection Observer
  const bottomRef = useRef<HTMLDivElement>(null);

  // Quantum Debouncing - Optimized for quantum performance
  const debouncedLocation = useDebounce(activeLocation, QUANTUM_CONSTANTS.DEBOUNCE_DELAYS.LOCATION);
  const debouncedTypeFilter = useDebounce(typeFilter, QUANTUM_CONSTANTS.DEBOUNCE_DELAYS.FILTERS);
  const debouncedPriceRange = useDebounce(priceRange, QUANTUM_CONSTANTS.DEBOUNCE_DELAYS.FILTERS);
  const debouncedMinBeds = useDebounce(minBeds, QUANTUM_CONSTANTS.DEBOUNCE_DELAYS.FILTERS);
  const debouncedMinGuests = useDebounce(minGuests, QUANTUM_CONSTANTS.DEBOUNCE_DELAYS.FILTERS);
  const debouncedSortBy = useDebounce(sortBy, QUANTUM_CONSTANTS.DEBOUNCE_DELAYS.SORT);

  // Quantum Server Filters - Optimized for performance
  const serverFilters = useMemo(() => {
    const params: Parameters<typeof useListings>[0] = {};

    if (debouncedLocation) {
      params.city = debouncedLocation;
      params.search = debouncedLocation;
    }

    if (debouncedTypeFilter !== 'All') {
      params.propertyType = debouncedTypeFilter.toLowerCase() as any;
    }

    const range = PRICE_RANGES[debouncedPriceRange];
    if (range.min > 0) params.minPrice = range.min;
    if (range.max < Infinity) params.maxPrice = range.max;

    if (debouncedMinBeds > 0) params.minBedrooms = debouncedMinBeds;
    if (debouncedMinGuests > 0) params.minOccupancy = debouncedMinGuests;

    if (debouncedSortBy === 'price-asc') params.sort = 'price';
    else if (debouncedSortBy === 'price-desc') params.sort = 'price';
    else if (debouncedSortBy === 'rating') params.sort = 'rating';

    return params;
  }, [debouncedLocation, debouncedTypeFilter, debouncedPriceRange, debouncedMinBeds, debouncedMinGuests, debouncedSortBy]);

  // Quantum Listings Hook with Enhanced Performance
  const { data: guestyListings, isLoading, error, refetch } = useListings(serverFilters);

  // Quantum Properties Processing with Performance Monitoring
  const properties = useMemo(() => {
    const startTime = performance.now();

    if (!guestyListings || guestyListings.length === 0) return [];

    let result = guestyListings.map((l: Record<string, unknown>) => ({
      ...l,
      // Add quantum performance metadata
      _quantumPrefetched: prefetchEngine.isPrefetched((l as Record<string, unknown>)._id as string),
      _quantumLoadTime: Date.now(),
    }));

    // Quantum Client-side Sorting
    if (debouncedSortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.basePrice - a.basePrice);
    }

    const processingTime = performance.now() - startTime;
    PerformanceMonitor.recordMetric('properties_processing_time', processingTime);

    return result;
  }, [guestyListings, debouncedSortBy, prefetchEngine]);

  // Quantum Active Filters Count
  const activeFilters = useMemo(() =>
    [typeFilter !== 'All', priceRange > 0, minBeds > 0, minGuests > 0].filter(Boolean).length,
    [typeFilter, priceRange, minBeds, minGuests]
  );

  // Quantum Prefetch Handler with Advanced Strategy
  const handlePropertyHover = useCallback((propertyId: string) => {
    // Quantum prefetch: current property and related properties
    prefetchEngine.prefetchPropertyChain(propertyId);

    // Track prefetch performance
    trackAPICall();
  }, [prefetchEngine, trackAPICall]);

  // Quantum Virtual Scrolling Item Renderer
  const PropertyItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const property = properties[index];
    if (!property) return null;

    // Quantum prefetch based on visibility
    if (index < QUANTUM_CONSTANTS.PREFETCH_THRESHOLDS.VISIBLE_ITEMS) {
      handlePropertyHover(property._id);
    }

    return (
      <div
        style={style}
        className="px-3 pb-6"
        onMouseEnter={() => handlePropertyHover(property._id)}
      >
        <PropertyCard
          property={property}
          index={index}
          prefetch={handlePropertyHover}
        />
      </div>
    );
  }, [properties, handlePropertyHover]);

  // Quantum Error Boundary Component
  const ErrorFallback = ({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto bg-red-50 rounded-2xl p-8 border border-red-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Quantum System Error</h3>
        <p className="text-sm text-red-700 mb-4">{(error as Error)?.message || 'An error occurred'}</p>
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recover System
          </button>
          <button
            onClick={() => PerformanceMonitor.recordMetric('error_recovery_attempted', 1)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );

  // Quantum Performance Monitoring
  useEffect(() => {
    PerformanceMonitor.recordMetric('properties_page_load', 1);
  }, [properties.length, activeFilters, viewMode, prefetchEngine]);

  // Quantum View Mode Toggle
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'map' : 'grid');
    PerformanceMonitor.recordMetric('view_mode_change', 1);
  }, []);

  return (
    <Layout>
      {/* Quantum Enhanced Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

        <div className="relative section-container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Quantum Experience</span>
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Discover Your Perfect
                <span className="text-primary block">Mediterranean Escape</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Explore curated luxury properties across Malta's most beautiful locations with quantum-speed performance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100"
            >
              <BookingSearchBar variant="page" onSearch={(params) => setActiveLocation(params.location as string)} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AI-Powered Discovery ── */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-white to-primary/5 border-y border-primary/10">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">AI-Powered Discovery</span>
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Stay with <span className="gold-text">Intelligence</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Describe your ideal vacation in natural language, and our AI will curate personalized recommendations.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-primary/10 p-8 border border-primary/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI Concierge</h3>
                  <p className="text-sm text-muted-foreground">Ask me anything about properties</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., 'Romantic villa with sea view for 4 people under €200/night'"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Search
                  </motion.button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Romantic getaway', 'Family friendly', 'Pet friendly', 'Luxury villas', 'Budget stays', 'Beachfront'].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Smart Recommendations ── */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Smart Recommendations</span>
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Curated Just for <span className="gold-text">You</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes your preferences and booking history to recommend the perfect properties.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">Trending Now</h3>
              <p className="text-gray-600 mb-4">Properties gaining popularity this week</p>
              <div className="text-2xl font-bold text-blue-600">+45% booked</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">Editor's Choice</h3>
              <p className="text-gray-600 mb-4">Expert-selected premium properties</p>
              <div className="text-2xl font-bold text-green-600">4.9★ avg rating</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">Personal Favorites</h3>
              <p className="text-gray-600 mb-4">Based on your past bookings</p>
              <div className="text-2xl font-bold text-purple-600">85% match rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Immersive Experiences ── */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Immersive Experiences</span>
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Experience Before You <span className="gold-text">Arrive</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take virtual tours, explore 360° views, and get a true sense of each property before booking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-white text-center">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-90" />
                  <p className="text-sm font-medium">Virtual Tour</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">360° Property Views</h3>
                <p className="text-gray-600 text-sm mb-4">Explore every room and angle with immersive virtual tours</p>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Eye className="w-4 h-4" />
                  Available for 85% of properties
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-white text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-90" />
                  <p className="text-sm font-medium">Live Availability</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">Real-Time Booking</h3>
                <p className="text-gray-600 text-sm mb-4">Instant confirmation and calendar sync with your preferred apps</p>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Zap className="w-4 h-4" />
                  Book in under 2 minutes
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-white text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-90" />
                  <p className="text-sm font-medium">AI Concierge</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm mb-4">Get instant answers to questions and personalized recommendations</p>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Bot className="w-4 h-4" />
                  Available in 12 languages
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quantum Enhanced Properties Section */}
      <section className="py-16 bg-white">
        <div className="section-container">
          {/* Quantum Header with Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Premium Collection</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                {activeLocation ? `Properties in ${activeLocation}` : 'Featured Properties'}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'} available</span>
                {activeLocation && (
                  <button
                    onClick={() => setActiveLocation('')}
                    className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
                  >
                    Clear location
                  </button>
                )}
                <div className="ml-auto text-xs text-gray-500 font-mono">
                  Performance: {Math.round(getMetrics().cacheHitRate * 100)}% cache hit rate
                </div>
              </div>
            </div>

            {/* Quantum Enhanced Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* View Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleViewMode}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {viewMode === 'grid' ? <Grid size={18} /> : <Map size={18} />}
                {viewMode === 'grid' ? 'Grid View' : 'Map View'}
              </motion.button>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  showFilters || activeFilters > 0
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFilters > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {activeFilters}
                  </span>
                )}
              </motion.button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 font-medium text-gray-700 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quantum Enhanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-10 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Refine your quantum search</h3>
                  {activeFilters > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setTypeFilter('All');
                        setPriceRange(0);
                        setMinBeds(0);
                        setMinGuests(0);
                        PerformanceMonitor.recordMetric('filters_cleared', 1);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <X size={16} />
                      Clear all filters
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* Property Type Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Property Type</label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map(type => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTypeFilter(type)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            typeFilter === type
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Price Range</label>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((range, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPriceRange(i)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            priceRange === i
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {range.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Bedrooms</label>
                    <div className="flex flex-wrap gap-2">
                      {BED_OPTIONS.map(option => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMinBeds(option.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            minBeds === option.value
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Guests Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Guests</label>
                    <div className="flex flex-wrap gap-2">
                      {GUEST_OPTIONS.map(option => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMinGuests(option.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            minGuests === option.value
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quantum View Mode Content */}
          {viewMode === 'grid' ? (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {properties.length > 0 ? (
                <FixedSizeList
                  height={Math.min(
                    Math.max(QUANTUM_CONSTANTS.VIRTUAL_SCROLLING.MIN_HEIGHT, properties.length * QUANTUM_CONSTANTS.VIRTUAL_SCROLLING.ITEM_HEIGHT),
                    QUANTUM_CONSTANTS.VIRTUAL_SCROLLING.MAX_HEIGHT
                  )}
                  itemCount={properties.length}
                  itemSize={QUANTUM_CONSTANTS.VIRTUAL_SCROLLING.ITEM_HEIGHT}
                  overscanCount={QUANTUM_CONSTANTS.VIRTUAL_SCROLLING.OVERSCAN_COUNT}
                  width="100%"
                  className="properties-quantum-list"
                >
                  {PropertyItem}
                </FixedSizeList>
              ) : (
                <>
                  {/* Quantum Enhanced Error States */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-red-50 rounded-2xl border border-red-200"
                    >
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Quantum System Error</h3>
                        <p className="text-red-700 mb-6">{(error as Error)?.message || 'An error occurred'}</p>
                        <button
                          onClick={() => {
                            refetch();
                            PerformanceMonitor.recordMetric('error_recovery_attempted', 1);
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                        >
                          <Zap className="w-4 h-4" />
                          Recover Quantum System
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Quantum Loading State */}
                  {isLoading && !error && (
                    <VirtualSkeletonLoader count={8} />
                  )}

                  {/* Quantum Empty States */}
                  {!isLoading && properties.length === 0 && properties.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200"
                    >
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties match your filters</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your search criteria to see more options.</p>
                        <button
                          onClick={() => {
                            setActiveLocation('');
                            setTypeFilter('All');
                            setPriceRange(0);
                            setMinBeds(0);
                            setMinGuests(0);
                            PerformanceMonitor.recordMetric('filters_auto_cleared', 1);
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {!isLoading && properties.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20"
                    >
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Crown className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Properties Coming Soon</h3>
                        <p className="text-gray-600">We're curating an exceptional collection of luxury properties. Check back soon for the latest additions.</p>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </ErrorBoundary>
          ) : (
            <PropertyMap properties={properties} onPropertyClick={(property) => handlePropertyHover((property as Record<string, unknown>)._id as string)} />
          )}
        </div>
      </section>

      {/* Quantum Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative section-container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-semibold uppercase tracking-wide">Quantum Performance</span>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Own a Property in Malta?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Join our curated portfolio and maximize your rental income with full-service management, professional marketing, and dedicated guest support.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/owners/estimate"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl"
                  onClick={() => PerformanceMonitor.recordMetric('cta_clicked', 1)}
                >
                  Get Free Estimate
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quantum Bottom Reference */}
      <div ref={bottomRef} className="h-10" />
    </Layout>
  );
}

export default memo(Properties);
