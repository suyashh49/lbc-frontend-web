import type { Brand } from '../types';

/** FedEx Express — FedEx corporate purple (#4D148C) + orange (#FF6600). */
export const fedexBrand: Brand = {
  key: 'fedex',
  colors: {
    primary: '#4d148c',
    primaryLight: '#3d0f73',
    green: '#22c55e',
    amber: '#ff6600',
    blue: '#3b82f6',
    purple: '#4d148c',
    rose: '#f43f5e',
  },
  copy: {
    companyName: 'FedEx Express',
    shortName: 'FedEx',
    panelLabel: 'Admin Panel',
    loginSubtitle: 'Operations Admin Panel',
    pageTitle: 'FedEx Admin — Operations Dashboard',
    metaDescription:
      'Manage riders, manifests, and delivery stops for FedEx Express field operations',
    loginEmailHint: 'admin@fedex.com',
    demoCredentials: '',
    trackingPlaceholder: '794643191234',
  },
  font: { family: 'Roboto' },
  identity: {},
};
