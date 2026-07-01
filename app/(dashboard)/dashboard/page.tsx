'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  completed: 'var(--green)',
  failed: 'var(--rose)',
  rts: 'var(--amber)',
  reschedule: 'var(--reschedule)',
  pending: 'var(--purple)',
  in_progress: 'var(--blue)',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="page-header"><div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Operations overview</p></div></div>
        <div className="kpi-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      </>
    );
  }

  if (!stats) return <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">Failed to load dashboard</div></div>;

  const stopData = [
    { label: 'Completed', value: stats.stops.completed, color: 'var(--green)' },
    { label: 'Failed', value: stats.stops.failed, color: 'var(--rose)' },
    { label: 'RTS', value: stats.stops.rts, color: 'var(--amber)' },
    { label: 'Rescheduled', value: stats.stops.reschedule, color: 'var(--reschedule)' },
    { label: 'In Progress', value: stats.stops.inProgress, color: 'var(--blue)' },
    { label: 'Pending', value: stats.stops.pending, color: 'var(--purple)' },
  ];
  const maxStop = Math.max(...stopData.map(d => d.value), 1);

  const donutTotal = stats.stops.completed + stats.stops.failed + stats.stops.rts + stats.stops.reschedule;
  const donutSegments = [
    { pct: donutTotal ? (stats.stops.completed / donutTotal) * 100 : 0, color: 'var(--green)', label: 'Delivered' },
    { pct: donutTotal ? (stats.stops.failed / donutTotal) * 100 : 0, color: 'var(--rose)', label: 'Failed' },
    { pct: donutTotal ? (stats.stops.rts / donutTotal) * 100 : 0, color: 'var(--amber)', label: 'RTS' },
    { pct: donutTotal ? (stats.stops.reschedule / donutTotal) * 100 : 0, color: 'var(--reschedule)', label: 'Rescheduled' },
  ];

  let cumulativeOffset = 0;
  const strokeWidth = 12;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time operations overview</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': 'var(--blue)' } as React.CSSProperties}>
          <div className="kpi-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>👥</div>
          <div className="kpi-label">Active Riders</div>
          <div className="kpi-value">{stats.riders.active}</div>
          <div className="kpi-sub">{stats.riders.total} total registered</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--purple)' } as React.CSSProperties}>
          <div className="kpi-icon" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>📋</div>
          <div className="kpi-label">Today&apos;s Manifests</div>
          <div className="kpi-value">{stats.manifests.today}</div>
          <div className="kpi-sub">{stats.manifests.active} currently active</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--green)' } as React.CSSProperties}>
          <div className="kpi-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>✓</div>
          <div className="kpi-label">Delivery Rate</div>
          <div className="kpi-value">{stats.deliveryRate}%</div>
          <div className="kpi-sub">{stats.stops.completed} of {stats.stops.completed + stats.stops.failed + stats.stops.rts + stats.stops.reschedule} attempted</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--amber)' } as React.CSSProperties}>
          <div className="kpi-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>💰</div>
          <div className="kpi-label">COD Collected</div>
          <div className="kpi-value">₱{stats.cod.totalCollected.toLocaleString()}</div>
          <div className="kpi-sub">₱{stats.cod.totalExpected.toLocaleString()} expected</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-card">
          <div className="chart-title">Stops by Status</div>
          <div className="bar-chart">
            {stopData.map(d => (
              <div key={d.label} className="bar-item">
                <div className="bar-value">{d.value}</div>
                <div className="bar" style={{ height: `${(d.value / maxStop) * 100}%`, background: d.color }} />
                <div className="bar-label">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Delivery Outcomes</div>
          <div className="donut-chart">
            <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              {donutSegments.map((seg, i) => {
                const dashLen = (seg.pct / 100) * circumference;
                const offset = (cumulativeOffset / 100) * circumference;
                cumulativeOffset += seg.pct;
                return (
                  <circle key={i} cx="70" cy="70" r={radius}
                    fill="none" stroke={seg.color} strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                    strokeDashoffset={-offset}
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                );
              })}
            </svg>
            <div className="donut-center">
              <div className="donut-center-value">{stats.deliveryRate}%</div>
              <div className="donut-center-label">Success</div>
            </div>
          </div>
          <div className="donut-legend">
            {donutSegments.map(s => (
              <div key={s.label} className="donut-legend-item">
                <div className="donut-legend-dot" style={{ background: s.color }} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="chart-card">
          <div className="chart-title">Recent Activity</div>
          <div className="activity-list">
            {stats.recentActivity.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}><div className="empty-text">No recent activity</div></div>
            ) : (
              stats.recentActivity.map((stop: any) => (
                <div key={stop.id || stop._id} className="activity-item">
                  <div className="activity-dot" style={{ background: STATUS_COLORS[stop.status] || 'var(--text-muted)' }} />
                  <div className="activity-info">
                    <div className="activity-title">{stop.order?.trackingNumber ?? stop.trackingNumber} — {stop.order?.recipientName ?? stop.recipient?.name ?? '—'}</div>
                    <div className="activity-sub">{stop.order?.addressText ?? stop.address?.text ?? '—'}</div>
                  </div>
                  <span className={`badge badge-${stop.status}`}>{stop.status.replace('_', ' ')}</span>
                  <div className="activity-time">{new Date(stop.updatedAt).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
