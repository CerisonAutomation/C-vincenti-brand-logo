import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { CustomInput } from './CustomInput';
import { Select } from './Select';
import { CustomButton } from './CustomButton';

// Towns in Malta & Gozo
const MALTA_TOWNS = [
  'Valletta', 'Sliema', 'St. Julian\'s', 'Gzira', 'Msida', 'Ta\' Xbiex', 'Pembroke', 'Swieqi',
  'San Gwann', 'Naxxar', 'Mosta', 'Rabat', 'Mdina', 'Attard', 'Balzan', 'Lija', 'Pietà',
  'Floriana', 'Hamrun', 'Marsa', 'Paola', 'Tarxien', 'Fgura', 'Zejtun', 'Qormi', 'Zurrieq',
  'Birzebbuga', 'Siggiewi', 'Luqa', 'Mellieha', 'Manikata', 'Mgarr', 'Victoria (Gozo)',
  'Xaghra', 'Nadur', 'Xewkija', 'Ghajnsielem', 'Sannat', 'Munxar', 'Qala', 'Zebbug (Gozo)',
  'Fontana', 'Gharb', 'Kerċem', 'Marsalforn', 'Xlendi', 'San Lawrenz'
];

const searchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
});

type SearchData = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSearch: (data: SearchData) => void;
  initialData?: Partial<SearchData>;
  className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialData = {},
  className = '',
}) => {
  const [formData, setFormData] = useState<SearchData>({
    location: initialData.location || '',
    checkIn: initialData.checkIn || '',
    checkOut: initialData.checkOut || '',
    guests: initialData.guests || 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredTowns, setFilteredTowns] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-populate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastSearch');
    if (saved && !initialData.location) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // Ignore invalid data
      }
    }
  }, [initialData]);

  // Filter towns for autocomplete
  useEffect(() => {
    if (formData.location.length > 0) {
      const filtered = MALTA_TOWNS.filter(town =>
        town.toLowerCase().includes(formData.location.toLowerCase())
      );
      setFilteredTowns(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setFilteredTowns([]);
      setShowSuggestions(false);
    }
  }, [formData.location]);

  const validateAndSearch = () => {
    try {
      const validatedData = searchSchema.parse(formData);
      setErrors({});

      // Save to localStorage for auto-populate
      localStorage.setItem('lastSearch', JSON.stringify(validatedData));

      onSearch(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const updateField = (field: keyof SearchData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectTown = (town: string) => {
    setFormData(prev => ({ ...prev, location: town }));
    setShowSuggestions(false);
  };

  // Predictive check-out date (check-in + 7 days)
  const predictCheckOut = () => {
    if (formData.checkIn && !formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + 7);
      updateField('checkOut', checkOutDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className={`bg-card p-6 rounded-lg shadow-lg border border-border ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location with Autocomplete */}
        <div className="relative">
          <CustomInput
            label="Location"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="All Malta & Gozo"
            error={errors.location}
            className="w-full"
          />
          {showSuggestions && filteredTowns.length > 0 && (
            <ul className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
              {filteredTowns.map((town, index) => (
                <li
                  key={index}
                  onClick={() => selectTown(town)}
                  className="px-3 py-2 hover:bg-accent cursor-pointer"
                >
                  {town}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Check-in Date */}
        <CustomInput
          label="Check-in"
          type="date"
          value={formData.checkIn}
          onChange={(e) => {
            updateField('checkIn', e.target.value);
            predictCheckOut();
          }}
          error={errors.checkIn}
          className="w-full"
        />

        {/* Check-out Date */}
        <CustomInput
          label="Check-out"
          type="date"
          value={formData.checkOut}
          onChange={(e) => updateField('checkOut', e.target.value)}
          error={errors.checkOut}
          className="w-full"
        />

        {/* Guests */}
        <Select
          label="Guests"
          value={formData.guests.toString()}
          onChange={(e) => updateField('guests', parseInt(e.target.value))}
          options={Array.from({ length: 20 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `${i + 1} guest${i + 1 > 1 ? 's' : ''}`
          }))}
          error={errors.guests}
          className="w-full"
        />

        {/* Search Button */}
        <div className="flex items-end">
          <CustomButton
            onClick={validateAndSearch}
            className="w-full"
            size="lg"
          >
            Search
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
