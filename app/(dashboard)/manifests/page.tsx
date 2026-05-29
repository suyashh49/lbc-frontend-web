'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Manifest, Rider } from '@/types';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ManifestsPage() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editManifest, setEditManifest] = useState<Manifest | null>(null);
  const [form, setForm] = useState({ manifestId: '', riderId: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Manifest | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getManifests({ search, status: statusFilter }),
      api.getRiders()
    ]).then(([m, r]) => { setManifests(m.manifests); setRiders(r.riders); })
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const getRiderName = (m: Manifest) => {
    if (typeof m.riderId === 'object' && m.riderId !== null) return (m.riderId as Rider).name;
    const r = riders.find(r => r.id === m.riderId);
    return r?.name || 'Unknown';
  };

  const getRiderEmpId = (m: Manifest) => {
    if (typeof m.riderId === 'object' && m.riderId !== null) return (m.riderId as Rider).employeeId;
    return '';
  };

  const openCreate = () => { setEditManifest(null); setForm({ manifestId: '', riderId: '', date: new Date().toISOString().split('T')[0] }); setShowModal(true); };
  const openEdit = (m: Manifest) => {
    setEditManifest(m);
    const rid = typeof m.riderId === 'object' ? (m.riderId as Rider).id : m.riderId;
    setForm({ manifestId: m.manifestId, riderId: rid, date: m.date.split('T')[0] });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editManifest) {
        await api.updateManifest(editManifest._id, { riderId: form.riderId, date: form.date });
        showToast('Manifest updated');
      } else {
        await api.createManifest(form);
        showToast('Manifest created');
      }
      setShowModal(false); load();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await api.deleteManifest(deleteTarget._id); showToast('Manifest deleted'); setDeleteTarget(null); load(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1 className="page-title">Manifests</h1><p className="page-subtitle">Manage delivery manifests</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Manifest</button></div>
      </div>

      <div className="table-container" style={{ paddingTop: 20 }}>
        <div className="table-toolbar">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="search-input" placeholder="Search manifest ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Manifest ID</th><th>Rider</th><th>Date</th><th>Status</th><th>Stops</th><th>Completed</th><th>Failed</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? [1,2,3].map(i => <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
              : manifests.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No manifests found</div></div></td></tr>
              : manifests.map(m => (
                <tr key={m._id}>
                  <td><Link href={`/manifests/${m._id}`} style={{ color: 'var(--brand-red)', fontWeight: 600, textDecoration: 'none' }}>{m.manifestId}</Link></td>
                  <td>
                    <div>{getRiderName(m)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getRiderEmpId(m)}</div>
                  </td>
                  <td>{new Date(m.date).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${m.status}`}>{m.status.replace('_', ' ')}</span></td>
                  <td style={{ fontWeight: 600 }}>{m.totalStops}</td>
                  <td style={{ color: 'var(--green)' }}>{m.completedStops}</td>
                  <td style={{ color: 'var(--rose)' }}>{m.failedStops}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/manifests/${m._id}`} className="btn btn-ghost btn-sm">View</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={() => setDeleteTarget(m)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editManifest ? 'Edit Manifest' : 'New Manifest'} onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? <span className="spinner" /> : editManifest ? 'Update' : 'Create'}</button></>}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Manifest ID</label><input className="form-input" value={form.manifestId} onChange={e => setForm(f => ({...f, manifestId: e.target.value}))} required disabled={!!editManifest} placeholder="DDR-002" /></div>
            <div className="form-group"><label className="form-label">Assign Rider</label>
              <select className="form-select" value={form.riderId} onChange={e => setForm(f => ({...f, riderId: e.target.value}))} required>
                <option value="">Select rider...</option>
                {riders.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.name} ({r.employeeId})</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required /></div>
          </form>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog title="Delete Manifest?" message={`This will permanently delete manifest ${deleteTarget.manifestId} and all associated stops.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </>
  );
}
