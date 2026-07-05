import type { Brand } from './types';

/**
 * Produces the brand-specific CSS custom properties. Injected server-side into
 * `<head>` (no flash) and also applied at runtime by the BrandSwitcher.
 *
 * Only brand-variable tokens are emitted here; the rest of the design system
 * (spacing, neutrals, dark/light surfaces) stays in `globals.css`.
 */
export function generateBrandCSS(brand: Brand): string {
  const c = brand.colors;
  return `:root{
  --brand-primary:${c.primary};
  --green:${c.green};
  --amber:${c.amber};
  --blue:${c.blue};
  --purple:${c.purple};
  --rose:${c.rose};
}
[data-theme="light"]{
  --brand-primary:${c.primaryLight};
}`;
}

/** Map of brand CSS variables for client-side (runtime switcher) application. */
export function brandCSSVars(brand: Brand, theme: 'dark' | 'light'): Record<string, string> {
  const c = brand.colors;
  return {
    '--brand-primary': theme === 'light' ? c.primaryLight : c.primary,
    '--green': c.green,
    '--amber': c.amber,
    '--blue': c.blue,
    '--purple': c.purple,
    '--rose': c.rose,
  };
}
