'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { api } from '@/lib/api';
import { Stop, Manifest } from '@/types';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useBrand } from '@/brand/BrandProvider';

const EMPTY_FORM = {
  stopId: '', manifestId: '', trackingNumber: '', serviceType: 'Express Padala',
  recipientName: '', recipientPhone: '', addressText: '', addressLat: 0, addressLng: 0, addressGeocoded: false, codAmount: '0',
  packageDetails: '', specialInstructions: '',
};

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

export default function StopsPage() {
  const { brand } = useBrand();
  const [stops, setStops] = useState<Stop[]>([]);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [manifestFilter, setManifestFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStop, setEditStop] = useState<Stop | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Stop | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getStops({ search, status: statusFilter, manifestId: manifestFilter }),
      api.getManifests()
    ]).then(([s, m]) => { setStops(s.stops); setManifests(m.manifests); })
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, manifestFilter]);

  // Render static map for selected stop
  useEffect(() => {
    const ss = selectedStop as any;
    if (ss && (ss.order?.addressLat || ss.address?.lat) && (ss.order?.addressLng || ss.address?.lng) && mapRef.current && GOOGLE_MAPS_KEY) {
      const lat = ss.order?.addressLat ?? ss.address?.lat;
      const lng = ss.order?.addressLng ?? ss.address?.lng;
      mapRef.current.innerHTML = `<iframe width="100%" height="300" style="border:0;border-radius:14px" loading="lazy" src="https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${lat},${lng}&zoom=16"></iframe>`;
    }
  }, [selectedStop]);

  const getManifestId = (s: any) => {
    if (s.manifest?.manifestId) return s.manifest.manifestId;
    if (typeof s.manifestId === 'object' && s.manifestId !== null) return (s.manifestId as { manifestId: string }).manifestId;
    const m = manifests.find((m: any) => (m.id || m._id) === s.manifestId);
    return m?.manifestId || s.manifestId;
  };

  const openCreate = () => { setEditStop(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s: any) => {
    setEditStop(s);
    const mid = s.manifest?.id || (typeof s.manifestId === 'object' ? s.manifestId?.id || s.manifestId?._id : s.manifestId);
    const o = s.order || {};
    setForm({
      stopId: s.stopId, manifestId: mid, trackingNumber: o.trackingNumber ?? s.trackingNumber ?? '',
      serviceType: o.serviceType ?? s.serviceType ?? 'Express Padala',
      recipientName: o.recipientName ?? s.recipient?.name ?? '', recipientPhone: o.recipientPhone ?? s.recipient?.phone ?? '',
      addressText: o.addressText ?? s.address?.text ?? '',
      addressLat: o.addressLat ?? s.address?.lat ?? 0, addressLng: o.addressLng ?? s.address?.lng ?? 0,
      addressGeocoded: o.addressGeocoded ?? s.address?.geocoded ?? false,
      codAmount: String(o.codAmount ?? s.codAmount ?? 0), packageDetails: o.packageDetails ?? s.packageDetails ?? '',
      specialInstructions: o.specialInstructions ?? s.specialInstructions ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        stopId: form.stopId, manifestId: form.manifestId, trackingNumber: form.trackingNumber,
        serviceType: form.serviceType, codAmount: Number(form.codAmount),
        packageDetails: form.packageDetails, specialInstructions: form.specialInstructions,
        recipient: { name: form.recipientName, phone: form.recipientPhone },
        address: { text: form.addressText, lat: form.addressLat, lng: form.addressLng, geocoded: form.addressGeocoded },
      };
      if (editStop) {
        await api.updateStop((editStop as any).id || editStop._id, payload);
        showToast('Stop updated (geocoded automatically)');
      } else {
        await api.createStop(payload);
        showToast('Stop created (geocoded automatically)');
      }
      setShowModal(false); load();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await api.deleteStop((deleteTarget as any).id || deleteTarget._id); showToast('Stop deleted'); setDeleteTarget(null); load(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const updateStatus = async (stop: Stop, newStatus: string) => {
    try {
      await api.updateStop((stop as any).id || stop._id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      load();
    } catch { showToast('Failed to update status', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1 className="page-title">Stops</h1><p className="page-subtitle">Manage delivery stops with map preview</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Stop</button></div>
      </div>

      {/* Map preview for selected stop */}
      {selectedStop && (
        <div style={{ padding: '16px 32px 0' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{(selectedStop as any).order?.recipientName ?? (selectedStop as any).recipient?.name ?? '—'}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 12 }}>{(selectedStop as any).order?.addressText ?? (selectedStop as any).address?.text ?? '—'}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedStop(null)}>✕ Close</button>
            </div>
            <div ref={mapRef} className="map-container" style={{ borderRadius: 0 }} />
          </div>
        </div>
      )}

      <div className="table-container" style={{ paddingTop: 20 }}>
        <div className="table-toolbar">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="search-input" placeholder="Search tracking, recipient, address..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="rts">RTS</option><option value="reschedule">Rescheduled</option>
          </select>
          <select className="filter-select" value={manifestFilter} onChange={e => setManifestFilter(e.target.value)}>
            <option value="">All Manifests</option>
            {manifests.map((m: any) => <option key={m.id || m._id} value={m.id || m._id}>{m.manifestId}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Tracking</th><th>Manifest</th><th>Recipient</th><th>Address</th><th>Service</th><th>COD</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? [1,2,3].map(i => <tr key={i}><td colSpan={9}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
              : stops.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">📍</div><div className="empty-title">No stops found</div></div></td></tr>
              : stops.map((s: any) => (
                <tr key={s.id || s._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedStop(s)}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{s.sequence}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{s.order?.trackingNumber ?? s.trackingNumber}</td>
                  <td><span className="badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>{getManifestId(s)}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{s.order?.recipientName ?? s.recipient?.name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.order?.recipientPhone ?? s.recipient?.phone ?? ''}</div>
                  </td>
                  <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {s.order?.addressText ?? s.address?.text ?? '—'}
                    {(s.order?.addressGeocoded ?? s.address?.geocoded) && <span style={{ color: 'var(--green)', marginLeft: 4, fontSize: 10 }}>✓ geocoded</span>}
                  </td>
                  <td><span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>{s.order?.serviceType ?? s.serviceType}</span></td>
                  <td>{(s.order?.codAmount ?? s.codAmount ?? 0) > 0 ? `₱${(s.order?.codAmount ?? s.codAmount).toLocaleString()}` : '—'}</td>
                  <td>
                    <select className="filter-select" value={s.status} onChange={(e) => { e.stopPropagation(); updateStatus(s, e.target.value); }} onClick={e => e.stopPropagation()} style={{ fontSize: 11, padding: '4px 24px 4px 8px', minWidth: 110 }}>
                      <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="rts">RTS</option><option value="reschedule">Rescheduled</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={() => setDeleteTarget(s)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editStop ? 'Edit Stop' : 'New Stop'} onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? <span className="spinner" /> : editStop ? 'Update' : 'Create'}</button></>}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Stop ID</label><input className="form-input" value={form.stopId} onChange={e => setForm(f => ({...f, stopId: e.target.value}))} required disabled={!!editStop} placeholder="stop-016" /></div>
              <div className="form-group"><label className="form-label">Manifest</label>
                <select className="form-select" value={form.manifestId} onChange={e => setForm(f => ({...f, manifestId: e.target.value}))} required disabled={!!editStop}>
                  <option value="">Select manifest...</option>
                  {manifests.map((m: any) => <option key={m.id || m._id} value={m.id || m._id}>{m.manifestId}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Tracking Number</label><input className="form-input" value={form.trackingNumber} onChange={e => setForm(f => ({...f, trackingNumber: e.target.value}))} required placeholder={brand.copy.trackingPlaceholder} /></div>
              <div className="form-group"><label className="form-label">Service Type</label>
                <select className="form-select" value={form.serviceType} onChange={e => setForm(f => ({...f, serviceType: e.target.value}))}>
                  <option value="Express Padala">Express Padala</option><option value="Standard">Standard</option><option value="Same Day">Same Day</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Recipient Name</label><input className="form-input" value={form.recipientName} onChange={e => setForm(f => ({...f, recipientName: e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Recipient Phone</label><input className="form-input" value={form.recipientPhone} onChange={e => setForm(f => ({...f, recipientPhone: e.target.value}))} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Address (auto-geocoded)</label>
              <AddressAutocomplete
                value={form.addressText}
                onChange={val => setForm(f => ({...f, addressText: val, addressGeocoded: false}))}
                onSelect={place => setForm(f => ({...f, addressText: place.text, addressLat: place.lat, addressLng: place.lng, addressGeocoded: true}))}
                placeholder="123 Street, Barangay, City"
              />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">COD Amount (₱)</label><input className="form-input" type="number" value={form.codAmount} onChange={e => setForm(f => ({...f, codAmount: e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Package Details</label><input className="form-input" value={form.packageDetails} onChange={e => setForm(f => ({...f, packageDetails: e.target.value}))} placeholder="Small Pouch (0.5 kg)" /></div>
            </div>
            <div className="form-group"><label className="form-label">Special Instructions</label><textarea className="form-textarea" value={form.specialInstructions} onChange={e => setForm(f => ({...f, specialInstructions: e.target.value}))} placeholder="Leave with guard if not home" /></div>
          </form>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog title="Delete Stop?" message={`This will permanently delete stop ${deleteTarget.stopId} (${deleteTarget.trackingNumber}).`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </>
  );
}
