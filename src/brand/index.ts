import type { Brand } from './types';
import { lbcBrand } from './brands/lbc';
import { acmeBrand } from './brands/acme';
import { fedexBrand } from './brands/fedex';

export type { Brand } from './types';

/** Every available white-label brand, keyed by brand key. */
export const BRANDS: Record<string, Brand> = {
  lbc: lbcBrand,
  acme: acmeBrand,
  fedex: fedexBrand,
};

export const DEFAULT_BRAND = lbcBrand;

/**
 * Resolves the active brand.
 *
 * Selection order: explicit key argument (runtime switcher) >
 * `NEXT_PUBLIC_BRAND` (per-deployment) > default (LBC).
 */
export function getBrand(key?: string): Brand {
  const resolved = (key ?? process.env.NEXT_PUBLIC_BRAND ?? '').toLowerCase();
  return BRANDS[resolved] ?? DEFAULT_BRAND;
}
