import { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Users, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MALTA_LOCALITIES } from '@/lib/malta-localities';
import { format, addDays } from 'date-fns';
import { BookingModal } from './BookingModal';

interface BookingSearchBarProps {
  variant?: 'hero' | 'page' | 'inline';
  onSearch?: (params: Record<string, unknown>) => void;
}

/**
 * Premium booking search bar with luxury design elements
 * Enhanced UI with better spacing, typography, and visual hierarchy
 */
export default function BookingSearchBar({ variant = 'hero', onSearch }: BookingSearchBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState('2');

  const suggestions = useMemo(() => {
    if (!location) return [];
    const input = location.toLowerCase();
    return MALTA_LOCALITIES.filter(loc =>
      loc.toLowerCase().includes(input) || input.includes(loc.split(' ')[0].toLowerCase())
    ).slice(0, 6);
  }, [location]);

  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setShowSuggestions(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSearch = () => {
    if (location && checkIn && checkOut) {
      onSearch?.({ location, checkIn, checkOut, guests });
      handleOpenModal();
    }
  };

  if (variant === 'inline') {
    return (
      <>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="relative flex-1 min-w-48">
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Where do you want to stay?"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-11 h-11 text-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/50 rounded-xl shadow-xl z-50 backdrop-blur-sm">
                {suggestions.map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <MapPin size={14} className="text-muted-foreground" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="pl-11 h-11 text-sm w-36 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd')}
              className="pl-11 h-11 text-sm w-36 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="relative">
            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="pl-11 h-11 text-sm w-28 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,8,10].map(n => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSearch}
            size="lg"
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </div>
        <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultLocation={location} />
      </>
    );
  }

  return (
    <>
      <div className={`glass-surface rounded-2xl border border-border/50 shadow-2xl p-6 ${variant === 'hero' ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Location */}
          <div className="relative md:col-span-2">
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Where do you want to stay?"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-12 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-background/50"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-50">
                {suggestions.map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <MapPin size={14} className="text-muted-foreground" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Check-in */}
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="pl-12 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-background/50"
            />
          </div>

          {/* Check-out */}
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd')}
              className="pl-12 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-background/50"
            />
          </div>

          {/* Guests */}
          <div className="relative">
            <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="pl-12 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-background/50">
                <SelectValue placeholder="Guests" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,8,10].map(n => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-yellow-500" />
              <span>Premium Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-500" />
              <span>Secure Booking</span>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            size="lg"
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search size={18} className="mr-2" />
            Search Properties
          </Button>
        </div>
      </div>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultLocation={location} />
    </>
  );
}
