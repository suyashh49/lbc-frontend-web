import type { Brand } from '../types';

/** LBC Express — the default brand. Values mirror the original CSS exactly. */
export const lbcBrand: Brand = {
  key: 'lbc',
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
    companyName: 'LBC Express',
    shortName: 'LBC',
    panelLabel: 'Admin Panel',
    loginSubtitle: 'Operations Admin Panel',
    pageTitle: 'LBC Admin — Operations Dashboard',
    metaDescription:
      'Manage riders, manifests, and delivery stops for LBC Express field operations',
    loginEmailHint: 'admin@lbc.ph',
    demoCredentials: 'Demo: admin@lbc.ph / admin123',
    trackingPlaceholder: 'LBC-2025-XXXX',
  },
  font: { family: 'Inter' },
  identity: {},
};
