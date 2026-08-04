'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useBrand } from '@/brand/BrandProvider';
import { BrandSwitcher } from '@/brand/BrandSwitcher';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label: 'Orders', href: '/orders', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  { label: 'Riders', href: '/riders', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { label: 'Manifests', href: '/manifests', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg> },
  { label: 'Stops', href: '/stops', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  { label: 'Hubs & Zones', href: '/hubs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { brand } = useBrand();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {brand.identity.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.identity.logoUrl} alt={brand.copy.companyName} className="sidebar-logo-img" />
          ) : (
            <div className="sidebar-logo-icon">{brand.copy.shortName}</div>
          )}
          <div>
            {!brand.identity.logoUrl && <div className="sidebar-logo-text">{brand.copy.companyName}</div>}
            <div className="sidebar-logo-sub">{brand.copy.panelLabel}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} type="button">
          <span className="theme-toggle-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
          <div style={{ flex: 1 }} />
          <div className={`theme-toggle-track ${theme === 'light' ? 'active' : ''}`}>
            <div className="theme-toggle-thumb" />
          </div>
        </button>
        <BrandSwitcher />
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  );
}
