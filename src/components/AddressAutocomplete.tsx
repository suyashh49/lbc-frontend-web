'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface SelectedPlace {
  text: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: SelectedPlace) => void;
  placeholder?: string;
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

// Load Google Maps JS API once
let mapsLoadPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise;
  if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
    return Promise.resolve();
  }
  mapsLoadPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) { reject(new Error('No Google Maps key')); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return mapsLoadPromise;
}

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder }: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      geocoder.current = new google.maps.Geocoder();
      setIsLoaded(true);
    }).catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (!input.trim() || !(window as any).google?.maps?.places?.AutocompleteSuggestion) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await (window as any).google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        includedRegionCodes: ['ph'] // Restrict to Philippines
      });
      
      setLoading(false);
      if (response && response.suggestions) {
        setPredictions(response.suggestions.map((s: any) => ({
          placeId: s.placePrediction.placeId,
          description: s.placePrediction.text.text,
          mainText: s.placePrediction.text.text,
          secondaryText: '', // The new API returns a single formatted text string
        })));
        setShowDropdown(true);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
      setPredictions([]);
      setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    onChange(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!val.trim()) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    debounceTimer.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    setShowDropdown(false);
    onChange(prediction.description);
    setPredictions([]);

    // Get lat/lng using Geocoder instead of deprecated PlacesService
    if (geocoder.current) {
      geocoder.current.geocode({ placeId: prediction.placeId }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          onSelect({
            text: results[0].formatted_address || prediction.description,
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          onSelect({ text: prediction.description, lat: 0, lng: 0 });
        }
      });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        className="form-input"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={placeholder || 'Start typing an address...'}
        autoComplete="off"
      />
      {!isLoaded && MAPS_KEY && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Loading Places API...</div>
      )}
      {loading && (
        <div style={{ position: 'absolute', right: 12, top: 10 }}>
          <span className="spinner" style={{ width: 14, height: 14 }} />
        </div>
      )}

      {showDropdown && predictions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          zIndex: 60, maxHeight: 240, overflowY: 'auto',
        }}>
          {predictions.map((p) => (
            <button
              key={p.placeId}
              type="button"
              onClick={() => handleSelect(p)}
              style={{
                display: 'block', width: '100%', padding: '10px 14px',
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {p.mainText}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {p.secondaryText}
              </div>
            </button>
          ))}
          <div style={{ padding: '6px 14px', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
            Powered by Google
          </div>
        </div>
      )}
    </div>
  );
}
