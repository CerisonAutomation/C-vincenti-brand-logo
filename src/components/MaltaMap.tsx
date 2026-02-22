import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price?: number;
  count?: number;
}

interface MaltaMapProps {
  locations?: MapLocation[];
  onLocationClick?: (location: MapLocation) => void;
  className?: string;
}

// Approximate SVG coordinates for key Malta & Gozo localities
// Bounding box: Malta + Gozo roughly lat 35.8–36.1, lng 14.1–14.6
const MALTA_LOCALITIES_COORDS: MapLocation[] = [
  { id: 'valletta', name: 'Valletta', lat: 35.8997, lng: 14.5147 },
  { id: 'sliema', name: 'Sliema', lat: 35.9118, lng: 14.5013 },
  { id: 'stjulians', name: "St Julian's", lat: 35.9181, lng: 14.4909 },
  { id: 'swieqi', name: 'Swieqi', lat: 35.9245, lng: 14.4789 },
  { id: 'mellieha', name: 'Mellieħa', lat: 35.9574, lng: 14.3618 },
  { id: 'bugibba', name: 'St Paul\'s Bay', lat: 35.9518, lng: 14.4117 },
  { id: 'mdina', name: 'Mdina', lat: 35.8872, lng: 14.4023 },
  { id: 'rabat', name: 'Rabat', lat: 35.8835, lng: 14.3986 },
  { id: 'marsaskala', name: 'Marsaskala', lat: 35.8607, lng: 14.5573 },
  { id: 'marsaxlokk', name: 'Marsaxlokk', lat: 35.8411, lng: 14.5430 },
  { id: 'birżebbuga', name: 'Birżebbuġa', lat: 35.8290, lng: 14.5240 },
  { id: 'mosta', name: 'Mosta', lat: 35.9107, lng: 14.4261 },
  { id: 'naxxar', name: 'Naxxar', lat: 35.9241, lng: 14.4436 },
  { id: 'birkirkara', name: 'Birkirkara', lat: 35.8949, lng: 14.4607 },
  { id: 'gozo-victoria', name: 'Victoria (Gozo)', lat: 36.0442, lng: 14.2394 },
  { id: 'gozo-xlendi', name: 'Xlendi (Gozo)', lat: 36.0257, lng: 14.2110 },
  { id: 'gozo-marsalforn', name: 'Marsalforn (Gozo)', lat: 36.0706, lng: 14.2578 },
];

// Convert geo coords to SVG viewport
function geoToSVG(lat: number, lng: number): { x: number; y: number } {
  const MIN_LNG = 14.15;
  const MAX_LNG = 14.60;
  const MIN_LAT = 35.79;
  const MAX_LAT = 36.10;
  const VW = 800;
  const VH = 500;

  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * VW;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * VH;
  return { x, y };
}

export default function MaltaMap({ locations = MALTA_LOCALITIES_COORDS, onLocationClick, className = '' }: MaltaMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={`relative w-full bg-card/30 rounded-2xl border border-border/50 overflow-hidden ${className}`}>
      {/* Map grid background */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full"
        style={{ minHeight: 280 }}
        aria-label="Interactive map of Malta and Gozo properties"
      >
        {/* Ocean background */}
        <rect width="800" height="500" fill="hsl(220,20%,6%)" />

        {/* Grid lines */}
        {[1, 2, 3, 4].map(i => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="hsl(220,15%,12%)" strokeWidth="1" />
        ))}
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="500" stroke="hsl(220,15%,12%)" strokeWidth="1" />
        ))}

        {/* Malta island shape (simplified polygon) */}
        <polygon
          points="290,290 320,260 380,245 440,250 480,260 510,280 520,310 510,340 480,365 440,375 400,372 360,360 320,340 295,320"
          fill="hsl(220,18%,10%)"
          stroke="hsl(220,15%,18%)"
          strokeWidth="1.5"
        />

        {/* Gozo island shape */}
        <polygon
          points="160,130 190,115 230,112 265,120 275,140 270,160 250,175 220,180 190,175 165,162 155,148"
          fill="hsl(220,18%,10%)"
          stroke="hsl(220,15%,18%)"
          strokeWidth="1.5"
        />

        {/* Comino */}
        <polygon
          points="265,195 280,188 295,192 298,205 285,212 268,208"
          fill="hsl(220,18%,10%)"
          stroke="hsl(220,15%,18%)"
          strokeWidth="1"
        />

        {/* Location pins */}
        {locations.map((loc) => {
          const { x, y } = geoToSVG(loc.lat, loc.lng);
          const isHovered = hovered === loc.id;
          const hasPrice = !!loc.price;

          return (
            <g
              key={loc.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(loc.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onLocationClick?.(loc)}
            >
              {/* Pulse ring on hover */}
              {isHovered && (
                <circle r="18" fill="hsl(42,76%,55%)" fillOpacity="0.15" />
              )}

              {/* Pin */}
              {hasPrice ? (
                <>
                  <rect
                    x="-22" y="-12" width="44" height="24" rx="12"
                    fill={isHovered ? 'hsl(42,76%,55%)' : 'hsl(220,18%,14%)'}
                    stroke={isHovered ? 'hsl(42,76%,55%)' : 'hsl(220,15%,22%)'}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="9" fontWeight="700"
                    fill={isHovered ? 'hsl(220,20%,4%)' : 'hsl(42,76%,65%)'}
                    fontFamily="Inter, sans-serif"
                  >
                    €{loc.price}
                  </text>
                  {/* Tail */}
                  <polygon
                    points="-4,12 4,12 0,18"
                    fill={isHovered ? 'hsl(42,76%,55%)' : 'hsl(220,18%,14%)'}
                  />
                </>
              ) : (
                <>
                  <circle r="5" fill={isHovered ? 'hsl(42,76%,55%)' : 'hsl(220,15%,25%)'} />
                  <circle r="2" fill={isHovered ? 'hsl(220,20%,4%)' : 'hsl(42,76%,55%)'} />
                </>
              )}

              {/* Tooltip */}
              {isHovered && (
                <g transform="translate(0, -32)">
                  <rect
                    x={-(Math.max(loc.name.length * 5, 40))} y="-14" width={Math.max(loc.name.length * 10, 80)} height="24" rx="6"
                    fill="hsl(220,18%,10%)" stroke="hsl(220,15%,20%)" strokeWidth="1"
                  />
                  <text
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="9" fill="hsl(40,20%,90%)"
                    fontFamily="Inter, sans-serif"
                  >
                    {loc.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Labels */}
        <text x="415" y="310" textAnchor="middle" fontSize="9" fill="hsl(220,10%,35%)" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="3">MALTA</text>
        <text x="215" y="148" textAnchor="middle" fontSize="8" fill="hsl(220,10%,30%)" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="2">GOZO</text>
        <text x="281" y="202" textAnchor="middle" fontSize="6" fill="hsl(220,10%,25%)" fontFamily="Inter, sans-serif">COMINO</text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
        <MapPin size={12} className="text-primary" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">Interactive Map</span>
      </div>
    </div>
  );
}

export { MALTA_LOCALITIES_COORDS };
export type { MapLocation };
