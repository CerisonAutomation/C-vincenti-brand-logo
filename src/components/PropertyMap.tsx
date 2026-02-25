import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import { motion } from 'framer-motion';
import { Navigation, Layers, ZoomIn, ZoomOut, RotateCcw, Route, Thermometer, BarChart3 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Placeholder components for map controls
const MapSearch = ({ onSearch, onLocationRequest }: { onSearch: (query: string) => void; onLocationRequest: () => void }) => (
  <div className="absolute top-4 left-4 z-[1000] bg-white shadow-lg rounded-lg p-4">
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search location..."
        className="px-3 py-2 border rounded"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch((e.target as HTMLInputElement).value);
          }
        }}
      />
      <button
        onClick={onLocationRequest}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        aria-label="Use current location"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const MapControls = ({ onZoomIn, onZoomOut, onReset, onToggleLayers }: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleLayers: () => void;
}) => (
  <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
    <button onClick={onZoomIn} className="p-2 bg-white shadow-lg rounded hover:bg-gray-100" aria-label="Zoom in">
      <ZoomIn className="w-5 h-5" />
    </button>
    <button onClick={onZoomOut} className="p-2 bg-white shadow-lg rounded hover:bg-gray-100" aria-label="Zoom out">
      <ZoomOut className="w-5 h-5" />
    </button>
    <button onClick={onReset} className="p-2 bg-white shadow-lg rounded hover:bg-gray-100" aria-label="Reset view">
      <RotateCcw className="w-5 h-5" />
    </button>
    <button onClick={onToggleLayers} className="p-2 bg-white shadow-lg rounded hover:bg-gray-100" aria-label="Toggle layers">
      <Layers className="w-5 h-5" />
    </button>
  </div>
);

const MapFilters = ({ filters: _filters, onFiltersChange: _onFiltersChange }: {
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
}) => (
  <div className="absolute bottom-4 left-4 z-[1000] bg-white shadow-lg rounded-lg p-4">
    <h3 className="font-semibold mb-2">Filters</h3>
    {/* Placeholder filters */}
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        Luxury
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        Budget
      </label>
    </div>
  </div>
);

// Fix for default markers in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  image: string;
  rating?: number;
  type: string;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
}

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onPropertyClick?: (property: Property) => void;
  enableClustering?: boolean;
  enableRouting?: boolean;
  enableFilters?: boolean;
  enableHeatmap?: boolean;
  enableAnalytics?: boolean;
}

// Enhanced property marker icon with animation
const createPropertyIcon = (price: number, type: string, isSelected = false) => {
  const colors = {
    luxury: '#d4af37',
    standard: '#3b82f6',
    budget: '#10b981',
    premium: '#8b5cf6'
  };
  const color = colors[type as keyof typeof colors] || colors.standard;

  return L.divIcon({
    className: `custom-property-marker ${isSelected ? 'selected' : ''}`,
    html: `
      <div style="
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        width: ${isSelected ? '50px' : '40px'};
        height: ${isSelected ? '50px' : '40px'};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        font-weight: bold;
        font-size: ${isSelected ? '14px' : '12px'};
        color: white;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
      ">
        €${price}
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid ${color};
        "></div>
        ${isSelected ? '<div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 2px solid white;"></div>' : ''}
      </div>
    `,
    iconSize: isSelected ? [50, 60] : [40, 50],
    iconAnchor: isSelected ? [25, 60] : [20, 50],
  });
};

// Advanced clustering with custom icons
const createClusterIcon = (cluster: any) => {
  const childCount = cluster.getChildCount();
  let c = ' marker-cluster-';
  if (childCount < 10) {
    c += 'small';
  } else if (childCount < 100) {
    c += 'medium';
  } else {
    c += 'large';
  }

  return new L.DivIcon({
    html: '<div><span>' + childCount + '</span></div>',
    className: 'marker-cluster' + c,
    iconSize: new L.Point(40, 40)
  });
};

// Routing component - simplified for now
// function RoutingMachine({ waypoints, map }: { waypoints: L.LatLng[], map: L.Map }) {
//   // Implementation simplified
//   return null;
// }

// Heatmap overlay - simplified for now
// function HeatmapOverlay({ properties, enabled }: { properties: Property[], enabled: boolean }) {
//   return null;
// }

// Analytics overlay - simplified for now
// function AnalyticsOverlay({ properties, enabled }: { properties: Property[], enabled: boolean }) {
//   return null;
// }

// Enhanced Map Component
function MapComponent({
  properties,
  onPropertyClick,
  enableClustering = true,
  enableRouting = false,
  enableFilters = true,
  enableHeatmap = false,
  enableAnalytics = false
}: Omit<PropertyMapProps, 'center' | 'zoom' | 'className'>) {
  const map = useMap();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(enableHeatmap);
  const [showAnalytics, setShowAnalytics] = useState(enableAnalytics);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialize marker clustering
  useEffect(() => {
    if (enableClustering && !markerClusterGroupRef.current) {
      markerClusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        iconCreateFunction: createClusterIcon,
      });
      map.addLayer(markerClusterGroupRef.current);
    }

    return () => {
      if (markerClusterGroupRef.current) {
        map.removeLayer(markerClusterGroupRef.current);
      }
    };
  }, [map, enableClustering]);

  // Update markers
  useEffect(() => {
    if (!markerClusterGroupRef.current) return;

    markerClusterGroupRef.current.clearLayers();

    properties.forEach((property) => {
      const marker = L.marker([property.lat, property.lng], {
        icon: createPropertyIcon(property.price, property.type, selectedProperty?.id === property.id),
      });

      marker.bindPopup(`
        <div class="p-3 min-w-[250px]">
          <img src="${property.image}" alt="${property.title}" class="w-full h-32 object-cover rounded mb-3">
          <h3 class="font-bold text-lg mb-2">${property.title}</h3>
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl font-bold text-primary">€${property.price}/night</span>
            ${property.rating ? `<span class="flex items-center gap-1"><span class="text-yellow-500">★</span>${property.rating}</span>` : ''}
          </div>
          <div class="flex gap-2 mb-3">
            ${property.bedrooms ? `<span class="text-sm bg-gray-100 px-2 py-1 rounded">${property.bedrooms} beds</span>` : ''}
            ${property.bathrooms ? `<span class="text-sm bg-gray-100 px-2 py-1 rounded">${property.bathrooms} baths</span>` : ''}
          </div>
          <button onclick="window.dispatchEvent(new CustomEvent('propertyClick', { detail: '${property.id}' }))" class="w-full py-2 bg-primary text-white rounded hover:bg-primary/90">
            View Details
          </button>
        </div>
      `);

      marker.on('click', () => {
        setSelectedProperty(property);
        onPropertyClick?.(property);
      });

      markerClusterGroupRef.current!.addLayer(marker);
    });
  }, [properties, selectedProperty, onPropertyClick]);

  // Get user location
  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Search functionality with geocoding
  const handleSearch = async (query: string) => {
    try {
      // Use Nominatim for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.setView([parseFloat(lat), parseFloat(lon)], 13);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Map controls
  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds);
  };
  const handleToggleLayers = () => {
    // Toggle between different tile layers
  };

  return (
    <>
      <MapSearch onSearch={handleSearch} onLocationRequest={requestLocation} />

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onToggleLayers={handleToggleLayers}
      />

      {enableFilters && (
        <MapFilters
          filters={{}}
          onFiltersChange={(filters) => console.log('Filters changed:', filters)}
        />
      )}

      {/* Advanced overlays - commented out for now */}
      {/* <HeatmapOverlay properties={properties} enabled={showHeatmap} /> */}
      {/* <AnalyticsOverlay properties={properties} enabled={showAnalytics} /> */}

      {/* Routing - commented out for now */}
      {/* {enableRouting && routeWaypoints.length > 1 && (
        <RoutingMachine waypoints={routeWaypoints} map={map} />
      )} */}

      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      <MapSearch onSearch={handleSearch} onLocationRequest={requestLocation} />

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onToggleLayers={handleToggleLayers}
      />

      {enableFilters && (
        <MapFilters
          filters={{}}
          onFiltersChange={(filters) => console.log('Filters changed:', filters)}
        />
      )}

      {/* Advanced overlays - commented out for now */}
      {/* <HeatmapOverlay properties={properties} enabled={showHeatmap} /> */}
      {/* <AnalyticsOverlay properties={properties} enabled={showAnalytics} /> */}

      {/* Routing - commented out for now */}
      {/* {enableRouting && routeWaypoints.length > 1 && (
        <RoutingMachine waypoints={routeWaypoints} map={map} />
      )} */}

      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Route planning */}
      {enableRouting && (
        <div className="absolute bottom-20 right-4 z-[1000]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white shadow-lg rounded-lg hover:bg-gray-50"
            aria-label="Plan route from current location"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Route planning functionality not implemented
              }
            }}
          >
            <Route className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </div>
      )}

      {/* Toggle overlays */}
      <div className="absolute top-20 right-4 z-[1000] flex flex-col gap-2" role="toolbar" aria-label="Map overlay controls">
        {enableHeatmap && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-lg shadow-lg ${showHeatmap ? 'bg-red-500 text-white' : 'bg-white'}`}
            aria-label={`${showHeatmap ? 'Hide' : 'Show'} heatmap overlay`}
            aria-pressed={showHeatmap}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowHeatmap(!showHeatmap);
              }
            }}
          >
            <Thermometer className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        )}
        {enableAnalytics && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`p-2 rounded-lg shadow-lg ${showAnalytics ? 'bg-blue-500 text-white' : 'bg-white'}`}
            aria-label={`${showAnalytics ? 'Hide' : 'Show'} analytics overlay`}
            aria-pressed={showAnalytics}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowAnalytics(!showAnalytics);
              }
            }}
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        )}
      </div>
    </>
  );
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  center = [35.8997, 14.5146], // Malta center
  zoom = 10,
  className = '',
  onPropertyClick,
  enableClustering = true,
  enableRouting = false,
  enableFilters = true,
  enableHeatmap = false,
  enableAnalytics = false,
}) => {
  const mapRef = useRef<L.Map>(null);

  // Listen for property click events from popups
  useEffect(() => {
    const handlePropertyClick = (event: CustomEvent) => {
      const propertyId = event.detail;
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        onPropertyClick?.(property);
      }
    };

    window.addEventListener('propertyClick', handlePropertyClick as EventListener);
    return () => window.removeEventListener('propertyClick', handlePropertyClick as EventListener);
  }, [properties, onPropertyClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative w-full h-96 rounded-xl overflow-hidden shadow-lg ${className}`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapComponent
          properties={properties}
          onPropertyClick={onPropertyClick || (() => {})}
          enableClustering={enableClustering}
          enableRouting={enableRouting}
          enableFilters={enableFilters}
          enableHeatmap={enableHeatmap}
          enableAnalytics={enableAnalytics}
        />
      </MapContainer>

      {/* Loading overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute inset-0 bg-white flex items-center justify-center z-[999]"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading advanced map...</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
