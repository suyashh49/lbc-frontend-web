'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Manifest, Rider, Stop } from '@/types';

export default function ManifestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getManifest(id).then(d => setManifest(d.manifest)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!manifest) return <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">Manifest not found</div></div>;

  const rider = (manifest as any).rider || manifest.riderId as Rider;
  const stops = (manifest.stops || []) as any[];
  const progress = manifest.totalStops > 0 ? Math.round(((manifest.completedStops + manifest.failedStops) / manifest.totalStops) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Link href="/manifests" className="btn btn-ghost btn-sm">← Back</Link>
            <h1 className="page-title">{manifest.manifestId}</h1>
            <span className={`badge badge-${manifest.status}`}>{manifest.status.replace('_', ' ')}</span>
          </div>
          <p className="page-subtitle">Created {new Date(manifest.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="detail-label">Assigned Rider</div>
          <div className="detail-value">{rider?.name || 'Unknown'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{rider?.employeeId} · {typeof rider?.hub === 'object' ? rider?.hub?.name : rider?.hub ?? ''}</div>
        </div>
        <div className="card">
          <div className="detail-label">Date</div>
          <div className="detail-value">{new Date(manifest.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="card">
          <div className="detail-label">Progress</div>
          <div className="detail-value">{progress}%</div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {manifest.completedStops} completed · {manifest.failedStops} failed · {manifest.totalStops - manifest.completedStops - manifest.failedStops} remaining
          </div>
        </div>
        <div className="card">
          <div className="detail-label">Summary</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{manifest.completedStops}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Delivered</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--rose)' }}>{manifest.failedStops}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Failed</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)' }}>{manifest.totalStops - manifest.completedStops - manifest.failedStops}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pending</div></div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Stops ({stops.length})</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Tracking</th><th>Recipient</th><th>Address</th><th>Service</th><th>COD</th><th>Status</th></tr></thead>
            <tbody>
              {stops.length === 0 ? <tr><td colSpan={7}><div className="empty-state" style={{ padding: 32 }}><div className="empty-text">No stops in this manifest</div></div></td></tr>
              : stops.map((s: any) => (
                <tr key={s.id || s._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{s.sequence}</td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{s.order?.trackingNumber ?? s.trackingNumber}</td>
                  <td>
                    <div>{s.order?.recipientName ?? s.recipient?.name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.order?.recipientPhone ?? s.recipient?.phone ?? ''}</div>
                  </td>
                  <td style={{ maxWidth: 220, fontSize: 12, color: 'var(--text-secondary)' }}>{s.order?.addressText ?? s.address?.text ?? '—'}</td>
                  <td><span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>{s.order?.serviceType ?? s.serviceType}</span></td>
                  <td>{(s.order?.codAmount ?? s.codAmount ?? 0) > 0 ? `₱${(s.order?.codAmount ?? s.codAmount).toLocaleString()}` : '—'}</td>
                  <td><span className={`badge badge-${s.status}`}>{s.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
