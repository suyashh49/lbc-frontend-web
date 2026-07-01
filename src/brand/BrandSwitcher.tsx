'use client';

import { BRANDS } from './index';
import { useBrand } from './BrandProvider';

/**
 * Debug-only control to switch the active white-label brand at runtime, for
 * live client pitches. Renders nothing in production builds.
 */
export function BrandSwitcher() {
  const { brand, setBrandKey } = useBrand();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'var(--text-muted)',
        padding: '8px 0',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--brand-primary)',
          flexShrink: 0,
        }}
      />
      Brand
      <select
        value={brand.key}
        onChange={(e) => setBrandKey(e.target.value)}
        style={{
          flex: 1,
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 6px',
          fontSize: 12,
        }}
      >
        {Object.values(BRANDS).map((b) => (
          <option key={b.key} value={b.key}>
            {b.copy.companyName}
          </option>
        ))}
      </select>
    </label>
  );
}
