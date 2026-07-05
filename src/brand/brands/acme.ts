import type { Brand } from '../types';

/** Acme Logistics — sample second brand (deep blue) for pitching/demos. */
export const acmeBrand: Brand = {
  key: 'acme',
  colors: {
    primary: '#1a56db',
    primaryLight: '#1e40af',
    green: '#22c55e',
    amber: '#f59e0b',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    rose: '#f43f5e',
  },
  copy: {
    companyName: 'Acme Logistics',
    shortName: 'ACME',
    panelLabel: 'Admin Panel',
    loginSubtitle: 'Operations Admin Panel',
    pageTitle: 'Acme Admin — Operations Dashboard',
    metaDescription:
      'Manage riders, manifests, and delivery stops for Acme Logistics field operations',
    loginEmailHint: 'admin@acme.com',
    demoCredentials: '',
    trackingPlaceholder: 'ACM-2025-XXXX',
  },
  font: { family: 'Inter' },
  identity: {},
};
