import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Search, X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MALTA_LOCALITIES } from '@/lib/malta-localities';

interface BookingSearchBarProps {
  variant?: 'hero' | 'page';
  onSearch?: (params: { location: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export default function BookingSearchBar({ variant = 'page', onSearch }: BookingSearchBarProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showLocations, setShowLocations] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  const filtered = MALTA_LOCALITIES.filter((l) =>
    l.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 8);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocations(false);
    if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setShowGuests(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Auto-set checkout to checkIn + 3 days
  useEffect(() => {
    if (checkIn && !checkOut) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + 3);
      setCheckOut(d.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  const today = new Date().toISOString().split('T')[0];

  function handleSubmit() {
    const params = { location, checkIn, checkOut, guests };
    if (onSearch) {
      onSearch(params);
    } else {
      const sp = new URLSearchParams();
      if (location) sp.set('location', location);
      if (checkIn) sp.set('checkIn', checkIn);
      if (checkOut) sp.set('checkOut', checkOut);
      sp.set('guests', String(guests));
      navigate(`/properties?${sp.toString()}`);
    }
  }

  const isHero = variant === 'hero';

  return (
    <div className={`w-full ${isHero ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}>
      <div className={`flex flex-col md:flex-row items-stretch gap-0 rounded-2xl overflow-hidden border border-border/60 ${isHero ? 'bg-card/90 backdrop-blur-xl shadow-2xl' : 'bg-card shadow-lg'}`}>
        {/* Location */}
        <div ref={locationRef} className="relative flex-1 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center gap-3 px-5 py-4">
            <MapPin size={18} className="text-primary shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setShowLocations(true); }}
                onFocus={() => setShowLocations(true)}
                placeholder="All Malta & Gozo"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            {location && (
              <button onClick={() => { setLocation(''); setShowLocations(false); }} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showLocations && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-b-xl shadow-xl max-h-64 overflow-y-auto"
              >
                {!location && (
                  <button
                    onClick={() => { setLocation(''); setShowLocations(false); }}
                    className="w-full text-left px-5 py-3 text-sm text-primary font-medium hover:bg-accent/50 transition-colors flex items-center gap-2"
                  >
                    <MapPin size={14} /> All locations
                  </button>
                )}
                {filtered.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocation(loc); setShowLocations(false); }}
                    className="w-full text-left px-5 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Check-in */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center gap-3 px-5 py-4">
            <CalendarDays size={18} className="text-primary shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Check-out */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center gap-3 px-5 py-4">
            <CalendarDays size={18} className="text-primary shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div ref={guestsRef} className="relative border-b md:border-b-0 md:border-r border-border/30">
          <button
            onClick={() => setShowGuests(!showGuests)}
            className="flex items-center gap-3 px-5 py-4 w-full text-left"
          >
            <Users size={18} className="text-primary shrink-0" />
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                Guests
              </span>
              <span className="text-sm text-foreground">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
            </div>
          </button>

          <AnimatePresence>
            {showGuests && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full right-0 z-50 bg-card border border-border rounded-b-xl shadow-xl p-4 min-w-[200px]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">Guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold text-foreground w-6 text-center">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(16, guests + 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search button */}
        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity md:rounded-none"
        >
          <Search size={18} />
          <span className="md:hidden lg:inline">Search</span>
        </button>
      </div>
    </div>
  );
}
