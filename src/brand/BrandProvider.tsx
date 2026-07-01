'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Brand } from './types';
import { getBrand } from './index';
import { brandCSSVars } from './css';

interface BrandContextType {
  brand: Brand;
  /** Switch the active brand at runtime (debug pitch tool). */
  setBrandKey: (key: string) => void;
}

const BrandContext = createContext<BrandContextType>({
  brand: getBrand(),
  setBrandKey: () => {},
});

const STORAGE_KEY = 'admin_brand';

function applyBrandVars(brand: Brand) {
  if (typeof document === 'undefined') return;
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const vars = brandCSSVars(brand, theme);
  for (const [k, v] of Object.entries(vars)) {
    document.documentElement.style.setProperty(k, v);
  }
}

export function BrandProvider({ children }: { children: ReactNode }) {
  // SSR + first paint use the build-time brand (NEXT_PUBLIC_BRAND); a persisted
  // runtime override (from the debug switcher) is applied after mount.
  const [brand, setBrand] = useState<Brand>(() => getBrand());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== brand.key) {
      const next = getBrand(stored);
      setBrand(next);
      applyBrandVars(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setBrandKey = (key: string) => {
    const next = getBrand(key);
    setBrand(next);
    localStorage.setItem(STORAGE_KEY, next.key);
    applyBrandVars(next);
  };

  return (
    <BrandContext.Provider value={{ brand, setBrandKey }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
