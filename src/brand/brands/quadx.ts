import type { Brand } from '../types';

/**
 * QuadX Inc. — white-label rebrand of the default LBC design system.
 * Colors and typography are intentionally identical to `lbcBrand`; only
 * brand-identifiable names and copy differ.
 */
export const quadxBrand: Brand = {
  key: 'quadx',
  colors: {
    primary: '#d32f2f',
    primaryLight: '#c62828',
    green: '#22c55e',
    amber: '#f59e0b',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    rose: '#f43f5e',
  },
  copy: {
    companyName: 'QuadX Inc.',
    shortName: 'QuadX',
    panelLabel: 'Admin Panel',
    loginSubtitle: 'Operations Admin Panel',
    pageTitle: 'QuadX Admin — Operations Dashboard',
    metaDescription:
      'Manage riders, manifests, and delivery stops for QuadX field operations',
    loginEmailHint: 'admin@quadx.xyz',
    demoCredentials: '',
    trackingPlaceholder: 'QDX-2025-XXXX',
  },
  font: { family: 'Inter' },
  identity: {
    /** Dark wordmark — readable on light surfaces. */
    logoUrl: '/brands/quadx/logo.png',
    /** Light wordmark — readable on dark surfaces (default admin theme). */
    logoDarkUrl: '/brands/quadx/logo-dark.png',
  },
};
